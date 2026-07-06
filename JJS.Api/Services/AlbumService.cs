using System.Text.Json;
using JJS.Api.Models;
using JJS.Api.Models.Album;
using JJS.Api.Models.Configuration;
using JJS.Api.Services.Cache;
using File = JJS.Api.Models.Album.File;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IAlbumService))]
public class AlbumService(IMetaDataService tagData,
      AppConfig appConfig,
      IHttpContextAccessor httpContextAccessor,
      ICacheService cacheService): IAlbumService
{
   private readonly IMetaDataService _tagData = tagData;
   private readonly AppConfig _appConfig = appConfig;
   private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
   private readonly ICacheService _cacheService = cacheService;

   private readonly string _albumRoot = Path.Combine(appConfig.RootPath, "Albums");
   private readonly string _siteRoot = appConfig.RootPath;
   private readonly string _cacheFilePath = Path.Combine(appConfig.RootPath, "album-cache.json");
   private readonly string[] _filters = ["*.jpg", "*.png", "*.gif"];

   private static readonly JsonSerializerOptions _jsonOptions = new() { WriteIndented = false };

   // Tested once per process lifetime; null = not yet checked.
   private static bool? _fileSystemWritable = null;

   private bool CanWriteFiles()
   {
      if (_fileSystemWritable.HasValue) return _fileSystemWritable.Value;

      try
      {
         var probe = Path.Combine(_appConfig.RootPath, ".write-probe");
         System.IO.File.WriteAllText(probe, "probe");
         System.IO.File.Delete(probe);
         _fileSystemWritable = true;
      }
      catch
      {
         _fileSystemWritable = false;
         Console.WriteLine("[AlbumService] File system is read-only — album cache will be memory-only.");
      }

      return _fileSystemWritable.Value;
   }

   // L1: memory cache → L2: JSON file (writable hosts only) → L3: full filesystem scan
   public async Task<Folder> Get()
   {
      if (_cacheService.TryGetValue(_albumRoot, out Folder cached).Result)
         return cached;

      if (CanWriteFiles() && System.IO.File.Exists(_cacheFilePath))
      {
         try
         {
            var json = await System.IO.File.ReadAllTextAsync(_cacheFilePath);
            var folder = JsonSerializer.Deserialize<Folder>(json, _jsonOptions);
            if (folder != null)
            {
               await _cacheService.Set(_albumRoot, DateTime.UtcNow.AddDays(365), folder);
               return folder;
            }
         }
         catch { /* corrupted cache file — fall through to full scan */ }
      }

      return await BuildAndSaveCacheAsync();
   }

   public async Task<Folder> Refresh()
   {
      await _cacheService.Clear(_albumRoot);
      return await BuildAndSaveCacheAsync();
   }

   private async Task<Folder> BuildAndSaveCacheAsync()
   {
      var folder = await GetFolderFromPath(_albumRoot);

      if (CanWriteFiles())
      {
         try
         {
            var json = JsonSerializer.Serialize(folder, _jsonOptions);
            await System.IO.File.WriteAllTextAsync(_cacheFilePath, json);
         }
         catch
         {
            _fileSystemWritable = false; // flip the flag if the probe passed but the real write fails
            Console.WriteLine("[AlbumService] Failed to write album cache file — falling back to memory-only.");
         }
      }

      await _cacheService.Set(_albumRoot, DateTime.UtcNow.AddDays(365), folder);
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
         foreach (var fileInfo in dirInfo.GetFiles(filter, SearchOption.TopDirectoryOnly))
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
      foreach (var dir in dirInfo.GetDirectories())
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
      var relativePath = $"/Image/{path.Replace(_albumRoot, "").Replace(Path.DirectorySeparatorChar, '/').Trim('/')}";
      return relativePath;
   }

   public string GetHttpPath(string path)
   {
      var request = _httpContextAccessor.HttpContext.Request;
      var baseURL = $"{request.Scheme}://{request.Host}";
      var relativePath = $"{path.Replace(_albumRoot, "").Replace(Path.DirectorySeparatorChar, '/').Trim('/')}";
      var fullUrl = $"{baseURL}/{relativePath}";
      return fullUrl;
   }

   public string GetFullFilePath(string relativePath)
   {
      string newPath = Path.Combine(_albumRoot, relativePath);
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
   Task<Folder> Get();
   Task<Folder> Refresh();
   Task<Dictionary<string, File>> GetFlatList();
   string GetFullFilePath(string relativePath);
   string GetContentType(string path);
}
