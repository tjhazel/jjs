CREATE TABLE [dbo].[PostCategories] (
    [PostCategoryId] INT IDENTITY (1, 1) NOT NULL,
    [PostFk]         INT NOT NULL,
    [CategoryFk]     INT NOT NULL,
    CONSTRAINT [PK_PostCategories] PRIMARY KEY CLUSTERED ([PostCategoryId] ASC),
    CONSTRAINT [FK_PostCategories_Categories] FOREIGN KEY ([CategoryFk]) REFERENCES [dbo].[Categories] ([CategoryId]),
    CONSTRAINT [FK_PostCategories_Posts] FOREIGN KEY ([PostFk]) REFERENCES [dbo].[Posts] ([PostId])
);


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Key to the Post  Categories', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'PostCategories', @level2type = N'COLUMN', @level2name = N'PostCategoryId';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Foreign key to the Posts table', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'PostCategories', @level2type = N'COLUMN', @level2name = N'PostFk';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Foreign key to the Categories Table.', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'PostCategories', @level2type = N'COLUMN', @level2name = N'CategoryFk';

