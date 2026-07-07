using System.Text.RegularExpressions;
using JJS.Api.Models;
using JJS.Api.Models.Post;
using JJS.Api.Models.Album;
using File = JJS.Api.Models.Album.File;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IImageMatchService))]
public class ImageMatchService(IAlbumService albumService) : IImageMatchService
{
   private readonly IAlbumService _albumService = albumService;

   public async Task MatchImages(IEnumerable<PostViewModel> posts)
   {
      var rng = new Random();
      var usedPaths = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
      var rawPhotos = (await _albumService.GetFlatList()).Values.ToArray();

      // Tokenize every image once up front — avoids repeating 4 regex ops per image per post.
      var photos = rawPhotos
         .Select(img => new TokenizedPhoto(
            img,
            Tokenize(img.Title),
            Tokenize(Path.GetFileNameWithoutExtension(img.Name)),
            FolderTags(img.RelativePath).SelectMany(Tokenize)
                                         .ToHashSet(StringComparer.OrdinalIgnoreCase)
         ))
         .ToArray();

      // Reverse index: token → photo indices. Lets each post skip photos with zero token overlap.
      var tokenIndex = new Dictionary<string, List<int>>(StringComparer.OrdinalIgnoreCase);
      for (var i = 0; i < photos.Length; i++)
         foreach (var token in photos[i].AllTokens)
         {
            if (!tokenIndex.TryGetValue(token, out var bucket))
               tokenIndex[token] = bucket = [];
            bucket.Add(i);
         }

      foreach (var post in posts)
      {
         var postTitle   = Tokenize(post.Title);
         var postPreview = Tokenize(post.PreviewText);
         var postDate    = post.ReleaseDate ?? post.CreatedDate;

         // Gather candidates: images sharing at least one token with this post.
         var candidateIdx = new HashSet<int>();
         foreach (var token in postTitle.Concat(postPreview))
            if (tokenIndex.TryGetValue(token, out var bucket))
               foreach (var idx in bucket) candidateIdx.Add(idx);

         // Also include photos within date-proximity range (cheap arithmetic, no tokenizing).
         if (postDate.HasValue)
            for (var i = 0; i < photos.Length; i++)
               if (Math.Abs((photos[i].File.CreatedOn - postDate.Value).TotalDays) <= 60)
                  candidateIdx.Add(i);

         // Title-match shortcut: filename ⊇ title tokens OR filename ⊆ title tokens (non-empty).
         File? titleMatch = null;
         if (postTitle.Count > 0)
         {
            foreach (var idx in candidateIdx)
            {
               if (usedPaths.Contains(photos[idx].File.HttpPath)) continue;
               var name = photos[idx].Name;
               if (postTitle.IsSubsetOf(name) || (name.Count > 0 && name.IsSubsetOf(postTitle)))
               {
                  titleMatch = photos[idx].File;
                  break;
               }
            }
         }

         if (titleMatch is not null)
         {
            post.ImageUrl = titleMatch.HttpPath;
            usedPaths.Add(titleMatch.HttpPath);
            continue;
         }

         // Score only the candidate subset.
         var bestIdx   = -1;
         var bestScore = 14; // threshold is >= 15
         foreach (var idx in candidateIdx)
         {
            if (usedPaths.Contains(photos[idx].File.HttpPath)) continue;
            var score = ScoreImage(photos[idx], postTitle, postPreview, post.Title, postDate);
            if (score <= bestScore) continue;
            bestScore = score;
            bestIdx   = idx;
         }

         var winner = bestIdx >= 0
            ? photos[bestIdx].File
            : photos.Where(p => !usedPaths.Contains(p.File.HttpPath))
                    .OrderBy(_ => rng.Next()).FirstOrDefault()?.File
              ?? photos.OrderBy(_ => rng.Next()).FirstOrDefault()?.File;

         if (winner is not null)
         {
            post.ImageUrl = winner.HttpPath;
            usedPaths.Add(winner.HttpPath);
         }
      }
   }

   private static int ScoreImage(
      TokenizedPhoto img,
      HashSet<string> postTitle,
      HashSet<string> postPreview,
      string? rawPostTitle,
      DateTime? postDate)
   {
      int score = 0;

      // Exact EXIF title ↔ post title
      if (string.Equals(img.File.Title, rawPostTitle, StringComparison.OrdinalIgnoreCase))
         score += 1000;

      // EXIF title tokens
      score += img.Title.Sum(t => postTitle.Contains(t)   ? t.Length * t.Length * 2 : 0);
      score += img.Title.Sum(t => postPreview.Contains(t) ? t.Length * t.Length : 0);

      // Folder path tokens (implicit category tags)
      score += img.Folders.Sum(t => postTitle.Contains(t)   ? t.Length * t.Length * 2 : 0);
      score += img.Folders.Sum(t => postPreview.Contains(t) ? t.Length * t.Length : 0);

      // Filename tokens
      score += img.Name.Sum(t => postTitle.Contains(t)   ? t.Length * t.Length * 2 : 0);
      score += img.Name.Sum(t => postPreview.Contains(t) ? t.Length * t.Length : 0);

      // Date proximity bonus
      if (postDate.HasValue)
      {
         var days = Math.Abs((img.File.CreatedOn - postDate.Value).TotalDays);
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
}

record TokenizedPhoto(
   File File,
   HashSet<string> Title,
   HashSet<string> Name,
   HashSet<string> Folders)
{
   public IEnumerable<string> AllTokens => Title.Concat(Name).Concat(Folders);
}

public interface IImageMatchService
{
   Task MatchImages(IEnumerable<PostViewModel> posts);
}
