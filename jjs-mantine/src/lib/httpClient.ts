import axios, { type AxiosRequestConfig, AxiosError, type Method } from 'axios';

// 1. HTTP Verb Enum Definition
// 1. The Erasable Verb Definition (Safe for --erasableSyntaxOnly)
export const HttpVerb = {
   GET: 'GET',
   POST: 'POST',
   PUT: 'PUT',
   DELETE: 'DELETE',
   PATCH: 'PATCH'
} as const;

// Export the type so you can still use 'HttpVerb' as a type annotation
export type HttpVerb = typeof HttpVerb[keyof typeof HttpVerb];

// 2. Clear Type Interface for Errors
export interface HttpError {
   httpErrorCode?: string;
   responseStatus?: number;
   responseData?: unknown;
   message: string;
}

// 3. Central Error Handler Utility
export const handleError = (err: AxiosError): HttpError => {
   const error: HttpError = { httpErrorCode: err.code, message: err.message };

   // Clean structural error log (Avoids the blank JSON.stringify "{}" limitation)
   console.error("HTTP Client Error Intercepted:", {
      code: err.code,
      message: err.message,
      status: err.response?.status,
      url: err.config?.url
   });

   if (err.response) {
      let rawData = '';
      try {
         rawData = err.response.data ? JSON.stringify(err.response.data).trim() : '';
      } catch {
         // Safe fallback container
      }

      error.httpErrorCode = err.code;
      error.responseStatus = err.response.status;
      error.responseData = err.response.data;
      error.message = `[${err.response.status}] ${err.message}${rawData.length > 2 ? ': ' + rawData : ''}`;
   } else if (err.request) {
      error.message += ` Client never received a response, or request never left.`;
   } else {
      error.message += ` Unable to process request.`;
   }
   return error;
};

// 4. Central Dynamic Configuration Factory
const getConfig = async (
   getToken?: () => Promise<string>,
   configOptions?: AxiosRequestConfig
): Promise<AxiosRequestConfig> => {
   const options: AxiosRequestConfig = {
      headers: {
         'Content-Type': 'application/json'
      },
      timeout: 300000 // 5 Minute standard threshold
   };

   if (typeof getToken === 'function') {
      const accessToken = await getToken();
      options.headers = {
         ...options.headers,
         'Authorization': `Bearer ${accessToken}`
      };
   }

   return configOptions ? { ...options, ...configOptions } : options;
};

// 5. Core Unified Request Dispatcher
const request = async <T>(
   method: Method,
   url: string,
   getToken: () => Promise<string>,
   body?: object,
   extraConfig?: AxiosRequestConfig
): Promise<T> => {
   try {
      const baseConfig = await getConfig(getToken, extraConfig);
      const response = await axios({
         method,
         url,
         data: body, // Let Axios handle automatic serialization natively!
         ...baseConfig
      });
      return response.data;
   } catch (error) {
      throw handleError(error as AxiosError);
   }
};

// 6. Public Exported Functional Methods
export const httpGet = async <T>(url: string, getToken: () => Promise<string>): Promise<T> => {
   return request<T>('GET', url, getToken);
};

export const httpPost = async <T>(url: string, getToken: () => Promise<string>, body?: object): Promise<T> => {
   return request<T>('POST', url, getToken, body);
};

export const httpPut = async <T>(url: string, getToken: () => Promise<string>, body?: object): Promise<T> => {
   return request<T>('PUT', url, getToken, body);
};

export const httpPatch = async <T>(url: string, getToken: () => Promise<string>, body?: object): Promise<T> => {
   return request<T>('PATCH', url, getToken, body);
};

export const httpDelete = async <T>(url: string, getToken: () => Promise<string>): Promise<T> => {
   return request<T>('DELETE', url, getToken);
};

/**
 * Downloads binary stream objects (PDFs, Images, Excel sheets) natively using standard browser Blob allocations.
 */
export const httpGetByteUrl = async (
   url: string,
   getToken: () => Promise<string>,
   mediaType: string = "application/pdf"
): Promise<string> => {
   try {
      // Explicitly inject the browser-native binary configuration blob target flag
      const fileConfig = await getConfig(getToken, { responseType: 'blob' });
      const response = await axios.get(url, fileConfig);

      const file = new Blob([response.data], { type: mediaType });
      return URL.createObjectURL(file);
   } catch (error) {
      throw handleError(error as AxiosError);
   }
};

// 7. Explicit Helper Types
export type TGet = <T>(url: string, options?: object) => Promise<T>;
export type TPatch = <T>(url: string, body?: object) => Promise<T>;
export type TPost = <T>(url: string, body?: object) => Promise<T>;
export type TPut = <T>(url: string, body?: object) => Promise<T>;
export type TDelete = <T>(url: string) => Promise<T>;
