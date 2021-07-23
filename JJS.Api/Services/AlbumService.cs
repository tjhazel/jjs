using JJS.Api.Models;
using JJS.Api.Models.Album;
using JJS.Api.Models.Configuration;
using JJS.Api.Services.External;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace JJS.Api.Services
{
   [ServiceImplementation(typeof(AlbumService))]
   public class AlbumService
   {
      private readonly ITagData _tagData;
      private readonly AppConfig _appConfig;
      private readonly string _albumRoot;
      private string[] _filters = new[] { "*.jpg", "*.png", "*.gif" };

      public AlbumService(ITagData tagData,
         AppConfig appConfig)
      {
         _tagData = tagData;
         _appConfig = appConfig;
         _albumRoot = Path.Combine(appConfig.RootPath, "Album");
      }

      public Folder Get()
      {
         var rootFolder = GetFolderFromPath(_albumRoot);
         return rootFolder;
      }

      private Folder GetFolderFromPath(string path)
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
            Folder subfolder = GetFolderFromPath(dir.FullName);
           // subfolder.RelativePath = GetRelativePath(dir.FullName);
            subFolders.Add(subfolder);
         }
         if (subFolders.Any())
         {
            folder.Folders = subFolders;
         }

         return folder;
      }

      private Models.Album.File GetPhotoInfo(FileInfo fileInfo)
      {
         var tagData = _tagData.GetMetadata(fileInfo.FullName);
         var photo = new Models.Album.File
         {
            Name = fileInfo.Name,
            FullName = fileInfo.FullName,
            RelativePath = GetRelativePath(fileInfo.FullName),
            CreatedOn = fileInfo.CreationTimeUtc,
            ModifiedOn = fileInfo.LastWriteTimeUtc,
            LastAccessTime = fileInfo.LastAccessTimeUtc,
            Title = tagData.Title,
            Comment = tagData.Comment
         };

         return photo;
      }

      private string GetRelativePath(string path)
      {
         return path.Replace(_albumRoot, "").Replace(Path.DirectorySeparatorChar, '/').Trim('/');
      }
   }
}
