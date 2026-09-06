CREATE TABLE [dbo].[CrossCountry] (
    [CrossCountryId] INT IDENTITY (1, 1) NOT NULL,
    [RunnerName]     VARCHAR (256) NOT NULL,
    [EventDate]      DATE         NOT NULL,
    [EventName]      VARCHAR (255) NOT NULL,
    [EventUrl]       VARCHAR (500) NULL,
    [RunnersTime]    INT          NULL,
    [Notes]          VARCHAR (MAX) NULL,
    CONSTRAINT [PK_CrossCountry] PRIMARY KEY CLUSTERED ([CrossCountryId] ASC)
);
