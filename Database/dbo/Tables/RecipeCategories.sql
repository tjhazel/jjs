CREATE TABLE [dbo].[RecipeCategories] (
    [RecipeCategoryId] INT            IDENTITY (1, 1) NOT NULL,
    [Name]             NVARCHAR (255) NOT NULL,
    CONSTRAINT [PK_RecipeCategories] PRIMARY KEY CLUSTERED ([RecipeCategoryId] ASC)
);

