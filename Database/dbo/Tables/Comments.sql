CREATE TABLE [dbo].[Comments] (
    [CommentId]         INT            IDENTITY (1, 1) NOT NULL,
    [PostFk]            INT            NOT NULL,
    [Title]             NVARCHAR (255) NOT NULL,
    [EntryText]         NTEXT          NOT NULL,
    [AuthorName]        NVARCHAR (255) NOT NULL,
    [AuthorURL]         NVARCHAR (500) NULL,
    [AuthorIP]          NCHAR (15)     NULL,
    [AuthorEmail]       NVARCHAR (500) NOT NULL,
    [SubscribeComments] BIT            CONSTRAINT [DF_Comments_SubscribeComments] DEFAULT ((0)) NOT NULL,
    [CreatedDate]       SMALLDATETIME  CONSTRAINT [DF_Comments_CreatedDate] DEFAULT (getdate()) NOT NULL,
    [AdminHidden]       BIT            CONSTRAINT [DF_Comments_AdminHidden] DEFAULT ((0)) NOT NULL,
    [HiddenBy]          NVARCHAR (256) NULL,
    [HiddenDate]        DATETIME       NULL,
    CONSTRAINT [PK_sb_comments] PRIMARY KEY CLUSTERED ([CommentId] ASC),
    CONSTRAINT [FK_Comments_Posts] FOREIGN KEY ([PostFk]) REFERENCES [dbo].[Posts] ([PostId])
);


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Auto Invrementing ID', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Comments', @level2type = N'COLUMN', @level2name = N'CommentId';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Key to the post', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Comments', @level2type = N'COLUMN', @level2name = N'PostFk';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Text of the comment.  No HTML stored here.', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Comments', @level2type = N'COLUMN', @level2name = N'EntryText';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Author''s Name', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Comments', @level2type = N'COLUMN', @level2name = N'AuthorName';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Author''s URL', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Comments', @level2type = N'COLUMN', @level2name = N'AuthorURL';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Author''s IP address', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Comments', @level2type = N'COLUMN', @level2name = N'AuthorIP';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Author''s email', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Comments', @level2type = N'COLUMN', @level2name = N'AuthorEmail';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Flag to determine if the user wants to be notified about additional comments', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Comments', @level2type = N'COLUMN', @level2name = N'SubscribeComments';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'date the post was created.', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Comments', @level2type = N'COLUMN', @level2name = N'CreatedDate';

