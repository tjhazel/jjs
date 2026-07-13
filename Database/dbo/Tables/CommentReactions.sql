CREATE TABLE [dbo].[CommentReactions] (
    [ReactionId] INT           IDENTITY (1, 1) NOT NULL,
    [CommentFk]  INT           NOT NULL,
    [Email]      NVARCHAR (500) NOT NULL,
    [Emoji]      NVARCHAR (10)  COLLATE Latin1_General_100_BIN2 NOT NULL,
    [ReactedAt]  SMALLDATETIME  DEFAULT (getutcdate()) NOT NULL,
    CONSTRAINT [PK_CommentReactions] PRIMARY KEY CLUSTERED ([ReactionId] ASC),
    CONSTRAINT [FK_CommentReactions_Comments] FOREIGN KEY ([CommentFk]) REFERENCES [dbo].[Comments] ([CommentId]),
    CONSTRAINT [UQ_CommentReactions_UserEmoji] UNIQUE ([CommentFk], [Email], [Emoji])
);
