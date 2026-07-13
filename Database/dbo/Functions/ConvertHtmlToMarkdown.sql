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

   --  Now you see, we pride ourselves in with our &ldquo;attention to detail&rdquo;.  That was sort of a big oversight.  You would think something as big as a visa required to enter your vacation would have popped up on the radar somewhere.  Well, it didn't!!!  Good news though, it turns out that Australia is the only country in the world that allows an electronic visa application.  The very nice and kind lady, Aimee Nutini, quickly brought our blood pressure back to normal and hooked us up.  
   --  So, there we were, standing at the mercy of the United Airlines ticketing agent'I will add, we looked perfectly harmless and fairly happy (with minimal sleep).  Then we heard the line'&rdquo;Can I see your Visas?&rdquo;.  Now imagine, waiting years to make this trip, taking a years worth of vacation time, scheduling connecting flights, glacier trips, kayak trips, '.  And the only thing we could muster up was a simple, fleeting &ldquo;no ma am&rdquo;. Now you see, we pride ourselves in with our &ldquo;attention to detail&rdquo;.  That was sort of a big oversight.  You would think something as big as a visa required to enter your vacation would have popped up on the radar somewhere.  Well, it didn't!!!  Good news though, it turns out that Australia is the only country in the world that allows an electronic visa application.  The very nice and kind lady, Aimee Nutini, quickly brought our blood pressure back to normal and hooked us up.  We checked into our hotel in Sydney at 9:00 AM Monday morning.  That being said, we are having a great trip.  It is still day one with no (non air) sleep yet.  It has been less than 12 hours and we touched a python (Jeri too!), a two-headed skink, a starfish, and a sea cucumber.  We also got our first glimpse of a crocodile, wallaby, penguins, sharks, and koalas.  We finished the afternoon off with a drink in Darling Harbour (note the misspelling') and we are contemplating what to do for dinner.  This pretty much ends our first post in our private version of the amazing race'.  Make sure to shoot us some comments to this'feel free to offer up some suggestions on what to do next!  
    -- Strip remaining HTML tags
    DECLARE @Start INT = PATINDEX('%<[^>]*>%', @md);
    WHILE @Start > 0
    BEGIN
        SET @md = STUFF(@md, @Start, CHARINDEX('>', @md, @Start) - @Start + 1, '');
        SET @Start = PATINDEX('%<[^>]*>%', @md);
    END

    RETURN TRIM(@md);
END