/* ============================================================
   STEP 1: Generate VALUES text for Posts
   Run this, copy the single-cell result into Step 4's paste area
   ============================================================ */

SELECT
    CASE WHEN ROW_NUMBER() OVER (ORDER BY PostId) = 1 THEN '    (' ELSE '    ,(' END
    + CAST(PostId AS VARCHAR(10)) + ', '
    + N'''' + REPLACE(REPLACE(REPLACE(Title, '''', ''''''), CHAR(13)+CHAR(10), CHAR(10)), CHAR(10), '''+CHAR(13)+CHAR(10)+''') + ''', '
    + N'''' + REPLACE(REPLACE(REPLACE(PreviewText, '''', ''''''), CHAR(13)+CHAR(10), CHAR(10)), CHAR(10), '''+CHAR(13)+CHAR(10)+''') + ''', '
    + N'''' + REPLACE(REPLACE(REPLACE(CAST(Body AS NVARCHAR(MAX)), '''', ''''''), CHAR(13)+CHAR(10), CHAR(10)), CHAR(10), '''+CHAR(13)+CHAR(10)+''') + ''', '
    + ISNULL('''' + CONVERT(VARCHAR(19), ReleaseDate, 120) + '''', 'NULL') + ', '
    + ISNULL('''' + CONVERT(VARCHAR(19), ExpireDate, 120) + '''', 'NULL') + ', '
    + CAST(CommentsEnabled AS VARCHAR(1)) + ', '
    + CAST(Approved AS VARCHAR(1)) + ', '
    + CAST(ViewCount AS VARCHAR(20)) + ', '
    + '''' + CONVERT(VARCHAR(19), CreatedDate, 120) + ''', '
    + '''' + CAST(CreatedByFk AS VARCHAR(36)) + ''', '
    + '''' + CONVERT(VARCHAR(19), ModifiedDate, 120) + ''', '
    + '''' + CAST(ModifiedByFk AS VARCHAR(36)) + ''', '
    + ISNULL('''' + REPLACE(REPLACE(REPLACE(ImageUrl, '''', ''''''), CHAR(13)+CHAR(10), CHAR(10)), CHAR(10), '''+CHAR(13)+CHAR(10)+''') + '''', 'NULL') + ', '
    + CASE WHEN Archived IS NULL THEN 'NULL' ELSE CAST(Archived AS VARCHAR(1)) END + ', '
    + CASE WHEN CircleOfTrust IS NULL THEN 'NULL' ELSE CAST(CircleOfTrust AS VARCHAR(1)) END
    + ')' AS RowSql
FROM Posts
ORDER BY PostId;

/* ============================================================
   STEP 2: Generate VALUES lines for PostCategories (one row = one line)
   select * from postcategories where categoryfk not in (select categoryid from categories)
   select * from categories
   ============================================================ */
SELECT
    CASE WHEN ROW_NUMBER() OVER (ORDER BY PostCategoryId) = 1 THEN '    (' ELSE '    ,(' END
    + CAST(PostCategoryId AS VARCHAR(10)) + ', '
    + CAST(PostFk AS VARCHAR(10)) + ', '
    + CAST(CategoryFk AS VARCHAR(10))
    + ')' AS RowSql
FROM PostCategories
ORDER BY PostCategoryId;


RETURN;  --Manually run from here down


/* ============================================================
   STEP 3: Create the temp tables (target side)
   ============================================================ */
CREATE TABLE #TempPosts (
    PostId          INT              NOT NULL,
    Title           NVARCHAR (MAX)   NOT NULL,
    PreviewText     NVARCHAR (MAX)   NOT NULL,
    Body            NVARCHAR (MAX)   NOT NULL,
    ReleaseDate     SMALLDATETIME    NULL,
    ExpireDate      SMALLDATETIME    NULL,
    CommentsEnabled BIT              NOT NULL,
    Approved        BIT              NOT NULL,
    ViewCount       BIGINT           NOT NULL,
    CreatedDate     SMALLDATETIME    NOT NULL,
    CreatedByFk     UNIQUEIDENTIFIER NOT NULL,
    ModifiedDate    SMALLDATETIME    NOT NULL,
    ModifiedByFk    UNIQUEIDENTIFIER NOT NULL,
    ImageUrl        NVARCHAR (MAX)   NULL,
    Archived        BIT              NULL,
    CircleOfTrust   BIT              NULL
);

CREATE TABLE #TempPostCategories (
    PostCategoryId INT NOT NULL,
    PostFk         INT NOT NULL,
    CategoryFk     INT NOT NULL
);

/* ============================================================
   STEP 4: Populate #TempPosts
   ============================================================ */
INSERT INTO #TempPosts
    (PostId, Title, PreviewText, Body, ReleaseDate, ExpireDate,
     CommentsEnabled, Approved, ViewCount, CreatedDate, CreatedByFk,
     ModifiedDate, ModifiedByFk, ImageUrl, Archived, CircleOfTrust)
VALUES
--BEGIN paste Step 1 output here

    (1, 'Welcome to our site', 'Hi and welcome to our website!  We created this website so you can see what we''ve been up to lately and to share some photos.  The plan is to update this with what is happening here in Colorado.  So stop on by from time to time!', 'Hi and welcome to our website!  We created this website so you can see what we''ve been up to lately and to share some photos.  The plan is to update this with what is happening here in Colorado.  So stop on by from time to time!', '2006-07-05 00:00:00', NULL, 1, 1, 3932, '2006-07-05 00:00:00', 'C00BEAFF-AF9B-4B78-9D42-4B67BE242E66', '2006-07-05 00:00:00', 'C00BEAFF-AF9B-4B78-9D42-4B67BE242E66', NULL, NULL, NULL)
    ,(2, 'Photo Albums', 'The bulk of the content on this site is available through the [Photo Album](www.johnandjeri.com/albums/default.aspx).  We managed to post our wedding photos, honeymoon in Jamaica, our new house and a bunch of other related photos. Let us know what you think by sending us an [email](www.johnandjeri.com/contactus.aspx).', 'The bulk of the content on this site is available through the [Photo Album](www.johnandjeri.com/albums/default.aspx).  We managed to post our wedding photos, honeymoon in Jamaica, our new house and a bunch of other related photos. Let us know what you think by sending us an [email](www.johnandjeri.com/contactus.aspx).', '2006-07-05 00:00:00', NULL, 1, 1, 2414, '2006-07-05 00:00:00', 'C00BEAFF-AF9B-4B78-9D42-4B67BE242E66', '2006-07-05 00:00:00', 'C00BEAFF-AF9B-4B78-9D42-4B67BE242E66', NULL, NULL, NULL)
    ,(3, 'Annual 4th of July Hike', 'We took a trip up to the mountains over the July 4th holiday.  We backpacked in about 4 miles over some pretty grueling landscape and were rewarded with some incredible fishing!', 'We took a trip up to the mountains over the July 4th holiday.  We backpacked in about 4 miles over some pretty grueling landscape and were rewarded with some incredible fishing!  We caught some beautiful native cut-throat trout and some awesome brook trout.  Check out our catch in the [Photo Album](http://localhost/Hazeltine/Albums/folderview.aspx?path=Hunting+and+Fishing%2fFishing+Trips+2006%2f).', '2006-07-05 00:00:00', NULL, 1, 1, 2162, '2006-07-05 00:00:00', 'C00BEAFF-AF9B-4B78-9D42-4B67BE242E66', '2006-07-05 00:00:00', 'C00BEAFF-AF9B-4B78-9D42-4B67BE242E66', NULL, NULL, NULL)
   

--END paste Step 1 output here


/* ============================================================
   STEP 5: Populate #TempPostCategories
   ============================================================ */
INSERT INTO #TempPostCategories
    (PostCategoryId, PostFk, CategoryFk)
VALUES
--BEGIN paste Step 2 output here
 
     (31, 1, 1)
    ,(32, 2, 1)
   

--END paste Step 2 output here
;


/* ============================================================
   STEP 6: MERGE Posts
   ============================================================ */
SET IDENTITY_INSERT dbo.Posts ON;

MERGE INTO Posts AS target
USING #TempPosts AS source
    ON target.PostId = source.PostId

WHEN MATCHED THEN
    UPDATE SET
        target.Title           = LEFT(source.Title, 255),
        target.PreviewText     = LEFT(source.PreviewText, 500),
        target.Body            = source.Body,
        target.ReleaseDate     = source.ReleaseDate,
        target.ExpireDate      = source.ExpireDate,
        target.CommentsEnabled = source.CommentsEnabled,
        target.Approved        = source.Approved,
        target.ViewCount       = source.ViewCount,
        target.CreatedDate     = source.CreatedDate,
        target.CreatedByFk     = source.CreatedByFk,
        target.ModifiedDate    = source.ModifiedDate,
        target.ModifiedByFk    = source.ModifiedByFk,
        target.ImageUrl        = LEFT(source.ImageUrl, 500),
        target.Archived        = source.Archived,
        target.CircleOfTrust   = source.CircleOfTrust

WHEN NOT MATCHED BY TARGET THEN
    INSERT (PostId, Title, PreviewText, Body, ReleaseDate, ExpireDate,
            CommentsEnabled, Approved, ViewCount, CreatedDate, CreatedByFk,
            ModifiedDate, ModifiedByFk, ImageUrl, Archived, CircleOfTrust)
    VALUES (source.PostId, LEFT(source.Title, 255), LEFT(source.PreviewText, 500), source.Body, source.ReleaseDate, source.ExpireDate,
            source.CommentsEnabled, source.Approved, source.ViewCount, source.CreatedDate, source.CreatedByFk,
            source.ModifiedDate, source.ModifiedByFk, LEFT(source.ImageUrl, 500), source.Archived, source.CircleOfTrust)
;

SET IDENTITY_INSERT dbo.Posts OFF;


/* ============================================================
   STEP 7: MERGE PostCategories (includes delete of orphaned rows)
   NOTE: WHEN NOT MATCHED BY SOURCE deletes ANY target row whose
   PostCategoryId isn't in #TempPostCategories. Only run this if
   #TempPostCategories represents the FULL desired set — if it's
   a partial/filtered export, add a WHERE/AND scope to both the
   ON clause and the DELETE branch (e.g. restrict to PostFk IN
   (SELECT PostId FROM #TempPosts)) or you'll wipe out categories
   for posts outside your extract.
   ============================================================ */
MERGE INTO PostCategories AS target
USING #TempPostCategories AS source
    ON target.PostCategoryId = source.PostCategoryId

WHEN MATCHED THEN
    UPDATE SET
        target.PostFk     = source.PostFk,
        target.CategoryFk = source.CategoryFk

WHEN NOT MATCHED BY TARGET THEN
    INSERT (PostFk, CategoryFk)
    VALUES (source.PostFk, source.CategoryFk)

WHEN NOT MATCHED BY SOURCE THEN
    DELETE
;

RETURN;

-- Cleanup
DROP TABLE #TempPosts;
DROP TABLE #TempPostCategories;


select * from #TempPostCategories where categoryfk not in (select categoryid from categories)
select * from #TempPostCategories where postfk not in (select postid from posts)
