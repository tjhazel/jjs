CREATE VIEW [dbo].[vw_cust_CategorySummary] as
	
	
select c.*
	,cu.DisplayName as 'CreatedBy'
	,mu.DisplayName as 'ModifiedBy'
	,ct.CategoryType
	,(select count(pc.PostId) from vw_cust_PostCategorySummary pc where pc.CategoryId = c.CategoryId) as 'PostCount'
	,(select count(cmt.CommentId) 
		from vw_cust_PostCategorySummary pc, Comments cmt 
		where cmt.PostFk = pc.PostId and pc.CategoryId = c.CategoryId) as 'CommentCount'
	,Left(CONVERT(varchar(255), c.[Title]), 255) as [FriendlyName]
from
	Categories c
inner join CategoryTypes ct on ct.CategoryTypeId = c.CategoryTypeFk
inner join users cu on cu.Id = C.CreatedByFk
inner join users mu on mu.Id = C.ModifiedByFk
