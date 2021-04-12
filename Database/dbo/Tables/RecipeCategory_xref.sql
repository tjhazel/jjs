CREATE TABLE [dbo].[RecipeCategory_xref] (
    [RecipeCategoryXrefId] INT IDENTITY (1, 1) NOT NULL,
    [RecipeFk]             INT NOT NULL,
    [RecipeCategoryFk]     INT NOT NULL,
    CONSTRAINT [PK_RecipeCategory_xref] PRIMARY KEY CLUSTERED ([RecipeCategoryXrefId] ASC),
    CONSTRAINT [FK_RecipeCategory_xref_RecipeCategories] FOREIGN KEY ([RecipeCategoryFk]) REFERENCES [dbo].[RecipeCategories] ([RecipeCategoryId]),
    CONSTRAINT [FK_RecipeCategory_xref_Recipes] FOREIGN KEY ([RecipeFk]) REFERENCES [dbo].[Recipes] ([RecipeId])
);

