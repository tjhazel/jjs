using JJS.Api.Models;
using JJS.Api.Models.People;
using JJS.Api.Models.Post;
using JJS.Api.Repositories;
using JJS.Api.Services;
using JJS.Api.Tests.Fakes;
using Microsoft.AspNetCore.Http;
using NSubstitute;
using System.Security.Claims;

namespace JJS.Api.Tests.Services;

[TestFixture]
public class PostServiceTest
{
    private IPostRepository      _postRepo      = null!;
    private IImageMatchService   _imageMatch    = null!;
    private IUserService         _userService   = null!;
    private IHttpContextAccessor _httpContext   = null!;
    private FakeCacheService     _cache         = null!;

    [SetUp]
    public void SetUp()
    {
        _postRepo    = Substitute.For<IPostRepository>();
        _imageMatch  = Substitute.For<IImageMatchService>();
        _userService = Substitute.For<IUserService>();
        _httpContext = Substitute.For<IHttpContextAccessor>();
        _cache       = new FakeCacheService();

        // Default: HttpContext present, user has no roles (regular visitor)
        ConfigureUser(/* no roles */);

        // Default: repo returns empty list so tests that don't care about content stay simple
        _postRepo.GetAll(Arg.Any<bool>()).Returns(Task.FromResult<IEnumerable<PostViewModel>>([]));

        // Default: MatchImages is a no-op
        _imageMatch.MatchImages(Arg.Any<IEnumerable<PostViewModel>>()).Returns(Task.CompletedTask);

        // Default: user lookup returns null (Save tests override as needed)
        _userService.Get(Arg.Any<string>()).Returns(Task.FromResult<User>(null!));

        // Default: repo Save returns a new ID
        _postRepo.Save(Arg.Any<Post>()).Returns(Task.FromResult(1));
    }

    private PostService CreateService() => new(
        _postRepo,
        _imageMatch,
        _userService,
        _cache,
        _httpContext
    );

    private void ConfigureUser(params string[] roles)
    {
        var claims = roles.Select(r => new Claim(ClaimTypes.Role, r));
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"));
        var context = Substitute.For<HttpContext>();
        context.User.Returns(principal);
        _httpContext.HttpContext.Returns(context);
    }

    private static PostViewModel MakePost(int id,
        DateTime? releaseDate  = null,
        DateTime? createdDate  = null,
        bool?     circleOfTrust = false) => new()
    {
        PostId          = id,
        Title           = $"Post {id}",
        PreviewText     = "Preview",
        Body            = "Body",
        CommentsEnabled = false,
        Approved        = true,
        CreatedBy       = "Author",
        ModifiedBy      = "Author",
        ReleaseDate     = releaseDate,
        CreatedDate     = createdDate ?? DateTime.UtcNow.AddDays(-id),
        CircleOfTrust   = circleOfTrust,
    };

    // ── GetPublic ───────────────────────────────────────────────────────────

    [Test]
    public async Task GetPublic_CacheHit_ReturnsCachedResultWithoutCallingRepositoryOrMatchImages()
    {
        // Admin user bypasses the CircleOfTrust .Where() filter so the cached reference is returned as-is
        ConfigureUser(UserRoles.Admin);
        var svc    = CreateService();
        var cached = new[] { MakePost(1) } as IEnumerable<PostViewModel>;
        _cache.Seed(CacheKey.PostPublicCacheName, cached);

        var result = await svc.GetPublic();

        Assert.That(result, Is.SameAs(cached));
        await _postRepo.DidNotReceive().GetAll(Arg.Any<bool>());
        await _imageMatch.DidNotReceive().MatchImages(Arg.Any<IEnumerable<PostViewModel>>());
    }

    [Test]
    public async Task GetPublic_CacheMiss_CallsRepositoryWithIsPublicTrue()
    {
        var svc   = CreateService();
        var posts = new[] { MakePost(1) };
        _postRepo.GetAll(isPublic: true).Returns(Task.FromResult<IEnumerable<PostViewModel>>(posts));

        await svc.GetPublic();

        await _postRepo.Received(1).GetAll(isPublic: true);
    }

    [Test]
    public async Task GetPublic_CacheMiss_CallsMatchImagesBeforeCaching()
    {
        var svc   = CreateService();
        var posts = new[] { MakePost(1) };
        _postRepo.GetAll(isPublic: true).Returns(Task.FromResult<IEnumerable<PostViewModel>>(posts));

        await svc.GetPublic();

        await _imageMatch.Received(1).MatchImages(Arg.Any<IEnumerable<PostViewModel>>());
    }

