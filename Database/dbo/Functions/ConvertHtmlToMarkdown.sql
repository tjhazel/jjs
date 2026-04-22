CREATE FUNCTION [dbo].[ConvertHtmlToMarkdown]
(
	@html NVARCHAR(MAX)
)
RETURNS NVARCHAR(MAX)
AS
BEGIN
	DECLARE @markdown NVARCHAR(MAX) = @html;

    -- 1. Replace Non-Breaking Spaces with regular spaces
    SET @markdown = REPLACE(@markdown, '&nbsp;', ' ');

    -- 2. Replace Line Breaks with a single newline (Markdown standard)
    -- Markdown uses CHAR(10) for line feeds
    SET @markdown = REPLACE(REPLACE(@markdown, '<br>', CHAR(10)), '<br />', CHAR(10));

    -- 3. Replace Paragraph tags with double newlines
    SET @markdown = REPLACE(REPLACE(@markdown, '<p>', CHAR(10) + CHAR(10)), '</p>', '');

    -- 4. Simple HREF Conversion (Basic Implementation)
    -- Note: This only works for one link per string and assumes standard formatting
    -- For multiple links, a WHILE loop or CLR is required.
    IF CHARINDEX('<a href="', @markdown) > 0
    BEGIN
        DECLARE @Start INT, @End INT, @UrlStart INT, @UrlEnd INT, @TextStart INT, @TextEnd INT;
        DECLARE @URL NVARCHAR(MAX), @LinkText NVARCHAR(MAX), @FullTag NVARCHAR(MAX);

        SET @Start = CHARINDEX('<a href="', @markdown);
        SET @UrlStart = @Start + 9;
        SET @UrlEnd = CHARINDEX('"', @markdown, @UrlStart);
        SET @URL = SUBSTRING(@markdown, @UrlStart, @UrlEnd - @UrlStart);

        SET @TextStart = CHARINDEX('>', @markdown, @UrlEnd) + 1;
        SET @TextEnd = CHARINDEX('</a>', @markdown, @TextStart);
        SET @LinkText = SUBSTRING(@markdown, @TextStart, @TextEnd - @TextStart);

        SET @FullTag = SUBSTRING(@markdown, @Start, (@TextEnd + 4) - @Start);
        
        -- Replace the first occurrence with Markdown format [Text](URL)
        SET @markdown = STUFF(@markdown, @Start, LEN(@FullTag), '[' + @LinkText + '](' + @URL + ')');
    END

    -- 5. Final Cleanup: Remove any remaining unexpected HTML tags
   SET @markdown = REPLACE(@markdown, '&amp;', '&');


    RETURN LTRIM(RTRIM(@markdown));
END
