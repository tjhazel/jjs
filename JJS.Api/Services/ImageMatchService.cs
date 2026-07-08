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
      var postsList = posts.ToList();

      // Tokenize every image once up front — avoids repeating regex ops per image per post.
      var photos = rawPhotos
         .Select(img => new TokenizedPhoto(
            img,
            Tokenize(img.Title),
            Tokenize(Path.GetFileNameWithoutExtension(img.Name)),
            FolderTags(img.RelativePath).SelectMany(Tokenize)
                                         .ToHashSet(StringComparer.OrdinalIgnoreCase)
         ))
         .ToArray();

      // Phase 1: reserve title-match images before scoring or fallback can steal them.
      // Only the inverse direction is used here: all image-name tokens must appear in the post title.
      // The forward direction (all title tokens ⊆ image name) is too permissive — a post titled
      // "Snorkeling" would steal "Mudslides snorkeling pinguinos.jpg" — so it lives in Phase 2 as
      // a score bonus instead. Among qualifying images, the one with the most name tokens wins so
      // "mudslides snorkeling pinguinos" beats a bare "pinguinos" image for the same title.
      var needsScoring = new List<(PostViewModel post, HashSet<string> title, HashSet<string> preview)>();
      foreach (var post in postsList)
      {
         var postTitle   = Tokenize(post.Title);
         var postPreview = Tokenize(post.PreviewText);

         if (postTitle.Count > 0)
         {
            var match = photos
               .Where(p => !usedPaths.Contains(p.File.HttpPath)
                        && p.Name.Count > 0
                        && p.Name.IsSubsetOf(postTitle))
               .OrderByDescending(p => p.Name.Count)
               .FirstOrDefault();

            if (match is not null)
            {
               post.ImageUrl = match.File.HttpPath;
               usedPaths.Add(match.File.HttpPath);
               continue;
            }
         }

         needsScoring.Add((post, postTitle, postPreview));
      }

      if (needsScoring.Count == 0) return;

      // Reverse index: token → photo indices. Lets each post skip photos with zero token overlap.
      var tokenIndex = new Dictionary<string, List<int>>(StringComparer.OrdinalIgnoreCase);
      for (var i = 0; i < photos.Length; i++)
         foreach (var token in photos[i].AllTokens)
         {
            if (!tokenIndex.TryGetValue(token, out var bucket))
               tokenIndex[token] = bucket = [];
            bucket.Add(i);
         }

      // Phase 2: score remaining posts.
      foreach (var (post, postTitle, postPreview) in needsScoring)
      {
         var postDate = post.ReleaseDate ?? post.CreatedDate;

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

      // All post title tokens appear in the filename — forward title match bonus
      if (postTitle.Count > 0 && postTitle.IsSubsetOf(img.Name))
         score += 500;

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
      if (string.IsNullOrWhiteSpace(input)) return new HashSet<string>(StringComparer.OrdinalIgnoreCase);
      var expanded = _camelSplit.Replace(input, " ");
      return new HashSet<string>(
         Regex.Split(expanded, @"[^a-zA-Z0-9]+")
              .Where(t => t.Length >= 3 && !_stopWords.Contains(t)),
         StringComparer.OrdinalIgnoreCase);
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
