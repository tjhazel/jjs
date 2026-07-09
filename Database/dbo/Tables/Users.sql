CREATE TABLE [dbo].[Users] (
    [Id]           UNIQUEIDENTIFIER CONSTRAINT [DF_Users_Id] DEFAULT (newid()) NOT NULL,
    [Email]         NVARCHAR (256)   NOT NULL,
    [DisplayName]  NVARCHAR (256)   NOT NULL,
    [Role] NVARCHAR(50)  NOT NULL,
    [IsDisabled] BIT  CONSTRAINT [DF_IsDisabled_Default] DEFAULT (0) NOT NULL, 
    [LastActivityDate] DATETIME         NOT NULL,
    [CreatedDate]      DATETIME         CONSTRAINT [DF_Users_CreatedDate] DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_Users_Id] PRIMARY KEY NONCLUSTERED ([Id] ASC)
);

