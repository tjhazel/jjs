import type { TPostFormData } from '@lib/httpClient';

const attachmentUrl = 'api/attachment';

interface UploadResult {
  attachmentId: number;
  fileName: string;
}

export const uploadAttachment = async (
  httpPostFormData: TPostFormData,
  file: File
): Promise<UploadResult> => {
  const fd = new FormData();
  fd.append('file', file);
  return httpPostFormData<UploadResult>(attachmentUrl, fd);
};
