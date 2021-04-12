CREATE TABLE [dbo].[UnitOfMeasure] (
    [UnitOfMeasureId] INT            IDENTITY (1, 1) NOT NULL,
    [Name]            NVARCHAR (255) NOT NULL,
    [PluralName]      NVARCHAR (255) NOT NULL,
    CONSTRAINT [PK_UnitOfMeasure] PRIMARY KEY CLUSTERED ([UnitOfMeasureId] ASC)
);

