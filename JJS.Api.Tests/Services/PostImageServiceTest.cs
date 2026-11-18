using ImageMagick;
using JJS.Api.Services;
using Microsoft.AspNetCore.Http;
using NSubstitute;

namespace JJS.Api.Tests.Services;

[TestFixture]
public class PostImageServiceTest
{
   private string _rootPath = null!;

   [SetUp]
   public void SetUp() =>
      _rootPath = Path.Combine(Path.GetTempPath(), $"jjs-post-image-test-{Guid.NewGuid():N}");

   [TearDown]
   public void TearDown()
   {
      if (Directory.Exists(_rootPath))
         Directory.Delete(_rootPath, recursive: true);
   }

   [Test]
   public async Task Upload_ResizesImageAndWritesJpegWithCopyrightMetadata()
   {
      using var content = new MemoryStream();
      using (var source = new MagickImage(MagickColors.White, 2400, 1200))
         source.Write(content, MagickFormat.Png);
      content.Position = 0;
      var file = new FormFile(content, 0, content.Length, "file", "post.png");
      var albumService = Substitute.For<IAlbumService>();
      albumService.AlbumRoot.Returns(_rootPath);
      var service = new PostImageService(albumService, new MetaDataService());

      var result = await service.Upload(file);

      var savedPath = Path.Combine(_rootPath, "PostImages", "post.jpg");
      Assert.That(result.Url, Is.EqualTo("/api/post-image/post.jpg"));
      Assert.That(result.FileName, Is.EqualTo("post.png"));
      using var savedImage = new MagickImage(savedPath);
      Assert.That(savedImage.Format, Is.EqualTo(MagickFormat.Jpeg));
      Assert.That(savedImage.Width, Is.EqualTo(1920));
      Assert.That(savedImage.Height, Is.EqualTo(960));
      Assert.That(savedImage.GetExifProfile()?.GetValue(ExifTag.Copyright)?.Value, Does.Contain("johnandjeri.com"));
   }
}
