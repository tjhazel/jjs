CREATE TABLE [dbo].[RecipeInstructions] (
    [RecipeInstructionId] INT            IDENTITY (1, 1) NOT NULL,
    [RecipeFk]            INT            NOT NULL,
    [Name]                NVARCHAR (255) NOT NULL,
    [Instructions]        NTEXT          NULL,
    [Sequence]            FLOAT (53)     CONSTRAINT [DF_RecipeInstructions_Sequence] DEFAULT ((1)) NOT NULL,
    CONSTRAINT [PK_RecipeInstructions] PRIMARY KEY CLUSTERED ([RecipeInstructionId] ASC),
    CONSTRAINT [FK_RecipeInstructions_Recipes] FOREIGN KEY ([RecipeFk]) REFERENCES [dbo].[Recipes] ([RecipeId])
);

