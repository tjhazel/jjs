CREATE TABLE [dbo].[Users] (
    [Id]           UNIQUEIDENTIFIER CONSTRAINT [DF_Users_Id] DEFAULT (newid()) NOT NULL,
    [Email]         NVARCHAR (256)   NOT NULL,
    [DisplayName]  NVARCHAR (256)   NOT NULL,
    [Role] NVARCHAR(50)  NOT NULL,
    [IsDisabled] BIT  CONSTRAINT [DF_IsDisabled_Default] DEFAULT (0) NOT NULL, 
    [LastActivityDate] DATETIME         NOT NULL,
    [CreatedDate]      DATETIME         CONSTRAINT [DF_Users_CreatedDate] DEFAULT (getutcdate()) NOT NULL,
    [Blocked]          BIT              CONSTRAINT [DF_Users_Blocked] DEFAULT ((0)) NOT NULL,
    [BlockedBy]        NVARCHAR (256)   NULL,
    [BlockedDate]      DATETIME         NULL,
    [BlockedReason]    VARCHAR (500)    NULL,
    CONSTRAINT [PK_Users_Id] PRIMARY KEY NONCLUSTERED ([Id] ASC)
);

