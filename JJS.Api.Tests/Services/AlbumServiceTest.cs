using JJS.Api.Models;
using JJS.Api.Models.Album;
using JJS.Api.Models.Configuration;
using JJS.Api.Repositories;
using JJS.Api.Services;
using JJS.Api.Tests.Fakes;
using Microsoft.AspNetCore.Http;
using NSubstitute;
using System.Text.Json;
using AlbumFile = JJS.Api.Models.Album.File;
using IOFile = System.IO.File;

namespace JJS.Api.Tests.Services;

[TestFixture]
public class AlbumServiceTest
{
    private IMetaDataService _metadata = null!;
    private IHttpContextAccessor _httpContextAccessor = null!;
    private IAttachmentRepository _attachmentRepo = null!;
    private FakeCacheService _cache = null!;
    private string _rootPath = null!;

    [SetUp]
    public void SetUp()
    {
        _metadata             = Substitute.For<IMetaDataService>();
        _httpContextAccessor  = Substitute.For<IHttpContextAccessor>();
        _attachmentRepo       = Substitute.For<IAttachmentRepository>();
        _cache                = new FakeCacheService();
        _rootPath             = Path.Combine(Path.GetTempPath(), $"jjs-album-test-{Guid.NewGuid()}");

        _metadata.GetMetadata(Arg.Any<string>())
                 .Returns(Task.FromResult<ImageTag?>(null));

        ConfigureHttpContext("http", "localhost");
    }

    [TearDown]
    public void TearDown()
    {
        if (Directory.Exists(_rootPath))
            Directory.Delete(_rootPath, recursive: true);
    }

    private void ConfigureHttpContext(string scheme, string host)
    {
        var request = Substitute.For<HttpRequest>();
        request.Scheme.Returns(scheme);
        request.Host.Returns(new HostString(host));
        var context = Substitute.For<HttpContext>();
        context.Request.Returns(request);
        _httpContextAccessor.HttpContext.Returns(context);
    }

    private AlbumService CreateService() => new(
        _metadata,
        new AppConfig { DbConnectionString = "Server=test", RootPath = _rootPath, HttpPath = "/" },
        _httpContextAccessor,
        _cache,
        _attachmentRepo
    );

    // ── GetContentType ──────────────────────────────────────────────────────

    [TestCase("photo.jpg", "image/jpeg")]
    [TestCase("photo.JPG", "image/jpeg")]   // case-insensitive
    [TestCase("photo.gif", "image/gif")]
    [TestCase("photo.png", "image/png")]
    [TestCase("photo.bmp", "image/jpeg")]   // unrecognised extension → default
    [TestCase("photo",     "image/jpeg")]   // no extension → default
    public void GetContentType_ReturnsExpectedMimeType(string fileName, string expected)
    {
        var svc = CreateService();
        Assert.That(svc.GetContentType(fileName), Is.EqualTo(expected));
    }

    // ── AlbumRoot ───────────────────────────────────────────────────────────

    [Test]
    public void AlbumRoot_IsRootPathCombinedWithAlbums()
    {
        var svc = CreateService();
        Assert.That(svc.AlbumRoot, Is.EqualTo(Path.Combine(_rootPath, "Albums")));
    }

    // ── GetRelativePath ─────────────────────────────────────────────────────

    [Test]
    public void GetRelativePath_FileUnderSubfolder_ReturnsImagePrefixedForwardSlashPath()
    {
        var svc      = CreateService();
        var filePath = Path.Combine(svc.AlbumRoot, "Family", "photo.jpg");

        var result = svc.GetRelativePath(filePath);

        Assert.That(result, Is.EqualTo("/Image/Family/photo.jpg"));
    }

    [Test]
    public void GetRelativePath_FileAtAlbumRootLevel_ReturnsImagePrefixedFileName()
    {
        var svc      = CreateService();
        var filePath = Path.Combine(svc.AlbumRoot, "photo.jpg");

        var result = svc.GetRelativePath(filePath);

        Assert.That(result, Is.EqualTo("/Image/photo.jpg"));
    }

    [Test]
    public void GetRelativePath_PathIsAlbumRootItself_ReturnsSlashImageSlash()
    {
        var svc    = CreateService();
        var result = svc.GetRelativePath(svc.AlbumRoot);
        Assert.That(result, Is.EqualTo("/Image/"));
    }

