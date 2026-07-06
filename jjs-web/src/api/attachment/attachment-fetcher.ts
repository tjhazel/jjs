import type { TPostFormData } from '@lib/httpClient';

const attachmentUrl = 'api/attachment';

interface UploadResult {
  attachmentId: number;
  fileName: string;
}

export const uploadAttachment = async (
  httpPostFormData: TPostFormData,
  file: File
): Promise<string> => {
  const fd = new FormData();
  fd.append('file', file);
  const result = await httpPostFormData<UploadResult>(attachmentUrl, fd);
  return `/api/attachment/${result.attachmentId}/content`;
};
