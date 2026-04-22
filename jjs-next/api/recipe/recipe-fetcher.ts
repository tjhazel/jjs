"use client" 

import { HttpError, TGet } from "@/lib/httpClient";
import { Recipe, RecipeDetail } from "./recipe";
import useSWR from "swr";
import { swrOptions } from "@/lib/swr.functions";

export const recipeBaseUrl = `api/Recipe`;
export const getRecipeUrl = (id: number) => `${recipeBaseUrl}/${id}`;

export function useRecipe(httpGet: TGet) {
  console.log('posting to this', recipeBaseUrl, httpGet)
   const { data, isValidating, error } = useSWR<Recipe[], HttpError>(
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

export function useSingleRecipe(httpGet: TGet, id: number) {
  const { data, isValidating, error } = useSWR<RecipeDetail, HttpError>(
    getRecipeUrl(id),
    httpGet,
    { ...swrOptions }
  );
   console.log('result', data, error, isValidating)

  return {
    data: data,
    isLoading: !error && !data && isValidating,
    error: error?.message
  };
}