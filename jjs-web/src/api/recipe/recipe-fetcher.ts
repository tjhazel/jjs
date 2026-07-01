import type { HttpError, TGet, TPost } from "@/lib/httpClient";
import type { RecipeDetail } from "./recipe";
import useSWR, { mutate } from "swr";
import { swrOptions } from "@/lib/swr.functions";

export const recipeBaseUrl = `api/recipe`;
export const getRecipeUrl = (id: number) => `${recipeBaseUrl}/${id}`;
export const recipeSaveUrl = `${recipeBaseUrl}`;

export function useRecipe(httpGet: TGet) {
  console.log('posting to this', recipeBaseUrl, httpGet)
   const { data, isValidating, error } = useSWR<RecipeDetail[], HttpError>(
      recipeBaseUrl,
      httpGet,
      { ...swrOptions }
   );
 
   //console.log('result', data, error, isValidating)
   return {
      data: data,
      isLoading: !error && !data && isValidating,
      error: error?.message
   };
}

export function useSingleRecipe(httpGet: TGet, id: number | null) {
  const { data, isValidating, error } = useSWR<RecipeDetail, HttpError>(
    id ? getRecipeUrl(id) : null,
    httpGet,
    { ...swrOptions }
  );
   //console.log('result', data, error, isValidating)

  return {
    data: data,
    isLoading: !error && !data && isValidating,
    error: error?.message
  };
}

export const saveRecipe = async (httpPost: TPost, model: RecipeDetail) => {
   const result = await httpPost(recipeSaveUrl, model)
      .then(() => mutate(recipeBaseUrl));
   return result;
}