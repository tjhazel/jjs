CREATE TABLE [dbo].[Ingredients_xref] (
    [IngredientsXrefId] INT            IDENTITY (1, 1) NOT NULL,
    [RecipeFk]          INT            NOT NULL,
    [IngredientFk]      INT            NOT NULL,
    [Amount]            NVARCHAR (50)  NOT NULL,
    [UnitOfMeasureFk]   INT            NOT NULL,
    [Description]       NVARCHAR (255) NULL,
    [Sequence]          FLOAT (53)     CONSTRAINT [DF_Ingredients_xref_Sequence] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [FK_Ingredients_xref_Ingredients] FOREIGN KEY ([IngredientFk]) REFERENCES [dbo].[Ingredients] ([IngredientId]),
    CONSTRAINT [FK_Ingredients_xref_Recipes] FOREIGN KEY ([RecipeFk]) REFERENCES [dbo].[Recipes] ([RecipeId]),
    CONSTRAINT [FK_Ingredients_xref_UnitOfMeasure] FOREIGN KEY ([UnitOfMeasureFk]) REFERENCES [dbo].[UnitOfMeasure] ([UnitOfMeasureId])
);

