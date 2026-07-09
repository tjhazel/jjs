
if col_length('dbo.Users', 'Blocked') is null
begin
    alter table Users add Blocked bit not null constraint DF_Users_Blocked default 0
    ;
end
;

if col_length('dbo.Users', 'BlockedBy') is null
begin
    alter table Users add BlockedBy nvarchar(256) null
    ;
end
;

if col_length('dbo.Users', 'BlockedDate') is null
begin
    alter table Users add BlockedDate datetime null
    ;
end
;

if col_length('dbo.Users', 'BlockedReason') is null
begin
    alter table Users add BlockedReason varchar(500) null
    ;
end
;
