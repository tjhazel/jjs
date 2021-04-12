CREATE TABLE [dbo].[CategoryTypes] (
    [CategoryTypeId] INT           IDENTITY (1, 1) NOT NULL,
    [CategoryType]   NVARCHAR (50) NOT NULL,
    CONSTRAINT [PK_CategoryTypes] PRIMARY KEY CLUSTERED ([CategoryTypeId] ASC)
);

