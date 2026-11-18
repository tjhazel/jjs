using ImageMagick;
using JJS.Api.Services;
using System.Text;

namespace JJS.Api.Tests.Services;

[TestFixture]
public class MetaDataServiceTest
{
   [Test]
   public void RefineImage_ResizesAndPreservesTextMetadata()
   {
      using var image = new MagickImage(MagickColors.White, 3000, 1500);
      var exif = new ExifProfile();
      exif.SetValue(ExifTag.ImageDescription, " Caption ");
      exif.SetValue(ExifTag.XPTitle, Encoding.Unicode.GetBytes("Title\0"));
      exif.SetValue(ExifTag.XPComment, Encoding.Unicode.GetBytes("Comment\0"));
      image.SetProfile(exif);

      new MetaDataService().RefineImage(image);

      Assert.That(image.Width, Is.EqualTo(1920));
      Assert.That(image.Height, Is.EqualTo(960));
      var refinedExif = image.GetExifProfile();
      Assert.That(refinedExif?.GetValue(ExifTag.ImageDescription)?.Value, Is.EqualTo("Caption"));
      Assert.That(Encoding.Unicode.GetString(refinedExif!.GetValue(ExifTag.XPTitle)!.Value), Is.EqualTo("Title\0"));
      Assert.That(Encoding.Unicode.GetString(refinedExif.GetValue(ExifTag.XPComment)!.Value), Is.EqualTo("Comment\0"));
      Assert.That(refinedExif.GetValue(ExifTag.Copyright)?.Value, Does.Contain("johnandjeri.com"));
   }

   [Test]
   public async Task GetMetadata_ReadsXpTitleAndComment()
   {
      var path = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid():N}.jpg");
      try
      {
         using (var image = new MagickImage(MagickColors.White, 40, 20))
         {
            var exif = new ExifProfile();
            exif.SetValue(ExifTag.XPTitle, Encoding.Unicode.GetBytes("Photo title\0"));
            exif.SetValue(ExifTag.XPComment, Encoding.Unicode.GetBytes("Photo comment\0"));
            image.SetProfile(exif);
            image.Write(path, MagickFormat.Jpeg);
         }

         var result = await new MetaDataService().GetMetadata(path);

         Assert.That(result?.Title, Is.EqualTo("Photo title"));
         Assert.That(result?.Comment, Is.EqualTo("Photo comment"));
      }
      finally
      {
         File.Delete(path);
      }
   }
}
