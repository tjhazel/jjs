
export interface HttpError {
   httpErrorCode?: string;
   responseStatus?: number;
   responseData?: any;
   message: string;
}