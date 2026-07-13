
CREATE VIEW [dbo].[vw_cust_PostCategorySummary]

as

select p.*
	,DATEPART(yyyy, p.CreatedDate) as 'CreatedYear'
	,DATEPART(m, p.CreatedDate) as 'CreatedMonth'
	,DATEPART(d, p.CreatedDate) as 'CreatedDay'
	,dbo.ConcatCategories(p.PostId) CrossPosts
	,c.CategoryId
	,c.CategoryTypeFk
	,ct.CategoryType
	,c.Title CategoryTitle
	,c.[Description]
	,c.ImageUrl 'categoryimageurl' 
	,isnull((select count(cmt.CommentId) 
			from Comments cmt 
			where cmt.PostFk = p.PostId),0) as 'CommentCount'
	,cu.DisplayName as 'CreatedBy'
	,mu.DisplayName as 'ModifiedBy'
	,Left(CONVERT(varchar(255), p.Title), 255) as [FriendlyName]

from Posts P
inner join PostCategories pc on pc.PostFk = p.PostId
inner join Categories c on c.CategoryId = pc.CategoryFk
inner join CategoryTypes ct on ct.CategoryTypeId = c.CategoryTypeFk
inner join users cu on cu.Id = P.CreatedByFk
inner join users mu on mu.Id = P.ModifiedByFk

where 
p.Approved = 1 and 
isnull(p.ReleaseDate,dateadd(d,1,getdate())) <= getdate()
and isnull(p.[ExpireDate], dateadd(d,1,getdate())) > getdate()

