using JJS.Api.Models;
using JJS.Api.Models.Album;
using JJS.Api.Models.Configuration;
using JJS.Api.Services.Cache;
using JJS.Api.Services.External;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace JJS.Api.Services
{
   [ServiceImplementation(typeof(AlbumService))]
   public class AlbumService
   {
      private readonly ITagData _tagData;
      private readonly AppConfig _appConfig;
      private readonly IHttpContextAccessor _httpContextAccessor;
      private readonly ICacheService _cacheService;

      private readonly string _albumRoot;
      private readonly string _siteRoot;
      private string[] _filters = new[] { "*.jpg", "*.png", "*.gif" };

      public AlbumService(ITagData tagData,
         AppConfig appConfig,
         IHttpContextAccessor httpContextAccessor,
         ICacheService cacheService)
      {
         _tagData = tagData;
         _appConfig = appConfig;
         _httpContextAccessor = httpContextAccessor;
         _albumRoot = Path.Combine(appConfig.RootPath, "Album");
         _siteRoot = appConfig.RootPath;
         _cacheService = cacheService;
      }

      public Folder Get()
      {
         var folder = _cacheService.GetCachedValue(GetFolderFromPath, _albumRoot, _albumRoot);
         var rootFolder = folder.Result;
         return rootFolder;
      }

      private Task<Folder> GetFolderFromPath(string path)
      {
         DirectoryInfo dirInfo = new DirectoryInfo(path);
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
               photoList.Add(GetPhotoInfo(fileInfo));
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

         return Task.FromResult(folder);
      }

      private Models.Album.File GetPhotoInfo(FileInfo fileInfo)
      {
         var tagData = _tagData.GetMetadata(fileInfo.FullName);
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
            Title = tagData.Title,
            Comment = tagData.Comment
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
}
