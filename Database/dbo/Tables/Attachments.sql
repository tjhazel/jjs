CREATE TABLE [dbo].[Attachments] (
    [AttachmentId]  INT            IDENTITY (1, 1) NOT NULL,
    [Name]          NVARCHAR (255) NOT NULL,
    [FileName]      NVARCHAR (255) NOT NULL,
    [FileSize]      INT            NOT NULL,
    [ContentType]   NVARCHAR (255) NOT NULL,
    [Data]          IMAGE          NOT NULL,
    [DownloadCount] BIGINT         CONSTRAINT [DF_Attachments_DownloadCount] DEFAULT ((0)) NULL,
    CONSTRAINT [PK_sb_attachments] PRIMARY KEY CLUSTERED ([AttachmentId] ASC)
);


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'id of the attachment', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Attachments', @level2type = N'COLUMN', @level2name = N'AttachmentId';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Name to display of the file.', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Attachments', @level2type = N'COLUMN', @level2name = N'Name';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'file name supplied when uploading file', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Attachments', @level2type = N'COLUMN', @level2name = N'FileName';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'string to tell us the type of encoding to use', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Attachments', @level2type = N'COLUMN', @level2name = N'ContentType';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'attachment stored as an image', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Attachments', @level2type = N'COLUMN', @level2name = N'Data';


GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'Field contains the number of downloads of this attachment.', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Attachments', @level2type = N'COLUMN', @level2name = N'DownloadCount';

