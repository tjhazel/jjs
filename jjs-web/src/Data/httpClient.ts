import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { HttpError } from '../Model/Http';

export const httpGet = async<T>(url: string, getToken: () => string) => {
   return new Promise<T>(async(resolve, reject) => {
      const options: AxiosRequestConfig = await getConfig(getToken);
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

export const httpPost = async<T>(url: string, getToken: () => string, body?: object) => {
   return new Promise<T>(async(resolve, reject) => {
      const options: AxiosRequestConfig = await getConfig(getToken);
      axios
         .post(url, JSON.stringify(body), options)
         .then((response: any) => {
            resolve(response.data as T)
         })
         .catch((response: any) => {
            reject(response)
         });
   })
};


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

const getConfig = async (getToken: () => string) : Promise<AxiosRequestConfig> => {

    // axios request options like headers etc
    const options: AxiosRequestConfig = {
      headers: {
         'Content-Type': 'application/json'
      }
   }

   // if API endpoint requires a token, we'll need to add a way to add this.
   if (getToken) {
      const token = await getToken();
      options.headers['Authorization'] = `Bearer ${token}`;
   }
   return options;
};

