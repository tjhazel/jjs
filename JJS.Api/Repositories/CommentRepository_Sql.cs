namespace JJS.Api.Repositories;

public partial class CommentRepository
{
   const string GetByPost_Sql = """
      select c.CommentId
         ,c.PostFk
         ,c.ParentCommentFk
         ,c.Title
         ,cast(c.EntryText as nvarchar(max)) 'EntryText'
         ,c.AuthorName
         ,c.CreatedDate
         ,c.AdminHidden
         ,c.HiddenBy
         ,c.HiddenDate
         ,c.HiddenReason
         ,case when @isAdmin = 1 then c.AuthorEmail else null end 'AuthorEmail'
         ,case when @isAdmin = 1 then isnull(u.Blocked, 0) else null end 'AuthorBlocked'
         ,(select count(*) from Comments r where r.ParentCommentFk = c.CommentId) 'ReplyCount'
         ,isnull(rc.ReactionCounts, '') 'ReactionCounts'
      from Comments c
      left join Users u on u.Email = c.AuthorEmail
      left join (
         select CommentFk, string_agg(Emoji + ':' + cast(EmojiCount as varchar(10)), ',') as ReactionCounts
         from (select CommentFk, Emoji COLLATE Latin1_General_100_BIN2 as Emoji, count(*) as EmojiCount from CommentReactions group by CommentFk, Emoji COLLATE Latin1_General_100_BIN2) x
         group by CommentFk
      ) rc on rc.CommentFk = c.CommentId
      where c.PostFk = @postId
        and c.ParentCommentFk is null
        and (@isAdmin = 1 or c.AdminHidden = 0)
      order by c.CreatedDate desc
      offset @offset rows fetch next @pageSize rows only
      ;
      """;

   const string GetReplies_Sql = """
      select c.CommentId
         ,c.PostFk
         ,c.ParentCommentFk
         ,c.Title
         ,cast(c.EntryText as nvarchar(max)) 'EntryText'
         ,c.AuthorName
         ,c.CreatedDate
         ,c.AdminHidden
         ,c.HiddenBy
         ,c.HiddenDate
         ,c.HiddenReason
         ,case when @isAdmin = 1 then c.AuthorEmail else null end 'AuthorEmail'
         ,case when @isAdmin = 1 then isnull(u.Blocked, 0) else null end 'AuthorBlocked'
         ,0 'ReplyCount'
         ,isnull(rc.ReactionCounts, '') 'ReactionCounts'
      from Comments c
      left join Users u on u.Email = c.AuthorEmail
      left join (
         select CommentFk, string_agg(Emoji + ':' + cast(EmojiCount as varchar(10)), ',') as ReactionCounts
         from (select CommentFk, Emoji COLLATE Latin1_General_100_BIN2 as Emoji, count(*) as EmojiCount from CommentReactions group by CommentFk, Emoji COLLATE Latin1_General_100_BIN2) x
         group by CommentFk
      ) rc on rc.CommentFk = c.CommentId
      where c.ParentCommentFk = @commentId
        and (@isAdmin = 1 or c.AdminHidden = 0)
      order by c.CreatedDate asc
      ;
      """;

   const string Hide_Sql = """
      update Comments
      set AdminHidden = 1
         ,HiddenBy = @hiddenBy
         ,HiddenDate = getutcdate()
         ,HiddenReason = @hiddenReason
      where CommentId = @commentId
      ;
      """;

   const string Unhide_Sql = """
      update Comments
      set AdminHidden = 0
         ,HiddenBy = null
         ,HiddenDate = null
         ,HiddenReason = null
      where CommentId = @commentId
      ;
      """;

   const string GetAll_Sql = """
      SELECT c.CommentId
         ,c.PostFk
         ,c.ParentCommentFk
         ,p.Title AS PostTitle
         ,c.Title
         ,cast(c.EntryText as nvarchar(max)) EntryText
         ,c.AuthorName
         ,c.AuthorEmail
         ,c.CreatedDate
         ,c.AdminHidden
         ,c.HiddenBy
         ,c.HiddenDate
         ,c.HiddenReason
         ,isnull(u.Blocked, 0) AS AuthorBlocked
         ,(select count(*) from Comments r where r.ParentCommentFk = c.CommentId) ReplyCount
         ,isnull(rc.ReactionCounts, '') ReactionCounts
      FROM Comments c
      JOIN Posts p ON p.PostId = c.PostFk
      LEFT JOIN Users u ON u.Email = c.AuthorEmail
      LEFT JOIN (
         SELECT CommentFk, string_agg(Emoji + ':' + cast(EmojiCount as varchar(10)), ',') AS ReactionCounts
         FROM (SELECT CommentFk, Emoji COLLATE Latin1_General_100_BIN2 AS Emoji, count(*) AS EmojiCount FROM CommentReactions GROUP BY CommentFk, Emoji COLLATE Latin1_General_100_BIN2) x
         GROUP BY CommentFk
      ) rc ON rc.CommentFk = c.CommentId
      WHERE (@email IS NULL OR c.AuthorEmail = @email)
        AND (@postId IS NULL OR c.PostFk = @postId)
      ORDER BY c.CreatedDate DESC
      """;

   const string Add_Sql = """
      insert into Comments (PostFk, ParentCommentFk, Title, EntryText, AuthorName, AuthorEmail, AuthorIP, CreatedDate)
      values (@PostFk, @ParentCommentFk, @Title, @EntryText, @AuthorName, @AuthorEmail, @AuthorIp, getutcdate())
      ;
      """;
}
