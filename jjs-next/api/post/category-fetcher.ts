"use client" 

import { HttpError, TGet } from "@/lib/httpClient";
import { Category } from "./category";
import useSWR from "swr";
import { swrOptions } from "@/lib/swr.functions";

export const categoryBaseUrl = `api/post`;
export const getCategoryUrl = (id: number) => `${categoryBaseUrl}/${id}`;

export function useCategories(httpGet: TGet) {
   const { data, isValidating, error } = useSWR<Category[], HttpError>(
      getCategoryUrl,
      httpGet,
      { ...swrOptions }
   );

   return {
      data: data,
      isLoading: !error && !data && isValidating,
      error: error?.message
   };
}