    // ── GetFullFilePath ─────────────────────────────────────────────────────

    [Test]
    public void GetFullFilePath_CombinesAlbumRootWithRelativePath()
    {
        var svc    = CreateService();
        var result = svc.GetFullFilePath("Family/photo.jpg");
        Assert.That(result, Is.EqualTo(Path.Combine(svc.AlbumRoot, "Family/photo.jpg")));
    }

    // ── GetHttpPath ─────────────────────────────────────────────────────────

    [Test]
    public void GetHttpPath_BuildsAbsoluteUrlFromRequestSchemeAndHost()
    {
        var svc    = CreateService();
        var result = svc.GetHttpPath("/Image/Family/photo.jpg");
        Assert.That(result, Is.EqualTo("http://localhost/Image/Family/photo.jpg"));
    }

    [Test]
    public void GetHttpPath_UsesSchemeAndHostFromHttpContext()
    {
        ConfigureHttpContext("https", "example.com");
        var svc    = CreateService();
        var result = svc.GetHttpPath("/Image/photo.jpg");
        Assert.That(result, Does.StartWith("https://example.com/"));
    }

    // ── ProcessFolder ───────────────────────────────────────────────────────

    [Test]
    public void ProcessFolder_NullFolder_DoesNotThrowOrModifyDictionary()
    {
        var svc  = CreateService();
        var dict = new Dictionary<string, AlbumFile>();

        svc.ProcessFolder(dict, null!); // asserts no exception by virtue of the test reaching the next line
        Assert.That(dict, Is.Empty);
    }

    [Test]
    public void ProcessFolder_FolderWithNoFilesOrSubfolders_LeavesEmpty()
    {
        var svc  = CreateService();
        var dict = new Dictionary<string, AlbumFile>();

        svc.ProcessFolder(dict, new Folder());

        Assert.That(dict, Is.Empty);
    }

    [Test]
    public void ProcessFolder_FolderWithFiles_AddsAllFilesKeyedByRelativePath()
    {
        var svc  = CreateService();
        var dict = new Dictionary<string, AlbumFile>();
        var folder = new Folder
        {
            Files = [
                new AlbumFile { Name = "a.jpg", RelativePath = "/Image/a.jpg" },
                new AlbumFile { Name = "b.jpg", RelativePath = "/Image/b.jpg" }
            ]
        };

        svc.ProcessFolder(dict, folder);

        Assert.That(dict, Has.Count.EqualTo(2));
        Assert.That(dict, Contains.Key("/Image/a.jpg"));
        Assert.That(dict, Contains.Key("/Image/b.jpg"));
    }

    [Test]
    public void ProcessFolder_FileWithNullRelativePath_FallsBackToNameAsKey()
    {
        var svc  = CreateService();
        var dict = new Dictionary<string, AlbumFile>();
        var file = new AlbumFile { Name = "photo.jpg", RelativePath = null };

        svc.ProcessFolder(dict, new Folder { Files = [file] });

        Assert.That(dict, Contains.Key("photo.jpg"));
    }

    [Test]
    public void ProcessFolder_DuplicateRelativePath_FirstEntryWins()
    {
        var svc    = CreateService();
        var dict   = new Dictionary<string, AlbumFile>();
        var first  = new AlbumFile { Name = "original.jpg",  RelativePath = "/Image/dup.jpg" };
        var second = new AlbumFile { Name = "duplicate.jpg", RelativePath = "/Image/dup.jpg" };

        svc.ProcessFolder(dict, new Folder { Files = [first, second] });

        Assert.That(dict, Has.Count.EqualTo(1));
        Assert.That(dict["/Image/dup.jpg"].Name, Is.EqualTo("original.jpg"));
    }

    [Test]
    public void ProcessFolder_NestedSubfolders_FlattenedRecursivelyIntoOneDictionary()
    {
        var svc  = CreateService();
        var dict = new Dictionary<string, AlbumFile>();
        var root = new Folder
        {
            Files = [new AlbumFile { RelativePath = "/Image/root.jpg" }],
            Folders = [
                new Folder
                {
                    Files = [new AlbumFile { RelativePath = "/Image/sub/child.jpg" }],
                    Folders = [
                        new Folder { Files = [new AlbumFile { RelativePath = "/Image/sub/deep/grandchild.jpg" }] }
                    ]
                }
            ]
        };

        svc.ProcessFolder(dict, root);

        Assert.That(dict, Has.Count.EqualTo(3));
        Assert.That(dict, Contains.Key("/Image/root.jpg"));
        Assert.That(dict, Contains.Key("/Image/sub/child.jpg"));
        Assert.That(dict, Contains.Key("/Image/sub/deep/grandchild.jpg"));
    }

