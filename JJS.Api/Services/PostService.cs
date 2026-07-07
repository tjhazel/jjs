using System.Text.RegularExpressions;
using JJS.Api.Models;
using JJS.Api.Models.People;
using JJS.Api.Models.Post;
using JJS.Api.Repositories;
using JJS.Api.Services.Cache;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IPostService))]
public class PostService(
   IPostRepository postRepository,
   IAlbumService albumService,
   IUserService userService,
   ICacheService cacheService) : IPostService
{
   private readonly IPostRepository _postRepository = postRepository;
   private readonly IAlbumService _albumService = albumService;
   private readonly IUserService _userService = userService;
   private readonly ICacheService _cacheService = cacheService;

   public Task<IEnumerable<PostViewModel>> GetPublic()
   {
      return GetCachedImages("post/public", isPublic: true);
   }

   public async Task View(int postId)
   {
      await _postRepository.View(postId);
   }

   public Task<IEnumerable<PostViewModel>> GetAll()
   {
      return GetCachedImages("post/all", isPublic: false);
   }

   private Task<IEnumerable<PostViewModel>> GetCachedImages(string cacheKey, bool isPublic)
   {
      return _cacheService.GetCachedValue(async () =>
      {
         var allPosts = await _postRepository.GetAll(isPublic: isPublic);
         return await FixUpResults(allPosts);
      }, cacheKey);
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
      //var postBody       = Tokenize(post.Body);
      //var postCategories = (post.Categories ?? [])
      //                        .SelectMany(Tokenize)
      //                        .ToHashSet(StringComparer.OrdinalIgnoreCase);

      // Exact EXIF title ↔ post title
      if (string.Equals(img.Title, post.Title, StringComparison.OrdinalIgnoreCase))
         score += 1000;

      // EXIF title tokens
      score += imgTitle.Sum(t => postTitle.Contains(t)   ? t.Length * t.Length * 2 : 0);
      score += imgTitle.Sum(t => postPreview.Contains(t) ? t.Length * t.Length : 0);

      // Folder path tokens (implicit category tags)
      score += imgFolders.Sum(t => postTitle.Contains(t)   ? t.Length * t.Length * 2 : 0);
      score += imgFolders.Sum(t => postPreview.Contains(t) ? t.Length * t.Length : 0);

      // Filename tokens
      score += imgName.Sum(t => postTitle.Contains(t)   ? t.Length * t.Length * 2 : 0);
      score += imgName.Sum(t => postPreview.Contains(t) ? t.Length * t.Length : 0);

      // EXIF comment tokens
      score += imgComment.Sum(t => postTitle.Contains(t) ? t.Length * t.Length : 0);

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
      "it","its","we","you","my","our","i","he","she","they","be","have","has",
      "test", "image", "trips"
   };

   // Splits at non-alphanumeric chars, PascalCase boundaries, and letter↔digit transitions.
   private static readonly Regex _camelSplit =
      new(@"(?<=[a-z])(?=[A-Z])|(?<=[a-zA-Z])(?=\d)|(?<=\d)(?=[a-zA-Z])", RegexOptions.Compiled);

   private static HashSet<string> Tokenize(string? input)
   {
      if (string.IsNullOrWhiteSpace(input)) return [];
      var expanded = _camelSplit.Replace(input, " ");
      return [.. Regex.Split(expanded, @"[^a-zA-Z0-9]+")
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
