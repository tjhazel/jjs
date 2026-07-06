using System.Text.RegularExpressions;
using JJS.Api.Models;
using JJS.Api.Models.People;
using JJS.Api.Models.Post;
using JJS.Api.Repositories;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IPostService))]
public class PostService(
   IPostRepository postRepository, 
   IAlbumService albumService,
   IUserService userService) :IPostService
{
   private readonly IPostRepository _postRepository = postRepository;
   private readonly IAlbumService _albumService = albumService;
   private readonly IUserService _userService = userService;

   public async Task<IEnumerable<PostViewModel>> GetPublic()
   {
      var allPosts = await _postRepository.GetAll(isPublic: true);
      return await FixUpResults(allPosts);
   }

   public async Task View(int postId)
   {
      await _postRepository.View(postId);
   }

   public async Task<IEnumerable<PostViewModel>> GetAll()
   {
      var allPosts = await _postRepository.GetAll(isPublic: false);
      return await FixUpResults(allPosts);
   }

   private async Task<IEnumerable<PostViewModel>> FixUpResults(IEnumerable<PostViewModel> posts)
   {
      await MatchImages(posts);
      return posts
         .OrderByDescending(p => p.ReleaseDate ?? p.CreatedDate)
         .ToArray();
   }

   private async Task MatchImages(IEnumerable<PostViewModel> posts)
   {
      var rng = new Random();
      var usedPaths = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
      var photos = (await _albumService.GetFlatList()).Values.ToList();

      foreach (var post in posts)
      {
         var available = photos.Where(p => !usedPaths.Contains(p.HttpPath)).ToList();

         var best = available
            .Select(img => (img, score: ScoreImage(img, post)))
            .Where(x => x.score >= 15)
            .OrderByDescending(x => x.score)
            .FirstOrDefault();

         var winner = best.img
                      ?? available.OrderBy(_ => rng.Next()).FirstOrDefault()
                      ?? photos.OrderBy(_ => rng.Next()).FirstOrDefault();

         if (winner is not null)
         {
            post.ImageUrl = winner.HttpPath;
            usedPaths.Add(winner.HttpPath);
         }
      }
   }

   private static int ScoreImage(Models.Album.File img, PostViewModel post)
   {
      int score = 0;

      var imgTitle   = Tokenize(img.Title);
      var imgName    = Tokenize(Path.GetFileNameWithoutExtension(img.Name));
      var imgComment = Tokenize(img.Comment);
      var imgFolders = FolderTags(img.RelativePath)
                          .SelectMany(Tokenize)
                          .ToHashSet(StringComparer.OrdinalIgnoreCase);

      var postTitle      = Tokenize(post.Title);
      var postPreview    = Tokenize(post.PreviewText);
      var postBody       = Tokenize(post.Body);
      var postCategories = (post.Categories ?? [])
                              .SelectMany(Tokenize)
                              .ToHashSet(StringComparer.OrdinalIgnoreCase);

      // Exact EXIF title ↔ post title
      if (string.Equals(img.Title, post.Title, StringComparison.OrdinalIgnoreCase))
         score += 100;

      // EXIF title tokens
      score += imgTitle.Count(t => postTitle.Contains(t))      * 20;
      score += imgTitle.Count(t => postCategories.Contains(t)) * 15;
      score += imgTitle.Count(t => postPreview.Contains(t))    * 8;
      score += imgTitle.Count(t => postBody.Contains(t))       * 3;

      // Folder path tokens (implicit category tags)
      score += imgFolders.Count(t => postTitle.Contains(t))      * 20;
      score += imgFolders.Count(t => postCategories.Contains(t)) * 15;
      score += imgFolders.Count(t => postPreview.Contains(t))    * 8;
      score += imgFolders.Count(t => postBody.Contains(t))       * 3;

      // Filename tokens
      score += imgName.Count(t => postTitle.Contains(t))      * 10;
      score += imgName.Count(t => postCategories.Contains(t)) * 8;
      score += imgName.Count(t => postPreview.Contains(t))    * 4;

      // EXIF comment tokens
      score += imgComment.Count(t => postTitle.Contains(t))      * 8;
      score += imgComment.Count(t => postCategories.Contains(t)) * 6;

      // Date proximity bonus
      var postDate = post.ReleaseDate ?? post.CreatedDate;
      if (postDate.HasValue)
      {
         var days = Math.Abs((img.CreatedOn - postDate.Value).TotalDays);
         if (days <= 30) score += 15;
         else if (days <= 60) score += 8;
      }

      return score;
   }

   private static readonly HashSet<string> _stopWords = new(StringComparer.OrdinalIgnoreCase)
   {
      "the","a","an","and","or","but","in","on","at","to","for","of",
      "with","by","from","as","is","was","are","were","been","this","that",
      "it","its","we","you","my","our","i","he","she","they","be","have","has"
   };

   private static HashSet<string> Tokenize(string? input)
   {
      if (string.IsNullOrWhiteSpace(input)) return [];
      return [.. Regex.Split(input, @"[^a-zA-Z0-9]+")
         .Where(t => t.Length >= 3 && !_stopWords.Contains(t))];
   }

   private static IEnumerable<string> FolderTags(string relativePath) =>
      relativePath.Split('/', '\\', StringSplitOptions.RemoveEmptyEntries)
                  .Where(s => !s.Contains('.')
                           && !s.Equals("Image",  StringComparison.OrdinalIgnoreCase)
                           && !s.Equals("Albums", StringComparison.OrdinalIgnoreCase));

   public async Task<int> Save(Post model, ClaimsUser user)
   {
      var existingUser = await _userService.Get(user.Email);

      if (!model.PostId.HasValue)
      {
         model.CreatedDate = DateTime.UtcNow;
         model.CreatedByFk = existingUser?.Id;
      }
      model.ModifiedDate = DateTime.UtcNow;
      model.ModifiedByFk = existingUser?.Id;

      return await _postRepository.Save(model);
   }
}

public interface IPostService
{
   Task<IEnumerable<PostViewModel>> GetPublic();
   Task View(int postId);

   Task<IEnumerable<PostViewModel>> GetAll();
   Task<int> Save(Post model, ClaimsUser user);

}