    // ── Get ─────────────────────────────────────────────────────────────────

    [Test]
    public async Task Get_L1CacheHit_ReturnsCachedFolderWithoutHittingDatabase()
    {
        var svc      = CreateService();
        var expected = new Folder { Name = "cached" };
        _cache.Seed(svc.AlbumRoot, expected);

        var result = await svc.Get();

        Assert.That(result, Is.SameAs(expected));
        await _attachmentRepo.DidNotReceive().GetByName(Arg.Any<string>());
    }

    [Test]
    public async Task Get_L1Miss_L2HasValidJson_ReturnsDeserializedFolderAndPopulatesL1Cache()
    {
        var svc      = CreateService();
        var expected = new Folder { Name = "FamilyAlbum", RelativePath = "/Image/" };
        var json     = JsonSerializer.SerializeToUtf8Bytes(expected);
        _attachmentRepo.GetByName(CacheKey.AlbumCacheName)
                       .Returns(new Attachment { Content = json });

        var result = await svc.Get();

        Assert.That(result!.Name, Is.EqualTo("FamilyAlbum"));
        var l1Hit = _cache.TryGetValue<Folder>(svc.AlbumRoot, out var l1Value).Result;
        Assert.That(l1Hit,            Is.True);
        Assert.That(l1Value!.Name,    Is.EqualTo("FamilyAlbum"));
    }

    [Test]
    public async Task Get_L1Miss_L2ReturnsNull_FallsThroughToFilesystemScanAndUpserts()
    {
        var svc = CreateService();
        _attachmentRepo.GetByName(Arg.Any<string>()).Returns((Attachment?)null);

        var result = await svc.Get();

        // Albums dir does not exist → GetFolderFromPath returns null
        Assert.That(result, Is.Null);
        await _attachmentRepo.Received(1).Upsert(Arg.Any<Attachment>());
    }

    [Test]
    public async Task Get_L1Miss_L2ContentIsEmpty_FallsThroughToFilesystem()
    {
        var svc = CreateService();
        _attachmentRepo.GetByName(Arg.Any<string>())
                       .Returns(new Attachment { Content = Array.Empty<byte>() });

        var result = await svc.Get();

        Assert.That(result, Is.Null);
    }

    [Test]
    public async Task Get_L1Miss_L2JsonDeserializesToNull_FallsThroughToFilesystem()
    {
        var svc = CreateService();
        // JSON "null" is valid but Deserialize<Folder> returns null — triggers fallback
        _attachmentRepo.GetByName(Arg.Any<string>())
                       .Returns(new Attachment { Content = "null"u8.ToArray() });

        var result = await svc.Get();

        Assert.That(result, Is.Null);
    }

    [Test]
    public async Task Get_L1Miss_L2HasCorruptJson_FallsThroughSilentlyToFilesystem()
    {
        var svc = CreateService();
        _attachmentRepo.GetByName(Arg.Any<string>())
                       .Returns(new Attachment { Content = "{not: valid]}}"u8.ToArray() });

        // JsonException is swallowed by the catch { } in Get(); fallback scan runs
        Assert.DoesNotThrowAsync(async () => await svc.Get());
    }

