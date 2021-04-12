CREATE FUNCTION [dbo].[ConcatCategories](@PostId int)
RETURNS VARCHAR(1000)
AS
BEGIN
	DECLARE @Output VARCHAR(1000)
	SET @Output = ''

	SELECT @Output =	CASE @Output 
				WHEN '' THEN C.Title
				ELSE @Output + ', ' + C.Title
				END
	FROM Categories C
	INNER JOIN PostCategories PC on PC.CategoryFk = C.CategoryId
	WHERE PC.PostFk = @PostId

	RETURN @Output
END
