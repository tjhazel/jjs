import useSWR, { mutate } from "swr";
import type { HttpError, TGet, TPost } from "@/lib/httpClient";
import { swrOptions } from "@/lib/swr.functions";
import type { CrossCountry } from "./crossCountry";

export const crossCountryBaseUrl = "api/crosscountry";
export const crossCountryByIdUrl = (id: number) => `${crossCountryBaseUrl}/${id}`;

export function useCrossCountry(httpGet: TGet) {
   const { data, isValidating, error } = useSWR<CrossCountry[], HttpError>(
      crossCountryBaseUrl,
      httpGet,
      { ...swrOptions }
   );

   return {
      data,
      isLoading: !error && !data && isValidating,
      error: error?.message,
   };
}

export function useCrossCountryEntry(httpGet: TGet, id: number | null) {
   const { data, isValidating, error } = useSWR<CrossCountry, HttpError>(
      id ? crossCountryByIdUrl(id) : null,
      httpGet,
      { ...swrOptions }
   );

   return {
      data,
      isLoading: !error && !data && isValidating,
      error: error?.message,
   };
}

export async function saveCrossCountry(httpPost: TPost, model: CrossCountry) {
   const result = await httpPost(crossCountryBaseUrl, model);
   await mutate(crossCountryBaseUrl);
   return result;
}
