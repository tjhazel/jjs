import type { HttpError, TGet, TPost } from "@/lib/httpClient";
import type { IngredientLookup, UnitOfMeasureLookup } from "./recipe";
import useSWR, { mutate } from "swr";
import { swrOptions } from "@/lib/swr.functions";

export const ingredientBaseUrl = `api/ingredient`;
export const unitOfMeasureBaseUrl = `api/unitofmeasure`;

export function useIngredients(httpGet: TGet) {
  const { data, isValidating, error } = useSWR<IngredientLookup[], HttpError>(
    ingredientBaseUrl,
    httpGet,
    { ...swrOptions }
  );
  return {
    data: data ?? [],
    isLoading: !error && !data && isValidating,
    error: error?.message,
  };
}

export function useUnitOfMeasures(httpGet: TGet) {
  const { data, isValidating, error } = useSWR<UnitOfMeasureLookup[], HttpError>(
    unitOfMeasureBaseUrl,
    httpGet,
    { ...swrOptions }
  );
  return {
    data: data ?? [],
    isLoading: !error && !data && isValidating,
    error: error?.message,
  };
}

export async function createIngredient(httpPost: TPost, name: string): Promise<number> {
  const id = await httpPost<number>(ingredientBaseUrl, { name });
  await mutate(ingredientBaseUrl);
  return id;
}
