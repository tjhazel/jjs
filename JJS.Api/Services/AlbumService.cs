using System.Text.Json;
using JJS.Api.Models;
using JJS.Api.Models.Album;
using JJS.Api.Models.Configuration;
using JJS.Api.Repositories;
using JJS.Api.Services.Cache;
using File = JJS.Api.Models.Album.File;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IAlbumService))]
public class AlbumService(IMetaDataService tagData,
      AppConfig appConfig,
      IHttpContextAccessor httpContextAccessor,
      ICacheService cacheService,
      IAttachmentRepository attachmentRepository): IAlbumService
{
   private readonly IMetaDataService _tagData = tagData;
   private readonly AppConfig _appConfig = appConfig;
   private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
   private readonly ICacheService _cacheService = cacheService;
   private readonly IAttachmentRepository _attachmentRepository = attachmentRepository;

   private readonly string[] _filters = ["*.jpg", "*.png", "*.gif"];

   private static readonly JsonSerializerOptions _jsonOptions = new() { WriteIndented = false };

   public string AlbumRoot => Path.Combine(_appConfig.RootPath, "Albums");

   // L1: memory cache → L2: Attachments table → L3: full filesystem scan
   public async Task<Folder> Get()
   {
      if (_cacheService.TryGetValue(AlbumRoot, out Folder cached).Result)
         return cached;

      try
      {
         var row = await _attachmentRepository.GetByName(CacheKey.AlbumCacheName);
         if (row?.Content?.Length > 0)
         {
            var folder = JsonSerializer.Deserialize<Folder>(row.Content, _jsonOptions);
            if (folder != null)
            {
               await _cacheService.Set(AlbumRoot, DateTime.UtcNow.AddDays(365), folder);
               return folder;
            }
         }
      }
      catch { /* stale or unreadable row — fall through to full scan */ }

      return await BuildAndSaveCacheAsync();
   }

   public async Task<Folder> Refresh()
   {
      await _cacheService.Clear(AlbumRoot);

      var thumbDir = Path.Combine(AlbumRoot, ".thumbs");
      if (Directory.Exists(thumbDir))
         Directory.Delete(thumbDir, recursive: true);

      return await BuildAndSaveCacheAsync();
   }

   private async Task<Folder> BuildAndSaveCacheAsync()
   {
      var folder = await GetFolderFromPath(AlbumRoot);

      try
      {
         var bytes = JsonSerializer.SerializeToUtf8Bytes(folder, _jsonOptions);
         await _attachmentRepository.Upsert(new Attachment
         {
            Name     = CacheKey.AlbumCacheName,
            FileName = $"{CacheKey.AlbumCacheName}.json",
            FileSize = bytes.Length,
            ContentType = "application/json",
            Content  = bytes
         });
      }
      catch (Exception ex)
      {
         Console.WriteLine($"[AlbumService] Failed to persist album cache to DB: {ex.Message}");
      }

      await _cacheService.Set(AlbumRoot, DateTime.UtcNow.AddDays(365), folder);
      return folder;
   }

   public async Task<Dictionary<string, File>> GetFlatList()
   {
      var folder = await Get();
      Dictionary<string, File> flattened = new();

      ProcessFolder(flattened, folder);

      return flattened;
   }

   /// <summary>
   /// used to create a flat list that is easy to search through
   /// </summary>
   /// <param name="flattened"></param>
   /// <param name="folder"></param>
   public void ProcessFolder(Dictionary<string, File> flattened, Folder folder)
   {
      if (folder?.Files != null)
      {
         foreach (var file in folder.Files)
         {
            flattened.TryAdd(file.RelativePath ?? file.Name, file);
         }
      }
      if (folder?.Folders != null)
      {
         foreach (var subFolder in folder.Folders)
         {
            ProcessFolder(flattened, subFolder);
         }
      }
   }

   private async Task<Folder> GetFolderFromPath(string path)
   {
      DirectoryInfo dirInfo = new DirectoryInfo(path);
      if (!dirInfo.Exists)
      {
         return null;
      }

      Folder folder = new Folder
      {
         Name = dirInfo.Name,
         FullName = dirInfo.FullName,
         CreatedOn = dirInfo.CreationTimeUtc,
         LastAccessTime = dirInfo.LastAccessTimeUtc,
         ModifiedOn = dirInfo.LastWriteTimeUtc,
         RelativePath = GetRelativePath(dirInfo.FullName)
      };
      var photoList = new List<Models.Album.File>();

      foreach (var filter in _filters)
      {
         foreach (var fileInfo in dirInfo.GetFiles(filter, SearchOption.TopDirectoryOnly).Where(f => f.Length > 0))
         {
            //TODO: consider busting this up to allow parallel processing
            photoList.Add(await GetPhotoInfo(fileInfo));
         }
      }

      if (photoList.Any())
      {
         folder.Files = photoList;
      }

      var subFolders = new List<Folder>();
      foreach (var dir in dirInfo.GetDirectories().Where(d => !d.Name.Equals(".thumbs", StringComparison.OrdinalIgnoreCase)))
      {
         // recursion to same function.
         Folder subfolder = GetFolderFromPath(dir.FullName).Result;
        // subfolder.RelativePath = GetRelativePath(dir.FullName);
         subFolders.Add(subfolder);
      }
      if (subFolders.Any())
      {
         folder.Folders = subFolders;
      }

      return await Task.FromResult(folder);
   }

   private async Task<Models.Album.File> GetPhotoInfo(FileInfo fileInfo)
   {
      var tagData = await _tagData.GetMetadata(fileInfo.FullName);
      var relativePath = GetRelativePath(fileInfo.FullName);

      var photo = new Models.Album.File
      {
         Name = fileInfo.Name,
         FullName = fileInfo.FullName,
         RelativePath = relativePath,
         HttpPath = GetHttpPath(relativePath),
         ThumbHttpPath = GetThumbHttpPath(relativePath),
         CreatedOn = fileInfo.CreationTimeUtc,
         ModifiedOn = fileInfo.LastWriteTimeUtc,
         LastAccessTime = fileInfo.LastAccessTimeUtc,
         Title = tagData?.Title ?? fileInfo.Name,
         Comment = tagData?.Comment ?? ""
      };

      return photo;
   }

   public string GetRelativePath(string path)
   {
      var relativePath = $"/Image/{path.Replace(AlbumRoot, "").Replace(Path.DirectorySeparatorChar, '/').Trim('/')}";
      return relativePath;
   }

   public string GetHttpPath(string path)
   {
      var request = _httpContextAccessor.HttpContext.Request;
      var baseURL = $"{request.Scheme}://{request.Host}";
      var relativePath = $"{path.Replace(AlbumRoot, "").Replace(Path.DirectorySeparatorChar, '/').Trim('/')}";
      var fullUrl = $"{baseURL}/{relativePath}";
      return fullUrl;
   }

   private string GetThumbHttpPath(string relativePath)
   {
      // relativePath = /Image/Trips/Paris/DSC001.png
      // result:        https://host/api/thumbnail/Trips/Paris/DSC001.png
      var request = _httpContextAccessor.HttpContext.Request;
      var baseUrl = $"{request.Scheme}://{request.Host}";
      var stripped = relativePath.TrimStart('/').Replace("Image/", "", StringComparison.OrdinalIgnoreCase).TrimStart('/');
      return $"{baseUrl}/api/thumbnail/{stripped}";
   }

   public string GetFullFilePath(string relativePath)
   {
      string newPath = Path.Combine(AlbumRoot, relativePath);
      return newPath;
   }

   public string GetContentType(string path)
   {
      var ext = (Path.GetExtension(path)??".").ToLower();
      string contentType = "image/jpeg";
      switch (ext) 
      {
         case ".jpg":
         {
               contentType = "image/jpeg";
               break;
         }
         case ".gif":
            {
               contentType = "image/gif";
               break;
            }
         case ".png":
            {
               contentType = "image/png";
               break;
            }
      }
      return contentType;
   }

   private string GetBaseUrl()
   {
      var request = _httpContextAccessor.HttpContext.Request;
      var baseURL = $"{request.Scheme}://{request.Host}";

      return baseURL;
   }
}


public interface IAlbumService
{
   string AlbumRoot { get; }
   Task <Folder> Get();
   Task<Folder> Refresh();
   Task<Dictionary<string, File>> GetFlatList();
   string GetFullFilePath(string relativePath);
   string GetContentType(string path);
}