    [Test]
    public async Task GetPublic_CacheMiss_PopulatesCacheForSubsequentCalls()
    {
        var svc   = CreateService();
        var posts = new[] { MakePost(1) };
        _postRepo.GetAll(isPublic: true).Returns(Task.FromResult<IEnumerable<PostViewModel>>(posts));

        await svc.GetPublic();
        await svc.GetPublic(); // second call

        // Repository and MatchImages should only have been called once
        await _postRepo.Received(1).GetAll(Arg.Any<bool>());
        await _imageMatch.Received(1).MatchImages(Arg.Any<IEnumerable<PostViewModel>>());
    }

    [Test]
    public async Task GetPublic_SortsByReleaseDateDescending()
    {
        var svc = CreateService();
        var posts = new[]
        {
            MakePost(1, releaseDate: new DateTime(2024, 1, 1)),
            MakePost(2, releaseDate: new DateTime(2024, 6, 1)),
            MakePost(3, releaseDate: new DateTime(2023, 6, 1)),
        };
        _postRepo.GetAll(isPublic: true).Returns(Task.FromResult<IEnumerable<PostViewModel>>(posts));

        var result = (await svc.GetPublic()).ToList();

        Assert.That(result[0].PostId, Is.EqualTo(2)); // newest release date first
        Assert.That(result[1].PostId, Is.EqualTo(1));
        Assert.That(result[2].PostId, Is.EqualTo(3));
    }

    [Test]
    public async Task GetPublic_FallsBackToCreatedDateWhenReleaseDateIsNull()
    {
        var svc = CreateService();
        var posts = new[]
        {
            MakePost(1, createdDate: new DateTime(2024, 1, 1)),  // no release date
            MakePost(2, releaseDate: new DateTime(2024, 3, 1)),  // explicit release date
            MakePost(3, createdDate: new DateTime(2024, 5, 1)),  // no release date
        };
        _postRepo.GetAll(isPublic: true).Returns(Task.FromResult<IEnumerable<PostViewModel>>(posts));

        var result = (await svc.GetPublic()).ToList();

        // Sort key is ReleaseDate ?? CreatedDate, descending
        Assert.That(result[0].PostId, Is.EqualTo(3)); // CreatedDate 2024-05-01
        Assert.That(result[1].PostId, Is.EqualTo(2)); // ReleaseDate 2024-03-01
        Assert.That(result[2].PostId, Is.EqualTo(1)); // CreatedDate 2024-01-01
    }

    [Test]
    public async Task GetPublic_NonCircleOfTrustUser_FiltersOutCircleOfTrustPosts()
    {
        ConfigureUser(/* no roles */);
        var svc = CreateService();
        var posts = new[]
        {
            MakePost(1, circleOfTrust: false),
            MakePost(2, circleOfTrust: true),
            MakePost(3, circleOfTrust: null), // null treated as false
        };
        _postRepo.GetAll(isPublic: true).Returns(Task.FromResult<IEnumerable<PostViewModel>>(posts));

        var result = (await svc.GetPublic()).ToList();

        Assert.That(result, Has.Count.EqualTo(2));
        Assert.That(result.Select(p => p.PostId), Does.Not.Contain(2));
    }

    [Test]
    public async Task GetPublic_AdminUser_ReturnsCircleOfTrustPostsUnfiltered()
    {
        ConfigureUser(UserRoles.Admin);
        var svc = CreateService();
        var posts = new[]
        {
            MakePost(1, circleOfTrust: false),
            MakePost(2, circleOfTrust: true),
        };
        _postRepo.GetAll(isPublic: true).Returns(Task.FromResult<IEnumerable<PostViewModel>>(posts));

        var result = (await svc.GetPublic()).ToList();

        Assert.That(result, Has.Count.EqualTo(2));
    }

    [Test]
    public async Task GetPublic_CircleOfTrustRoleUser_ReturnsCircleOfTrustPostsUnfiltered()
    {
        ConfigureUser(UserRoles.CircleOfTrust);
        var svc = CreateService();
        var posts = new[]
        {
            MakePost(1, circleOfTrust: false),
            MakePost(2, circleOfTrust: true),
        };
        _postRepo.GetAll(isPublic: true).Returns(Task.FromResult<IEnumerable<PostViewModel>>(posts));

        var result = (await svc.GetPublic()).ToList();

        Assert.That(result, Has.Count.EqualTo(2));
    }

