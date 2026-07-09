
if col_length('dbo.Comments', 'AdminHidden') is null
begin
    alter table Comments add AdminHidden bit not null constraint DF_Comments_AdminHidden default 0
    ;
end
;

if col_length('dbo.Comments', 'HiddenBy') is null
begin
    alter table Comments add HiddenBy nvarchar(256) null
    ;
end
;

if col_length('dbo.Comments', 'HiddenDate') is null
begin
    alter table Comments add HiddenDate datetime null
    ;
end
;
