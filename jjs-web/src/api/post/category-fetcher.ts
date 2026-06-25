import type { HttpError, TGet } from "@lib/httpClient";
import type { Category } from "./category";
import useSWR from "swr";
import { swrOptions } from "@lib/swr.functions";

export const categoryBaseUrl = `api/category?categoryTypeId=1`;

export function useCategories(httpGet: TGet) {
   const { data, isValidating, error } = useSWR<Category[], HttpError>(
      categoryBaseUrl,
      httpGet,
      { ...swrOptions }
   );

   return {
      data: data,
      isLoading: !error && !data && isValidating,
      error: error?.message
   };
}