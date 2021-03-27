import useSWR, { SWRResponse, SWRConfiguration } from 'swr'
import { httpGet } from '../Data/httpClient';

import { PostCategorySummary } from '../Model/Api/ArticleApi';

const articleBaseUrl: string = `${process.env.REACT_APP_API_URL}/api/Article`;
const articleGetAllUrl: string = `${articleBaseUrl}/GetAll`;

const swrOptions = {
   refreshInterval: 0,
   revalidateOnFocus: false,
   dedupingInterval: 3000     //default 2000
};

export const useArticleList = () => {

   const { data, error } = useSWR<PostCategorySummary[]>(
      [articleGetAllUrl, false],
      httpGet,
      { ...swrOptions, dedupingInterval: 60000 }
  );

  return {
   data: data,
      isLoading: !error && !data,
      error: error
  };
}
