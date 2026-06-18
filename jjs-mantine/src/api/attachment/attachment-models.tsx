export interface Attachment {
   attachmentId: number | null;
   name: string;
   fileName: string;
   fileSize: number;
   contentType: string;
   downloadCount: number;
   content: string;
}

export interface AttachmentViewModel {
   name: string;
   fileName: string;
   fileSize: number;
   contentType: string;
   downloadCount: number;
   contentBase64: string | null;
}