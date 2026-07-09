
if col_length('dbo.Users', 'CreatedDate') is null
begin
    alter table Users add CreatedDate datetime null constraint DF_Users_CreatedDate default getutcdate();    
end
;

GO

update users set CreatedDate = '2006-06-05 00:00:00' where email='jhazeltine1@gmail.com' and CreatedDate is null;

update u
set u.CreatedDate = src.EarliestDate
from Users u
inner join (
   select u.Id,
      min(isnull(p.ReleaseDate, isnull(c.CreatedDate, getutcdate()))) 'EarliestDate'
   from Users u
   left join Posts p on p.CreatedByFk = u.Id
   left join Comments c on c.PostFk = p.PostId
   where u.CreatedDate is null
   group by u.Id
) src on src.Id = u.Id

GO 

if columnproperty(object_id('dbo.Users'), 'CreatedDate', 'AllowsNull') = 1
begin
   alter table Users alter column CreatedDate datetime not null;
end
;

select * from users