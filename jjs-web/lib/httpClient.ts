import axios, { AxiosRequestConfig, AxiosError } from 'axios';

export const httpGet = async<T>(url: string,
   getToken?: () => Promise<string>
) => {
   return new Promise<T>(async (resolve, reject) => {
      var options: AxiosRequestConfig = await getConfig(getToken);     

      axios
         .get(url, options)
         .then((response: any) => {
            resolve(response.data as T)
         })
         .catch((response: AxiosError) => {
            reject(handleError(response));
            //reject(response)
         });
   })
};

// //https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
// export const httpGetByteUrl = async (url: string, getToken: () =>  Promise<string>, mediaType: string = "application/pdf") => {
//    return new Promise<string>(async (resolve, reject) => {
//       const options: AxiosRequestConfig = await getConfig(getToken);
//       options.responseType = "blob";

//       axios
//          .get(url, options)
//          .then((response: any) => {
//             const file = new Blob([response.data], { type: mediaType ?? "application/pdf" });
//             const fileUrl = URL.createObjectURL(file);
//             resolve(fileUrl as string)
//          })
//          .catch((response: AxiosError) => {
//            reject(handleError(response));
//          });
//    })
// };

export const httpPatch = async<T>(url: string, getToken: () =>  Promise<string>, body?: object) => {
   return new Promise<T>(async (resolve, reject) => {
      const options: AxiosRequestConfig = await getConfig(getToken);
      axios
         .patch(url, JSON.stringify(body), options)
         .then((response: any) => {
            resolve(response.data as T)
         })
         .catch((response: any) => {
            reject(handleError(response));
         });
   })
};

export const httpPost = async<T>(url: string, getToken: () =>  Promise<string>, body?: object) => {
   return new Promise<T>(async (resolve, reject) => {
      const options: AxiosRequestConfig = await getConfig(getToken);

      axios
         .post(url, JSON.stringify(body), options)
         .then((response: any) => {
            resolve(response.data as T)
         })
         .catch((response: any) => {
            reject(handleError(response));
         });
   })
};

export const httpPut = async<T>(url: string, getToken: () =>  Promise<string>, body?: object) => {
   return new Promise<T>(async (resolve, reject) => {
      const options: AxiosRequestConfig = await getConfig(getToken);

      axios
         .put(url, JSON.stringify(body), options)
         .then((response: any) => {
            resolve(response.data as T)
         })
         .catch((response: any) => {
            reject(handleError(response));
         });
   })
};

export const httpDelete = async<T>(url: string, getToken: () =>  Promise<string>) => {
   return new Promise<T>(async (resolve, reject) => {
      const options: AxiosRequestConfig = await getConfig(getToken);
      axios
         .delete(url, options)
         .then((response: any) => {
            resolve(response.data as T)
         })
         .catch((response: any) => {
            reject(handleError(response));
         });
   })
};

export const handleError = (err: AxiosError): HttpError => {
   const error: HttpError = {
      httpErrorCode: err.code,
      message: err.message
   };

   try {
      console.error(JSON.stringify(err))     
   } finally {
      //already console logged,just wrappign to make sure we don't kill it.
   }

   if (err.response) {
      var rawData = '';
      try {
         rawData = err.response?.data ? JSON.stringify(err.response?.data)?.trim() : ''
      } finally { }
      // client received an error response (5xx, 4xx)
      error.httpErrorCode = err.code;
      error.responseStatus = err.response.status;
      error.responseData = err.response.data;
      error.message = `[${err.response.status}] ${err.message}${rawData?.trim()?.length > 2 ? ': ' + rawData : ''}`;
      //throw new Error(`[${err.response.status}]: ${err.response.data}`);
   } else if (err.request) {
      // client never received a response, or request never left
      error.message += ` Client never received a response, or request never left.`;
      //throw new Error("Client never received a response, or request never left");
   } else {
      // anything else
      error.message += ` Unable to process request.`;
      //throw new Error("Unable to process request");
   }
  
   return error;
}

//const getConfig: Promise<AxiosRequestConfig> = async (getToken: () => Promise<string>, configOptions?: AxiosRequestConfig) => {
const getConfig = async (
  getToken?: () => Promise<string>,
  configOptions?: AxiosRequestConfig
): Promise<AxiosRequestConfig> => {
   
   // axios request options like headers etc
   const options: AxiosRequestConfig = {
      headers: {
         'Content-Type': 'application/json'
      },
      timeout: 300000
   }

   if (typeof getToken === 'function') {
      const accessToken = await getToken();
      (options.headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
   }

   return configOptions
    ? { ...options, ...configOptions }
    : options;
};

export interface HttpError {
   httpErrorCode?: string;
   responseStatus?: number;
   responseData?: any;
   message: string;
}

export type TGet = <T>(url: string, options?: object) => Promise<T>;
export type TPatch = <T>(url: string, body?: object) => Promise<T>;
export type TPost = <T>(url: string, body?: object) => Promise<T>;
export type TPut = <T>(url: string, body?: object) => Promise<T>;
//export type TPutFile = <T>(url: string, file?: File) => Promise<T>;
export type TDelete = <T>(url: string) => Promise<T>;

//export type TGetByteUrl = (url: string, mediaType?: string) => Promise<String>;

export enum HttpVerb {
   GET,
   POST,
   PUT,
   DELETE,
   PATCH
}