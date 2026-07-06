import * as React from 'react';
import { useAuth } from '@lib/auth/authContext';
import * as httpClient from '@lib/httpClient';
import config from '@lib/config';
import { ApiContext } from './ApiContext'; // Import context definition from Step 1

interface IApiContextProviderProps {
   children: React.ReactNode;
}

// Fast Refresh works perfectly because this file now only exports a React Component
export const ApiContextProvider: React.FC<IApiContextProviderProps> = (props) => {
   const getApiUrl = (request: string) => `${config.apiUrl}/${request}`;
   const { getToken } = useAuth();

   const httpGet = async <T,>(url: string): Promise<T> => {
      console.warn('httpGet->', getApiUrl(url));
      return await httpClient.httpGet<T>(getApiUrl(url), getToken)
         .catch((err: httpClient.HttpError) => {
            throw err;
         });
   };

   const httpPatch = async <T,>(url: string, body?: object): Promise<T> => {
      return await httpClient.httpPatch<T>(getApiUrl(url), getToken, body)
         .catch((err: httpClient.HttpError) => {
            throw err;
         });
   };

   const httpPost = async <T,>(url: string, body?: object): Promise<T> => {
      return await httpClient.httpPost<T>(getApiUrl(url), getToken, body)
         .catch((err: httpClient.HttpError) => {
            throw err;
         });
   };

   const httpPut = async <T,>(url: string, body?: object): Promise<T> => {
      return await httpClient.httpPut<T>(getApiUrl(url), getToken, body)
         .catch((err: httpClient.HttpError) => {
            throw err;
         });
   };

   const httpDelete = async <T,>(url: string): Promise<T> => {
      return await httpClient.httpDelete<T>(getApiUrl(url), getToken)
         .catch((err: httpClient.HttpError) => {
            throw err;
         });
   };

   const httpPostFormData = async <T,>(url: string, formData: FormData): Promise<T> => {
      return await httpClient.httpPostFormData<T>(getApiUrl(url), getToken, formData)
         .catch((err: httpClient.HttpError) => {
            throw err;
         });
   };

   return (
      <ApiContext.Provider value={{ httpGet, httpPatch, httpPost, httpPut, httpDelete, httpPostFormData }}>
         {props.children}
      </ApiContext.Provider>
   );
};
