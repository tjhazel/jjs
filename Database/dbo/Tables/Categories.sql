CREATE TABLE [dbo].[Categories] (
    [CategoryId]     INT              IDENTITY (1, 1) NOT NULL,
    [CategoryTypeFk] INT              NOT NULL,
    [Title]          NVARCHAR (255)   NOT NULL,
    [Description]    NVARCHAR (1000)  NULL,
    [ImageUrl]       NVARCHAR (255)   NULL,
    [CreatedDate]    SMALLDATETIME    CONSTRAINT [DF_Categories_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [CreatedByFk]    UNIQUEIDENTIFIER NOT NULL,
    [ModifiedDate]   SMALLDATETIME    NOT NULL,
    [ModifiedByFk]   UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [PK_sb_keywords] PRIMARY KEY CLUSTERED ([CategoryId] ASC),
    CONSTRAINT [FK_Categories_CategoryTypes] FOREIGN KEY ([CategoryTypeFk]) REFERENCES [dbo].[CategoryTypes] ([CategoryTypeId])
);


GO
CREATE UNIQUE NONCLUSTERED INDEX [IX_Categories_Title_Unique]
    ON [dbo].[Categories]([Title] ASC);


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Key to the categories', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Categories', @level2type = N'COLUMN', @level2name = N'CategoryId';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Category Title to display', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Categories', @level2type = N'COLUMN', @level2name = N'Title';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Category Description to display', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Categories', @level2type = N'COLUMN', @level2name = N'Description';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'url of the image.  Use format of ~/Images/img.gif', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Categories', @level2type = N'COLUMN', @level2name = N'ImageUrl';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'date the post was created.', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Categories', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'key to link to the users table.  Users must exist to upload', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Categories', @level2type = N'COLUMN', @level2name = N'CreatedByFk';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'date the post was last modified', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Categories', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'key to link to the users table.  Users must exist to upload', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Categories', @level2type = N'COLUMN', @level2name = N'ModifiedByFk';

