CREATE TABLE [dbo].[Ingredients] (
    [IngredientId]   INT            IDENTITY (1, 1) NOT NULL,
    [Name]           NVARCHAR (255) NOT NULL,
    [IngredientType] NVARCHAR (50)  NOT NULL,
    CONSTRAINT [PK_Ingredients] PRIMARY KEY CLUSTERED ([IngredientId] ASC)
);


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Name of the ingredient', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Ingredients', @level2type = N'COLUMN', @level2name = N'Name';

