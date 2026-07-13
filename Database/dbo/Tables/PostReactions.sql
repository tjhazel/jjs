CREATE TABLE [dbo].[PostReactions] (
    [ReactionId] INT           IDENTITY (1, 1) NOT NULL,
    [PostFk]     INT           NOT NULL,
    [Email]      NVARCHAR (500) NOT NULL,
    [Emoji]      NVARCHAR (10)  COLLATE Latin1_General_100_BIN2 NOT NULL,
    [ReactedAt]  SMALLDATETIME  DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_PostReactions] PRIMARY KEY CLUSTERED ([ReactionId] ASC),
    CONSTRAINT [FK_PostReactions_Posts] FOREIGN KEY ([PostFk]) REFERENCES [dbo].[Posts] ([PostId]),
    CONSTRAINT [UQ_PostReactions_UserEmoji] UNIQUE ([PostFk], [Email], [Emoji])
);
