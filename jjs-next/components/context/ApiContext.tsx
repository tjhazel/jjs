"use client" 

import * as React from 'react'
//import { useUserContext } from '../auth/authContext';
import * as httpClient from '@/lib/httpClient';
import { HttpVerb } from '@/lib/httpClient';

//import { HttpVerb, useErrorContext, IApiErrorMessage } from './ErrorContext';

export interface IApiContextProps {
   httpGet: httpClient.TGet;
   // httpGetByteUrl: httpClient.TGetByteUrl;
    httpPatch: httpClient.TPatch;
    httpPost: httpClient.TPost;
    httpPut: httpClient.TPut;
   // httpPutFile: httpClient.TPutFile;
    httpDelete: httpClient.TDelete;
   // apiErrors: IApiErrorMessage[];
   // removeError: (key: string) => void;
}

export const ApiContext = React.createContext<IApiContextProps>({} as IApiContextProps);
export const useApiContext = () => React.useContext(ApiContext);

interface IApiContextProviderProps {
   children: React.ReactNode;
}

export const ApiContextProvider: React.FC<IApiContextProviderProps> = (props) => {
   //const { getToken } = useUserContext();
   const getToken = async (force: boolean = false): Promise<string> => {
      return new Promise((resolve, reject) => {
         setTimeout(() => {
            const data = "sample-token";
            resolve(data);
         }, 10); // Simulate a 1-second delay
      });
   }
//   const { addError, removeError, apiErrors } = useErrorContext(); 
  
   const httpGet = async<T,>(url: string): Promise<T> => {
      return await httpClient.httpGet<T>(url, getToken)
         .catch((err: httpClient.HttpError) => {
  //          addError(url, err, HttpVerb.GET);
            throw err;
         });
   };

//    const httpGetByteUrl = async (url: string, mediaType?: string): Promise<string> => {
//       return await httpClient.httpGetByteUrl(url, getToken, mediaType)
//          .catch((err: httpClient.HttpError) => {
//  //           addError(url, err, HttpVerb.GET);
//             throw err;
//          });
//    };

   const httpPatch = async<T,>(url: string, body?: object): Promise<T> => {
      return await httpClient.httpPatch<T>(url, getToken, body)
         .catch((err: httpClient.HttpError) => {
   //         addError(url, err, HttpVerb.PATCH);
            throw err;
         });
   }

   const httpPost = async<T,>(url: string, body?: object): Promise<T> => {
      return await httpClient.httpPost<T>(url, getToken, body)
         .catch((err: httpClient.HttpError) => {
  //          addError(url, err, HttpVerb.POST);
            throw err;
         });
   };

   const httpPut = async<T,>(url: string, body?: object): Promise<T> => {
      return await httpClient.httpPut<T>(url, getToken, body)
         .catch((err: httpClient.HttpError) => {
   //         addError(url, err, HttpVerb.PUT);
            throw err;
         });
   };

   // const httpPutFile = async<T,>(url: string, file?: File): Promise<T> => {
   //    return await httpClient.httpPutFile<T>(url, getToken, file)
   //       .catch((err: httpClient.HttpError) => {
   //          addError(url, err, HttpVerb.PUT);
   //          throw err;
   //       });
   // };
   
   const httpDelete = async<T,>(url: string): Promise<T> => {
      return await httpClient.httpDelete<T>(url, getToken)
         .catch((err: httpClient.HttpError) => {
  //          addError(url, err, HttpVerb.DELETE);
            throw err;
         });
   };

   return <ApiContext.Provider 
      value={{
         httpGet,
  //       httpGetByteUrl,
         httpPatch,
         httpPost,
         httpPut,
//         httpPutFile,
         httpDelete,
//         apiErrors,
//         removeError
}}>
      { props.children }
    </ApiContext.Provider>;
};