    [Test]
    public async Task GetPublic_NullHttpContext_TreatsUserAsNonCircleOfTrust()
    {
        _httpContext.HttpContext.Returns((HttpContext?)null);
        var svc = CreateService();
        var posts = new[]
        {
            MakePost(1, circleOfTrust: false),
            MakePost(2, circleOfTrust: true),
        };
        _postRepo.GetAll(isPublic: true).Returns(Task.FromResult<IEnumerable<PostViewModel>>(posts));

        var result = (await svc.GetPublic()).ToList();

        Assert.That(result, Has.Count.EqualTo(1));
        Assert.That(result[0].PostId, Is.EqualTo(1));
    }

    // ── GetAll ──────────────────────────────────────────────────────────────

    [Test]
    public async Task GetAll_CacheHit_ReturnsCachedResultWithoutCallingRepository()
    {
        var svc    = CreateService();
        var cached = new[] { MakePost(1) } as IEnumerable<PostViewModel>;
        _cache.Seed(CacheKey.PostAllCacheName, cached);

        var result = await svc.GetAll();

        Assert.That(result, Is.SameAs(cached));
        await _postRepo.DidNotReceive().GetAll(Arg.Any<bool>());
    }

    [Test]
    public async Task GetAll_CacheMiss_CallsRepositoryWithIsPublicFalse()
    {
        var svc = CreateService();

        await svc.GetAll();

        await _postRepo.Received(1).GetAll(isPublic: false);
    }

    [Test]
    public async Task GetAll_DoesNotCallMatchImages()
    {
        var svc = CreateService();

        await svc.GetAll();

        await _imageMatch.DidNotReceive().MatchImages(Arg.Any<IEnumerable<PostViewModel>>());
    }

    [Test]
    public async Task GetAll_SortsByReleaseDateDescendingWithCreatedDateFallback()
    {
        var svc = CreateService();
        var posts = new[]
        {
            MakePost(1, releaseDate: new DateTime(2023, 1, 1)),
            MakePost(2, createdDate: new DateTime(2024, 8, 1)), // no release date
            MakePost(3, releaseDate: new DateTime(2024, 3, 1)),
        };
        _postRepo.GetAll(isPublic: false).Returns(Task.FromResult<IEnumerable<PostViewModel>>(posts));

        var result = (await svc.GetAll()).ToList();

        Assert.That(result[0].PostId, Is.EqualTo(2)); // CreatedDate 2024-08-01
        Assert.That(result[1].PostId, Is.EqualTo(3)); // ReleaseDate 2024-03-01
        Assert.That(result[2].PostId, Is.EqualTo(1)); // ReleaseDate 2023-01-01
    }

    // ── View ────────────────────────────────────────────────────────────────

    [Test]
    public async Task View_DelegatesPostIdToRepository()
    {
        var svc = CreateService();

        await svc.View(42);

        await _postRepo.Received(1).View(42);
    }

    // ── Save — new post ─────────────────────────────────────────────────────

    [Test]
    public async Task Save_NewPost_SetsCreatedDateToUtcNow()
    {
        var svc   = CreateService();
        var model = new Post { Title = "T", PreviewText = "P", Body = "B", CommentsEnabled = false, Approved = false };
        var user  = new ClaimsUser { Email = "a@b.com" };
        var before = DateTime.UtcNow;

        await svc.Save(model, user);

        Assert.That(model.CreatedDate, Is.GreaterThanOrEqualTo(before)
                                         .And.LessThanOrEqualTo(DateTime.UtcNow));
    }

    [Test]
    public async Task Save_NewPost_SetsCreatedByFkFromLookedUpUser()
    {
        var svc     = CreateService();
        var userId  = Guid.NewGuid();
        var model   = new Post { Title = "T", PreviewText = "P", Body = "B", CommentsEnabled = false, Approved = false };
        var callerUser = new ClaimsUser { Email = "a@b.com" };
        _userService.Get("a@b.com").Returns(Task.FromResult<User>(new User { Id = userId }));

        await svc.Save(model, callerUser);

        Assert.That(model.CreatedByFk, Is.EqualTo(userId));
    }

    [Test]
    public async Task Save_NewPost_SetsModifiedDateAndModifiedByFk()
    {
        var svc    = CreateService();
        var userId = Guid.NewGuid();
        var model  = new Post { Title = "T", PreviewText = "P", Body = "B", CommentsEnabled = false, Approved = false };
        var user   = new ClaimsUser { Email = "a@b.com" };
        _userService.Get("a@b.com").Returns(Task.FromResult<User>(new User { Id = userId }));
        var before = DateTime.UtcNow;

        await svc.Save(model, user);

        Assert.That(model.ModifiedDate, Is.GreaterThanOrEqualTo(before)
                                          .And.LessThanOrEqualTo(DateTime.UtcNow));
        Assert.That(model.ModifiedByFk, Is.EqualTo(userId));
    }

