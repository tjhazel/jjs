import useSWR, { SWRResponse, SWRConfiguration } from 'swr'
import { httpGet } from './httpClient';
import { PostCategorySummary } from '../Model/Api/ArticleApi';
import { GoogleAuthProvider, useGoogleAuth } from '../Auth/AuthProvider';


const articleBaseUrl: string = `${process.env.REACT_APP_API_URL}/api/Article`;
const articleGetAllUrl: string = `${articleBaseUrl}/GetAll`;
const articleGetAllSecureUrl: string = `${articleBaseUrl}/GetAllSecure`;


const swrOptions = {
   refreshInterval: 0,
   revalidateOnFocus: false,
   dedupingInterval: 3000     //default 2000
};

export const useArticleList = () => {

   const { isSignedIn, getToken } = useGoogleAuth();

   const { data, error } = useSWR<PostCategorySummary[]>(
      [articleGetAllUrl, isSignedIn ? getToken : undefined ],
      httpGet,
      { ...swrOptions, dedupingInterval: 60000 }
  );

  return {
   data: data,
      isLoading: !error && !data,
      error: error
  };
}


//export const useArticleListSecure = () => {

//   const { isSignedIn, getToken } = useGoogleAuth();

//   const { data, error } = useSWR<PostCategorySummary[]>(
//      [articleGetAllSecureUrl, isSignedIn ? getToken : undefined],
//      httpGet,
//      { ...swrOptions, dedupingInterval: 60000 }
//   );

//   return {
//      data: data,
//      isLoading: !error && !data,
//      error: error
//   };
//}
