import useSWR, { SWRResponse, SWRConfiguration } from 'swr'
import { httpGet } from './httpClient';
import { Recipe } from '../Model/Api/RecipeApi';
import { GoogleAuthProvider, useGoogleAuth } from '../Auth/AuthProvider';


const recipeBaseUrl: string = `${process.env.REACT_APP_API_URL}/api/Recipe`;
const recipeGetUrl: string = `${recipeBaseUrl}/get`;


const swrOptions = {
   refreshInterval: 0,
   revalidateOnFocus: false,
   dedupingInterval: 3000     //default 2000
};

export const useRecipeList = () => {

  const { isSignedIn, getToken } = useGoogleAuth();

  const { data, error } = useSWR<Recipe>(
     [recipeGetUrl, isSignedIn ? getToken : undefined ],
     httpGet,
     { ...swrOptions, dedupingInterval: 60000 }
 );

 return {
  data: data,
     isLoading: !error && !data,
     error: error
 };
}
