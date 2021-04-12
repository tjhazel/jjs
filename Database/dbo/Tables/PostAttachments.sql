CREATE TABLE [dbo].[PostAttachments] (
    [PostAttachmentId] INT IDENTITY (1, 1) NOT NULL,
    [PostFk]           INT NOT NULL,
    [AttachmentFk]     INT NOT NULL,
    CONSTRAINT [PK_PostAttachments] PRIMARY KEY CLUSTERED ([PostAttachmentId] ASC)
);


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Key to the Post Attachments', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'PostAttachments', @level2type = N'COLUMN', @level2name = N'PostAttachmentId';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Key to the posts', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'PostAttachments', @level2type = N'COLUMN', @level2name = N'PostFk';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Key to the Attachments', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'PostAttachments', @level2type = N'COLUMN', @level2name = N'AttachmentFk';

