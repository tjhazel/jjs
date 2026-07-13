CREATE TABLE [dbo].[Posts] (
    [PostId]          INT              IDENTITY (1, 1) NOT NULL,
    [Title]           NVARCHAR (255)   NOT NULL,
    [PreviewText]     NVARCHAR (500)   NOT NULL,
    [Body]            NVARCHAR (MAX)   NOT NULL,
    [ReleaseDate]     SMALLDATETIME    NULL,
    [ExpireDate]      SMALLDATETIME    NULL,
    [CommentsEnabled] BIT              CONSTRAINT [DF_Posts_CommentsEnabled] DEFAULT ((1)) NOT NULL,
    [Approved]        BIT              CONSTRAINT [DF_Posts_Approved] DEFAULT ((0)) NOT NULL,
    [ViewCount]       BIGINT           CONSTRAINT [DF_Posts_ViewCount] DEFAULT ((0)) NOT NULL,
    [CreatedDate]     SMALLDATETIME    NOT NULL,
    [CreatedByFk]     UNIQUEIDENTIFIER NOT NULL,
    [ModifiedDate]    SMALLDATETIME    NOT NULL,
    [ModifiedByFk]    UNIQUEIDENTIFIER NOT NULL,
    [ImageUrl]        NVARCHAR (500)   NULL,
    [Archived]        BIT              NULL,
    [CircleOfTrust]   BIT              NULL,
    CONSTRAINT [PK_sb_posts] PRIMARY KEY CLUSTERED ([PostId] ASC),
    CONSTRAINT [FK_Posts_Users_CreatedBy] FOREIGN KEY ([CreatedByFk]) REFERENCES [dbo].[Users] ([Id]),
    CONSTRAINT [FK_Posts_Users_ModifiedBy] FOREIGN KEY ([ModifiedByFk]) REFERENCES [dbo].[Users] ([Id])
);




GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Auto incrementing id', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Posts', @level2type = N'COLUMN', @level2name = N'PostId';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Title fo the post', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Posts', @level2type = N'COLUMN', @level2name = N'Title';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Preview text to display in search lists', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Posts', @level2type = N'COLUMN', @level2name = N'PreviewText';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Content of the post.  Support saving formatted html.', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Posts', @level2type = N'COLUMN', @level2name = N'Body';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Date to start displaying this article', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Posts', @level2type = N'COLUMN', @level2name = N'ReleaseDate';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Date to stop displaying this article', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Posts', @level2type = N'COLUMN', @level2name = N'ExpireDate';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Flag to determine if comments should be allowed', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Posts', @level2type = N'COLUMN', @level2name = N'CommentsEnabled';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Flag to determine if article has been approved for display on site.', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Posts', @level2type = N'COLUMN', @level2name = N'Approved';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Number of times this article is viewed.', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Posts', @level2type = N'COLUMN', @level2name = N'ViewCount';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'date the post was created.', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Posts', @level2type = N'COLUMN', @level2name = N'CreatedDate';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'key to link to the users table.  Users must exist to upload', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Posts', @level2type = N'COLUMN', @level2name = N'CreatedByFk';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'date the post was last modified', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Posts', @level2type = N'COLUMN', @level2name = N'ModifiedDate';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'key to link to the users table.  Users must exist to upload', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Posts', @level2type = N'COLUMN', @level2name = N'ModifiedByFk';