    [Test]
    public async Task Get_BothCachesMiss_ScansFilesystemBuildsHierarchyAndUpserts()
    {
        // Arrange: real albums dir with a nested subfolder
        var albumsDir  = Path.Combine(_rootPath, "Albums");
        var vacationDir = Path.Combine(albumsDir, "Vacation");
        Directory.CreateDirectory(vacationDir);
        await IOFile.WriteAllBytesAsync(Path.Combine(albumsDir,   "root.jpg"),    [0xFF]);
        await IOFile.WriteAllBytesAsync(Path.Combine(vacationDir, "beach.jpg"),   [0xFF]);

        _metadata.GetMetadata(Arg.Any<string>())
                 .Returns(Task.FromResult<ImageTag?>(new ImageTag { Title = "My Photo", Comment = "Nice" }));
        _attachmentRepo.GetByName(Arg.Any<string>()).Returns((Attachment?)null);

        var svc = CreateService();

        // Act
        var result = await svc.Get();

        // Assert: root folder
        Assert.That(result,             Is.Not.Null);
        Assert.That(result!.Name,       Is.EqualTo("Albums"));
        Assert.That(result.Files,       Is.Not.Null);
        Assert.That(result.Files!.Count(), Is.EqualTo(1));
        Assert.That(result.Files!.First().Name,    Is.EqualTo("root.jpg"));
        Assert.That(result.Files!.First().Title,   Is.EqualTo("My Photo"));
        Assert.That(result.Files!.First().Comment, Is.EqualTo("Nice"));

        // Assert: subfolder was scanned recursively
        Assert.That(result.Folders,     Is.Not.Null);
        var vacation = result.Folders!.Single();
        Assert.That(vacation.Name,      Is.EqualTo("Vacation"));
        Assert.That(vacation.Files!.Single().Name, Is.EqualTo("beach.jpg"));

        // Assert: result was persisted to the DB cache and L1
        await _attachmentRepo.Received(1)
            .Upsert(Arg.Is<Attachment>(a =>
                a.Name        == CacheKey.AlbumCacheName &&
                a.ContentType == "application/json"      &&
                a.Content.Length > 0));
        Assert.That(_cache.TryGetValue<Folder>(svc.AlbumRoot, out _).Result, Is.True);
    }

    [Test]
    public async Task Get_FilesystemScan_IgnoresZeroByteFiles()
    {
        var albumsDir = Path.Combine(_rootPath, "Albums");
        Directory.CreateDirectory(albumsDir);
        await IOFile.WriteAllBytesAsync(Path.Combine(albumsDir, "valid.jpg"), [0xFF]);
        await IOFile.WriteAllBytesAsync(Path.Combine(albumsDir, "empty.jpg"), []); // 0 bytes — excluded

        _attachmentRepo.GetByName(Arg.Any<string>()).Returns((Attachment?)null);
        var svc = CreateService();

        var result = await svc.Get();

        Assert.That(result!.Files!.Count(), Is.EqualTo(1));
        Assert.That(result.Files!.Single().Name, Is.EqualTo("valid.jpg"));
    }

    [Test]
    public async Task Get_FilesystemScan_NullMetadata_FallsBackToFileNameAsTitle()
    {
        var albumsDir = Path.Combine(_rootPath, "Albums");
        Directory.CreateDirectory(albumsDir);
        await IOFile.WriteAllBytesAsync(Path.Combine(albumsDir, "no-exif.jpg"), [0xFF]);

        // _metadata returns null (default SetUp)
        _attachmentRepo.GetByName(Arg.Any<string>()).Returns((Attachment?)null);
        var svc = CreateService();

        var result = await svc.Get();

        Assert.That(result!.Files!.Single().Title, Is.EqualTo("no-exif.jpg"));
    }

    // ── GetFlatList ─────────────────────────────────────────────────────────

    [Test]
    public async Task GetFlatList_ReturnsAllFilesFromNestedFolderHierarchyAsFlatDictionary()
    {
        var svc    = CreateService();
        var folder = new Folder
        {
            Files = [new AlbumFile { RelativePath = "/Image/a.jpg" }],
            Folders = [
                new Folder { Files = [new AlbumFile { RelativePath = "/Image/sub/b.jpg" }] }
            ]
        };
        _cache.Seed(svc.AlbumRoot, folder);

        var result = await svc.GetFlatList();

        Assert.That(result, Has.Count.EqualTo(2));
        Assert.That(result, Contains.Key("/Image/a.jpg"));
        Assert.That(result, Contains.Key("/Image/sub/b.jpg"));
    }

    // ── Refresh ─────────────────────────────────────────────────────────────

    [Test]
    public async Task Refresh_EvictsStaleCacheEntryAndRebuildsFromFilesystem()
    {
        var svc = CreateService();
        _cache.Seed(svc.AlbumRoot, new Folder { Name = "stale" });

        var result = await svc.Refresh();

        // No albums dir → scan returns null
        Assert.That(result, Is.Null);

        // Stale folder is no longer retrievable (null was written)
        var isValidFolderCached = _cache.TryGetValue<Folder>(svc.AlbumRoot, out _).Result;
        Assert.That(isValidFolderCached, Is.False);

        await _attachmentRepo.Received(1).Upsert(Arg.Any<Attachment>());
    }

}