    [Test]
    public async Task Save_NewPost_ReturnsPostIdFromRepository()
    {
        var svc   = CreateService();
        var model = new Post { Title = "T", PreviewText = "P", Body = "B", CommentsEnabled = false, Approved = false };
        _postRepo.Save(Arg.Any<Post>()).Returns(Task.FromResult(99));

        var result = await svc.Save(model, new ClaimsUser { Email = "a@b.com" });

        Assert.That(result, Is.EqualTo(99));
    }

    // ── Save — existing post ────────────────────────────────────────────────

    [Test]
    public async Task Save_ExistingPost_DoesNotOverwriteCreatedDateOrCreatedByFk()
    {
        var svc              = CreateService();
        var originalCreated  = new DateTime(2020, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var originalAuthorId = Guid.NewGuid();
        var model = new Post
        {
            PostId          = 7,
            Title           = "T",
            PreviewText     = "P",
            Body            = "B",
            CommentsEnabled = false,
            Approved        = false,
            CreatedDate     = originalCreated,
            CreatedByFk     = originalAuthorId,
        };

        await svc.Save(model, new ClaimsUser { Email = "editor@b.com" });

        Assert.That(model.CreatedDate,  Is.EqualTo(originalCreated));
        Assert.That(model.CreatedByFk,  Is.EqualTo(originalAuthorId));
    }

    [Test]
    public async Task Save_ExistingPost_SetsModifiedDateAndModifiedByFk()
    {
        var svc    = CreateService();
        var userId = Guid.NewGuid();
        var model  = new Post { PostId = 7, Title = "T", PreviewText = "P", Body = "B", CommentsEnabled = false, Approved = false };
        _userService.Get(Arg.Any<string>()).Returns(Task.FromResult<User>(new User { Id = userId }));
        var before = DateTime.UtcNow;

        await svc.Save(model, new ClaimsUser { Email = "editor@b.com" });

        Assert.That(model.ModifiedDate, Is.GreaterThanOrEqualTo(before)
                                          .And.LessThanOrEqualTo(DateTime.UtcNow));
        Assert.That(model.ModifiedByFk, Is.EqualTo(userId));
    }

    [Test]
    public async Task Save_ExistingPost_ReturnsPostIdFromRepository()
    {
        var svc   = CreateService();
        var model = new Post { PostId = 7, Title = "T", PreviewText = "P", Body = "B", CommentsEnabled = false, Approved = false };
        _postRepo.Save(Arg.Any<Post>()).Returns(Task.FromResult(7));

        var result = await svc.Save(model, new ClaimsUser { Email = "a@b.com" });

        Assert.That(result, Is.EqualTo(7));
    }

    // ── Save — cache invalidation ───────────────────────────────────────────

    [Test]
    public async Task Save_ClearsBothPostCaches()
    {
        var svc = CreateService();
        _cache.Seed(CacheKey.PostAllCacheName,    new[] { MakePost(1) } as IEnumerable<PostViewModel>);
        _cache.Seed(CacheKey.PostPublicCacheName, new[] { MakePost(1) } as IEnumerable<PostViewModel>);
        var model = new Post { Title = "T", PreviewText = "P", Body = "B", CommentsEnabled = false, Approved = false };

        await svc.Save(model, new ClaimsUser { Email = "a@b.com" });

        Assert.That(_cache.Contains(CacheKey.PostAllCacheName),    Is.False);
        Assert.That(_cache.Contains(CacheKey.PostPublicCacheName), Is.False);
    }

    // ── Save — user lookup ──────────────────────────────────────────────────

    [Test]
    public async Task Save_LooksUpUserByEmailFromClaimsUser()
    {
        var svc   = CreateService();
        var model = new Post { Title = "T", PreviewText = "P", Body = "B", CommentsEnabled = false, Approved = false };

        await svc.Save(model, new ClaimsUser { Email = "caller@example.com" });

        await _userService.Received(1).Get("caller@example.com");
    }

    [Test]
    public async Task Save_WhenUserServiceReturnsNull_AssignsNullToAuditForeignKeys()
    {
        var svc   = CreateService();
        _userService.Get(Arg.Any<string>()).Returns(Task.FromResult<User>(null!));
        var model = new Post { Title = "T", PreviewText = "P", Body = "B", CommentsEnabled = false, Approved = false };

        await svc.Save(model, new ClaimsUser { Email = "ghost@example.com" });

        Assert.That(model.CreatedByFk,  Is.Null);
        Assert.That(model.ModifiedByFk, Is.Null);
    }
}
