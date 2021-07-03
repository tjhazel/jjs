import React, { useState, createContext, createRef, useContext, useEffect } from 'react'
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { HttpError } from '../Model/Http';
import { useGoogleAuth } from '../Auth/AuthProvider';


type IHttpClient = {
   getThenResolver?: (url: string) => Promise<any> | undefined;
   postThenResolver: (url: string, params: any) => Promise<any>;
};

export function WithHttpClient<P extends IHttpClient>(WrappedComponent: React.ComponentType<P>):
   React.ComponentType<Omit<P, 'getThenResolver'>> {

   const getThenResolver = async (url: string) => {
      const options: AxiosRequestConfig = await getConfig();
      return axios
         .get(url, options)
         .then(res => res.data)
         .catch(err => handleError(err));
   }

   const handleError = (err: AxiosError): HttpError => {
      const error: HttpError = {
         httpErrorCode: err.code,
         message: err.message
      };

      if (err.response) {
         // client received an error response (5xx, 4xx)
         error.httpErrorCode = err.code;
         error.responseStatus = err.response.status;
         error.responseData = err.response.data;
         error.message = `[${err.response.status}]: ${JSON.stringify(err.response.data)}`;
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

   const getConfig = async (): Promise<AxiosRequestConfig> => {

      // axios request options like headers etc
      const options: AxiosRequestConfig = {
         headers: {
            'Content-Type': 'application/json'
         }
      }

      const { isSignedIn, getToken } = useGoogleAuth();

      // if API endpoint requires a token, we'll need to add a way to add this.
      if (isSignedIn) {
         const token = await getToken();
         options.headers['Authorization'] = `Bearer ${token}`;
      }
      return options;
   }

    return props => (
      <WrappedComponent
          children={getThenResolver}
         {...props as any}
      />
   );
}

////export const WithDataFetcher = (Component) => (props) => {
//export const WithHttpClient = (
//   Component: React.ComponentType<P>
//      ): React.ComponentType<P> => {
//   const { googleUser, getToken } = useGoogleAuth();

//   const getThenResolver = async (url: string) => {
//      const token = await getToken();
//      return axios
//         .get(url, {
//            headers: {
//               'Authorization': 'Bearer ' + token
//            }
//         })
//         .then(res => res.data)
//         .catch(err => handleError(err));
//   }

//   const handleError = (err: AxiosError): HttpError => {
//      const error: HttpError = {
//         httpErrorCode: err.code,
//         message: err.message
//      };

//      if (err.response) {
//         // client received an error response (5xx, 4xx)
//         error.httpErrorCode = err.code;
//         error.responseStatus = err.response.status;
//         error.responseData = err.response.data;
//         error.message = `[${err.response.status}]: ${JSON.stringify(err.response.data)}`;
//         //throw new Error(`[${err.response.status}]: ${err.response.data}`);
//      } else if (err.request) {
//         // client never received a response, or request never left
//         error.message += ` Client never received a response, or request never left.`;
//         //throw new Error("Client never received a response, or request never left");
//      } else {
//         // anything else
//         error.message += ` Unable to process request.`;
//         //throw new Error("Unable to process request");
//      }
//      return error;
//   }

//   const getConfig = async (requiresToken: boolean = false): Promise<AxiosRequestConfig> => {

//      // axios request options like headers etc
//      const options: AxiosRequestConfig = {
//         headers: {
//            'Content-Type': 'application/json'
//         }
//      }

//      // if API endpoint requires a token, we'll need to add a way to add this.
//      if (requiresToken) {
//         const token = 'FAKE_TOKEN';
//         options.headers['Authorization'] = `Bearer ${token}`;
//      }
//      return options;
//   };

//      return <Component { ...props }
//      getThenResolver = { getThenResolver }
//      //postThenResolver = { postThenResolver }
//      //postFormDataThenResolver = { postFormDataThenResolver }
//      //putThenResolver = { putThenResolver }
//      //putFormDataThenResolver = { putFormDataThenResolver }
//      //deleteThenResolver={deleteThenResolver}
//   />;
//}

////export const WithDataFetcher = ({ children }: DataFetcherProps) => (props: any) => {

//   //const httpGet = async<T>(url: string, requiresToken: boolean = true) => {
//   //   return new Promise<T>(async (resolve, reject) => {
//   //      const options: AxiosRequestConfig = await getConfig(requiresToken);
//   //      axios
//   //         .get(url, options)
//   //         .then((response: any) => {
//   //            resolve(response.data as T)
//   //         })
//   //         .catch((response: AxiosError) => {
//   //            reject(handleError(response));
//   //            //reject(response)
//   //         });
//   //   })
//   //};

//   //const httpPost = async<T>(url: string, body?: object) => {
//   //   return new Promise<T>(async (resolve, reject) => {
//   //      const options: AxiosRequestConfig = await getConfig(true);
//   //      axios
//   //         .post(url, JSON.stringify(body), options)
//   //         .then((response: any) => {
//   //            resolve(response.data as T)
//   //         })
//   //         .catch((response: any) => {
//   //            reject(response)
//   //         });
//   //   })
//   //};


//   //const handleError = (err: AxiosError): HttpError => {
//   //   const error: HttpError = {
//   //      httpErrorCode: err.code,
//   //      message: err.message
//   //   };

//   //   if (err.response) {
//   //      // client received an error response (5xx, 4xx)
//   //      error.httpErrorCode = err.code;
//   //      error.responseStatus = err.response.status;
//   //      error.responseData = err.response.data;
//   //      error.message = `[${err.response.status}]: ${JSON.stringify(err.response.data)}`;
//   //      //throw new Error(`[${err.response.status}]: ${err.response.data}`);
//   //   } else if (err.request) {
//   //      // client never received a response, or request never left
//   //      error.message += ` Client never received a response, or request never left.`;
//   //      //throw new Error("Client never received a response, or request never left");
//   //   } else {
//   //      // anything else
//   //      error.message += ` Unable to process request.`;
//   //      //throw new Error("Unable to process request");
//   //   }
//   //   return error;
//   //}

//   //const getConfig = async (requiresToken: boolean = false): Promise<AxiosRequestConfig> => {

//   //   // axios request options like headers etc
//   //   const options: AxiosRequestConfig = {
//   //      headers: {
//   //         'Content-Type': 'application/json'
//   //      }
//   //   }

//   //   // if API endpoint requires a token, we'll need to add a way to add this.
//   //   if (requiresToken) {
//   //      const token = 'FAKE_TOKEN';
//   //      options.headers['Authorization'] = `Bearer ${token}`;
//   //   }
//   //   return options;
//   //};


//  // return <Component { ...props }
//      //getThenResolver = { getThenResolver }
//      //postThenResolver = { postThenResolver }
//      //postFormDataThenResolver = { postFormDataThenResolver }
//      //putThenResolver = { putThenResolver }
//      //putFormDataThenResolver = { putFormDataThenResolver }
//      //deleteThenResolver={deleteThenResolver}
////   />;
////}
