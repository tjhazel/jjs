using ImageMagick;
using JJS.Api.Services;
using NSubstitute;

namespace JJS.Api.Tests.Services;

[TestFixture]
public class ThumbnailServiceTest
{
   private string _albumRoot = null!;

   [SetUp]
   public void SetUp()
   {
      _albumRoot = Path.Combine(Path.GetTempPath(), $"jjs-thumbnail-test-{Guid.NewGuid():N}");
      Directory.CreateDirectory(_albumRoot);
   }

   [TearDown]
   public void TearDown()
   {
      if (Directory.Exists(_albumRoot))
         Directory.Delete(_albumRoot, recursive: true);
   }

   [Test]
   public async Task GetOrCreateThumbPathAsync_CreatesResizedJpegWithCopyright()
   {
      var sourcePath = Path.Combine(_albumRoot, "photo.png");
      using (var source = new MagickImage(MagickColors.White, 400, 800))
         source.Write(sourcePath, MagickFormat.Png);
      var staleThumbnailDirectory = Path.Combine(_albumRoot, ".thumbs");
      Directory.CreateDirectory(staleThumbnailDirectory);
      var staleThumbnailPath = Path.Combine(staleThumbnailDirectory, "photo.jpg");
      using (var staleThumbnail = new MagickImage(MagickColors.White, 200, 400))
      {
         var exif = new ExifProfile();
         exif.SetValue(ExifTag.Copyright, "© 2006 - 2025 johnandjeri.com");
         exif.SetValue(ExifTag.Software, "jjs-thumbnail-watermark-v6");
         staleThumbnail.SetProfile(exif);
         staleThumbnail.Write(staleThumbnailPath, MagickFormat.Jpeg);
      }

      var albumService = Substitute.For<IAlbumService>();
      albumService.AlbumRoot.Returns(_albumRoot);
      var service = new ThumbnailService(albumService);

      var result = await service.GetOrCreateThumbPathAsync("photo.png");

      Assert.That(result, Is.Not.Null);
      using var thumbnail = new MagickImage(result!);
      Assert.That(thumbnail.Format, Is.EqualTo(MagickFormat.Jpeg));
      Assert.That(thumbnail.Width, Is.EqualTo(200));
      Assert.That(thumbnail.Height, Is.EqualTo(400));
      Assert.That(thumbnail.GetExifProfile()?.GetValue(ExifTag.Copyright)?.Value, Does.Contain("johnandjeri.com"));
      Assert.That(thumbnail.GetExifProfile()?.GetValue(ExifTag.Software)?.Value, Is.EqualTo("jjs-thumbnail-watermark-v7"));

      var pixelDump = System.Text.Encoding.ASCII.GetString(thumbnail.ToByteArray(MagickFormat.Txt));
      var darkWatermarkPixels = pixelDump.Split('\n')
         .Skip(1)
         .Where(line =>
         {
            var coordinates = line.Split(':')[0].Split(',');
            return int.TryParse(coordinates[0], out var x) && x is >= 20 and <= 180
               && int.TryParse(coordinates[1], out var y) && y is >= 300 and <= 390;
         })
         .Count(line =>
         {
            var color = line.Split('(').Skip(1).FirstOrDefault()?.Split(')').FirstOrDefault();
            return color?.Split(',').Take(3).Any(channel =>
               int.TryParse(channel, out var value) && value < 245) == true;
         });
      Assert.That(
         darkWatermarkPixels,
         Is.GreaterThan(0),
         "The generated thumbnail should contain watermark pixels in the album viewer's centered crop.");
   }
}
