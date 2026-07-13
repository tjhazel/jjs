-- ================================================================
--  POST DEDUPLICATION CLEANUP
--
--  Root cause: postId was stripped from the save payload, so the
--  MERGE always inserted a new row instead of updating the existing one.
--
--  Strategy per duplicate group (same Title):
--    KEEPER = lowest PostId  (original; holds Comments / Reactions)
--    FRESH  = most recently modified record  (user's last intended values)
--    ViewCount = SUM across all records so no views are lost
--    Categories = UNION of all duplicates' categories onto the keeper
--    CreatedDate / CreatedByFk = from the original (oldest) record
--
--  IMPORTANT: Run all steps in the SAME SESSION.
--  Temp tables (#DupGroups, #KeeperSnapshot, #MissingCategories) created
--  in Step 2 are required by Step 3 and will not survive a reconnect.
--
--  Run each numbered step, inspect the SELECT output, then proceed.
-- ================================================================


-- ================================================================
-- STEP 1 — PREVIEW (read-only)
-- Inspect all duplicate groups before touching anything.
-- KEEPER rows will be retained; DELETE rows will be removed.
-- ================================================================

SELECT
    p.PostId,
    p.Title,
    p.CreatedDate,
    p.ModifiedDate,
    p.Approved,
    p.Archived,
    p.ViewCount,
    p.ImageUrl,
    p.ReleaseDate,
    ISNULL(p.CircleOfTrust, 0)                                             AS CircleOfTrust,
    (SELECT COUNT(*) FROM PostCategories pc WHERE pc.PostFk = p.PostId)   AS CategoryCount,
    (SELECT COUNT(*) FROM Comments       c  WHERE c.PostFk  = p.PostId)   AS CommentCount,
    (SELECT COUNT(*) FROM PostReactions  r  WHERE r.PostFk  = p.PostId)   AS ReactionCount,
    grp.KeeperPostId,
    CASE WHEN p.PostId = grp.KeeperPostId THEN 'KEEPER' ELSE 'DELETE' END AS Action
FROM Posts p
JOIN (
    SELECT
        Title,
        COUNT(*)    AS DuplicateCount,
        MIN(PostId) AS KeeperPostId
    FROM Posts
    GROUP BY Title
    HAVING COUNT(*) > 1
) grp ON grp.Title = p.Title
ORDER BY p.Title, p.PostId;


-- ================================================================
-- STEP 2a — BUILD #DupGroups (read-only)
-- Maps every duplicate (non-keeper) PostId to its keeper.
-- Every row in this table represents a post that will be deleted.
-- ================================================================

IF OBJECT_ID('tempdb..#DupGroups') IS NOT NULL DROP TABLE #DupGroups;

SELECT
    p.PostId       AS DuplicatePostId,
    grp.KeeperPostId,
    p.Title
INTO #DupGroups
FROM Posts p
JOIN (
    SELECT Title, MIN(PostId) AS KeeperPostId
    FROM Posts
    GROUP BY Title
    HAVING COUNT(*) > 1
) grp ON grp.Title = p.Title
WHERE p.PostId <> grp.KeeperPostId;

SELECT * FROM #DupGroups ORDER BY KeeperPostId, DuplicatePostId;


-- ================================================================
-- STEP 2b — BUILD #KeeperSnapshot (read-only)
-- Computes the final merged state for each keeper post.
--   Field values   → most recently modified record in the group
--                    (the last save the user actually intended)
--   CreatedDate /
--   CreatedByFk    → oldest record (original creation audit)
--   ViewCount      → SUM across all records in the group
-- Verify: confirm field values, dates, and ViewCount look correct.
-- ================================================================

IF OBJECT_ID('tempdb..#KeeperSnapshot') IS NOT NULL DROP TABLE #KeeperSnapshot;

WITH AllInGroup AS (
    SELECT
        p.PostId,
        p.Title,
        p.PreviewText,
        CAST(p.Body AS nvarchar(max)) AS Body,
        p.ReleaseDate,
        p.ExpireDate,
        p.CommentsEnabled,
        p.Approved,
        p.Archived,
        p.CircleOfTrust,
        p.ImageUrl,
        p.ViewCount,
        p.CreatedDate,
        p.CreatedByFk,
        p.ModifiedDate,
        p.ModifiedByFk,
        grp.KeeperPostId,
        ROW_NUMBER() OVER (
            PARTITION BY grp.KeeperPostId
            ORDER BY p.ModifiedDate DESC, p.PostId DESC   -- newest edit first
        ) AS rn_newest,
        ROW_NUMBER() OVER (
            PARTITION BY grp.KeeperPostId
            ORDER BY p.CreatedDate ASC, p.PostId ASC      -- original first
        ) AS rn_oldest
    FROM Posts p
    JOIN (
        SELECT Title, MIN(PostId) AS KeeperPostId
        FROM Posts
        GROUP BY Title
        HAVING COUNT(*) > 1
    ) grp ON grp.Title = p.Title
),
Newest AS (SELECT * FROM AllInGroup WHERE rn_newest = 1),
Oldest AS (SELECT * FROM AllInGroup WHERE rn_oldest = 1),
Totals AS (
    SELECT KeeperPostId, SUM(ViewCount) AS TotalViewCount
    FROM AllInGroup
    GROUP BY KeeperPostId
)
SELECT
    n.KeeperPostId   AS PostId,
    n.Title,
    n.PreviewText,
    n.Body,
    n.ReleaseDate,
    n.ExpireDate,
    n.CommentsEnabled,
    n.Approved,
    n.Archived,
    n.CircleOfTrust,
    n.ImageUrl,
    t.TotalViewCount AS ViewCount,
    o.CreatedDate,                   -- preserved from original
    o.CreatedByFk,                   -- preserved from original
    n.ModifiedDate,                  -- from most recent edit
    n.ModifiedByFk
INTO #KeeperSnapshot
FROM Newest n
JOIN Oldest o ON o.KeeperPostId = n.KeeperPostId
JOIN Totals t ON t.KeeperPostId = n.KeeperPostId;

SELECT * FROM #KeeperSnapshot;


-- ================================================================
-- STEP 2c — BUILD #MissingCategories (read-only)
-- Categories present on any duplicate that the keeper does not
-- already have. These will be inserted onto the keeper in Step 3.
-- Verify: confirm these categories belong to the keeper post.
-- ================================================================

IF OBJECT_ID('tempdb..#MissingCategories') IS NOT NULL DROP TABLE #MissingCategories;

SELECT DISTINCT
    d.KeeperPostId AS PostFk,
    pc.CategoryFk,
    cat.Title      AS CategoryTitle
INTO #MissingCategories
FROM #DupGroups d
JOIN PostCategories pc  ON pc.PostFk      = d.DuplicatePostId
JOIN Categories     cat ON cat.CategoryId = pc.CategoryFk
WHERE NOT EXISTS (
    SELECT 1 FROM PostCategories existing
    WHERE  existing.PostFk     = d.KeeperPostId
    AND    existing.CategoryFk = pc.CategoryFk
);

SELECT * FROM #MissingCategories ORDER BY PostFk, CategoryFk;


-- ================================================================
-- STEP 2d — REVIEW ONLY: Categories on the keeper absent from all
-- duplicates. These may be stale (pre-bug) or intentionally kept.
-- No action is taken here — decide manually whether to remove them.
-- ================================================================

SELECT
    pc.PostFk,
    pc.CategoryFk,
    cat.Title AS CategoryTitle,
    'On keeper only — verify it should still be assigned' AS Note
FROM PostCategories pc
JOIN Categories cat ON cat.CategoryId = pc.CategoryFk
WHERE pc.PostFk IN (SELECT DISTINCT KeeperPostId FROM #DupGroups)
  AND NOT EXISTS (
      SELECT 1
      FROM #DupGroups d
      JOIN PostCategories dupCat
          ON  dupCat.PostFk      = d.DuplicatePostId
          AND dupCat.CategoryFk  = pc.CategoryFk
      WHERE d.KeeperPostId = pc.PostFk
  );


-- ================================================================
-- STEP 3 — EXECUTE CLEANUP  *** DESTRUCTIVE ***
--
-- Run ONLY after verifying Steps 1 and 2 output.
-- The transaction lets you inspect final state and COMMIT or ROLLBACK.
--
-- Order matters:
--   3a. Re-point child records to the keeper (before deleting duplicates)
--   3b. Insert missing categories onto the keeper
--   3c. Delete PostCategories on duplicates
--   3d. Delete the duplicate posts
--   3e. Update the keeper with merged field values
-- ================================================================

BEGIN TRANSACTION;

    -- ---- 3a. Child records: re-point from duplicate PostIds to keeper ----

    -- Comments
    UPDATE c
    SET    c.PostFk = d.KeeperPostId
    FROM   Comments c
    JOIN   #DupGroups d ON d.DuplicatePostId = c.PostFk;

    -- PostAttachments
    UPDATE pa
    SET    pa.PostFk = d.KeeperPostId
    FROM   PostAttachments pa
    JOIN   #DupGroups d ON d.DuplicatePostId = pa.PostFk;

    -- PostReactions: drop any on duplicates that would violate the unique
    -- constraint (PostFk, Email, Emoji) on the keeper, then re-point the rest
    DELETE pr
    FROM   PostReactions pr
    JOIN   #DupGroups d ON d.DuplicatePostId = pr.PostFk
    WHERE  EXISTS (
        SELECT 1 FROM PostReactions existing
        WHERE  existing.PostFk = d.KeeperPostId
        AND    existing.Email  = pr.Email
        AND    existing.Emoji  = pr.Emoji COLLATE Latin1_General_100_BIN2
    );

    UPDATE pr
    SET    pr.PostFk = d.KeeperPostId
    FROM   PostReactions pr
    JOIN   #DupGroups d ON d.DuplicatePostId = pr.PostFk;

    -- ---- 3b. Insert missing categories onto the keeper ----

    INSERT INTO PostCategories (PostFk, CategoryFk)
    SELECT PostFk, CategoryFk
    FROM   #MissingCategories;

    -- ---- 3c. Remove PostCategories rows belonging to duplicates ----

    DELETE pc
    FROM   PostCategories pc
    JOIN   #DupGroups d ON d.DuplicatePostId = pc.PostFk;

    -- ---- 3d. Delete the duplicate posts ----

    DELETE p
    FROM   Posts p
    JOIN   #DupGroups d ON d.DuplicatePostId = p.PostId;

    -- ---- 3e. Update keepers with merged field values ----

    UPDATE p
    SET
        p.Title           = s.Title,
        p.PreviewText     = s.PreviewText,
        p.Body            = s.Body,
        p.ReleaseDate     = s.ReleaseDate,
        p.ExpireDate      = s.ExpireDate,
        p.CommentsEnabled = s.CommentsEnabled,
        p.Approved        = s.Approved,
        p.Archived        = s.Archived,
        p.CircleOfTrust   = s.CircleOfTrust,
        p.ImageUrl        = s.ImageUrl,
        p.ViewCount       = s.ViewCount,
        p.CreatedDate     = s.CreatedDate,
        p.CreatedByFk     = s.CreatedByFk,
        p.ModifiedDate    = s.ModifiedDate,
        p.ModifiedByFk    = s.ModifiedByFk
    FROM Posts p
    JOIN #KeeperSnapshot s ON s.PostId = p.PostId;

    -- ---- Final verification: inspect cleaned-up keepers ----
    SELECT
        p.PostId,
        p.Title,
        p.CreatedDate,
        p.ModifiedDate,
        p.Approved,
        p.ViewCount,
        (SELECT COUNT(*) FROM PostCategories pc WHERE pc.PostFk = p.PostId) AS CategoryCount,
        (SELECT COUNT(*) FROM Comments       c  WHERE c.PostFk  = p.PostId) AS CommentCount,
        (SELECT COUNT(*) FROM PostReactions  r  WHERE r.PostFk  = p.PostId) AS ReactionCount
    FROM Posts p
    JOIN #KeeperSnapshot s ON s.PostId = p.PostId
    ORDER BY p.PostId;

-- ---- Review the SELECT above, then choose one: ----
-- COMMIT   TRANSACTION;
-- ROLLBACK TRANSACTION;
