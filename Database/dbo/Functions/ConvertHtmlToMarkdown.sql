CREATE FUNCTION [dbo].[ConvertHtmlToMarkdown]
(
    @html NVARCHAR(MAX)
)
RETURNS NVARCHAR(MAX)
AS
BEGIN
    DECLARE @md NVARCHAR(MAX) = @html;

    -- 1. Handle Div Tags (Treat as block elements/line breaks)
    SET @md = REPLACE(@md, '<div>', CHAR(13) + CHAR(10));
    SET @md = REPLACE(@md, '</div>', CHAR(13) + CHAR(10));

    -- 2. Handle Image Tags: <img src="URL" alt="Text"> -> ![Text](URL)
    DECLARE @ImgStart INT = CHARINDEX('<img ', @md);
    WHILE @ImgStart > 0
    BEGIN
        DECLARE @ImgEnd INT = CHARINDEX('>', @md, @ImgStart);
        DECLARE @FullImg NVARCHAR(MAX) = SUBSTRING(@md, @ImgStart, @ImgEnd - @ImgStart + 1);
        
        DECLARE @SrcStart INT = CHARINDEX('src="', @FullImg) + 5;
        DECLARE @SrcEnd INT = CHARINDEX('"', @FullImg, @SrcStart);
        DECLARE @ImgURL NVARCHAR(MAX) = CASE WHEN @SrcStart > 5 THEN SUBSTRING(@FullImg, @SrcStart, @SrcEnd - @SrcStart) ELSE '' END;
        
        DECLARE @AltStart INT = CHARINDEX('alt="', @FullImg) + 5;
        DECLARE @AltEnd INT = CHARINDEX('"', @FullImg, @AltStart);
        DECLARE @AltText NVARCHAR(MAX) = CASE WHEN @AltStart > 5 THEN SUBSTRING(@FullImg, @AltStart, @AltEnd - @AltStart) ELSE '' END;
        
        SET @md = STUFF(@md, @ImgStart, LEN(@FullImg), '![' + @AltText + '](' + @ImgURL + ')');
        SET @ImgStart = CHARINDEX('<img ', @md);
    END

    -- 3. Handle Anchor Tags: <a href="URL">Text</a> -> [Text](URL)
    DECLARE @AnchorStart INT = CHARINDEX('<a ', @md);
    WHILE @AnchorStart > 0
    BEGIN
        DECLARE @AnchorEnd INT = CHARINDEX('</a>', @md, @AnchorStart) + 4;
        DECLARE @FullAnchor NVARCHAR(MAX) = SUBSTRING(@md, @AnchorStart, @AnchorEnd - @AnchorStart);
        
        DECLARE @HrefStart INT = CHARINDEX('href="', @FullAnchor) + 6;
        DECLARE @HrefEnd INT = CHARINDEX('"', @FullAnchor, @HrefStart);
        DECLARE @URL NVARCHAR(MAX) = SUBSTRING(@FullAnchor, @HrefStart, @HrefEnd - @HrefStart);
        
        DECLARE @TagClose INT = CHARINDEX('>', @FullAnchor) + 1;
        DECLARE @TextEnd INT = CHARINDEX('</a>', @FullAnchor);
        DECLARE @LinkText NVARCHAR(MAX) = SUBSTRING(@FullAnchor, @TagClose, @TextEnd - @TagClose);
        
        SET @md = STUFF(@md, @AnchorStart, LEN(@FullAnchor), '[' + @LinkText + '](' + @URL + ')');
        SET @AnchorStart = CHARINDEX('<a ', @md);
    END

    -- 4. Basic Tag Replacements & Cleanup
    SET @md = REPLACE(@md, '<h1>', '# '); SET @md = REPLACE(@md, '</h1>', CHAR(13));
    SET @md = REPLACE(@md, '<h2>', '# '); SET @md = REPLACE(@md, '</h2>', CHAR(13));
    SET @md = REPLACE(@md, '<h3>', '# '); SET @md = REPLACE(@md, '</h3>', CHAR(13));
    SET @md = REPLACE(@md, '<h4>', '# '); SET @md = REPLACE(@md, '</h4>', CHAR(13));
    SET @md = REPLACE(@md, '<h5>', '# '); SET @md = REPLACE(@md, '</h5>', CHAR(13));
    SET @md = REPLACE(@md, '<h6>', '# '); SET @md = REPLACE(@md, '</h6>', CHAR(13));
    SET @md = REPLACE(@md, '<i>', '**'); SET @md = REPLACE(@md, '</i>', '**');
    SET @md = REPLACE(@md, '<b>', '**'); SET @md = REPLACE(@md, '</b>', '**');
    SET @md = REPLACE(@md, '<strong>', '**'); SET @md = REPLACE(@md, '</strong>', '**');
    SET @md = REPLACE(@md, '<li>', '* '); SET @md = REPLACE(@md, '</li>', CHAR(13));
    SET @md = REPLACE(@md, '<p>', CHAR(13) + CHAR(10)); SET @md = REPLACE(@md, '</p>', CHAR(13) + CHAR(10));
    SET @md = REPLACE(REPLACE(@md, '<br>', CHAR(10)), '<br />', CHAR(10));

     -- 5. Final Cleanup: Remove any remaining unexpected HTML tags
   SET @md = REPLACE(@md, '&nbsp;', ' ');
   SET @md = REPLACE(@md, '&amp;', '&');
   SET @md = REPLACE(@md, '&hellip;', '''');
   SET @md = REPLACE(@md, '&ldquo;', '''');
   SET @md = REPLACE(@md, '&rsquo;', '''');

    -- Strip remaining HTML tags
    DECLARE @Start INT = PATINDEX('%<[^>]*>%', @md);
    WHILE @Start > 0
    BEGIN
        SET @md = STUFF(@md, @Start, CHARINDEX('>', @md, @Start) - @Start + 1, '');
        SET @Start = PATINDEX('%<[^>]*>%', @md);
    END

    RETURN TRIM(@md);
END
