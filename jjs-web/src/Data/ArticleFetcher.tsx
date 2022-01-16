import useSWR, { SWRResponse, SWRConfiguration } from 'swr'
import { httpGet, httpPost } from './httpClient';
import { PostCategorySummary, Post, Category } from '../Model/Api/ArticleApi';
import { GoogleAuthProvider, useGoogleAuth } from '../Auth/AuthProvider';
const articleBaseUrl: string = `${process.env.REACT_APP_API_URL}/api/Article`;
const articleGetAllUrl: string = `${articleBaseUrl}`;
const articleGetAllSecureUrl: string = `${articleBaseUrl}/GetAllSecure`;

const categoryBaseUrl: string = `${process.env.REACT_APP_API_URL}/api/Category`;


const savePost: string = `${articleBaseUrl}/Save`;


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

export const useSaveArticle = async (post: Post) => {
   const { getToken } = useGoogleAuth();
   const token = await getToken();
   return await httpPost<Post>(savePost, getToken);
}


export const useCategoryList = () => {

   const { data, error } = useSWR<Category[]>(
      [categoryBaseUrl, undefined],
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
