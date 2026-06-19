import * as React from 'react';
import * as httpClient from '@lib/httpClient';

export interface IApiContextProps {
   httpGet: httpClient.TGet;
   httpPatch: httpClient.TPatch;
   httpPost: httpClient.TPost;
   httpPut: httpClient.TPut;
   httpDelete: httpClient.TDelete;
}

// Exporting data tokens and hooks here allows Vite to optimize changes cleanly
export const ApiContext = React.createContext<IApiContextProps>({} as IApiContextProps);

export const useApiContext = () => React.useContext(ApiContext);
