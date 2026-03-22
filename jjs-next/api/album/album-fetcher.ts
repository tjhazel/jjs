"use client" 

import { HttpError, TGet } from "@/lib/httpClient";
import { Folder } from "./album-models";
import useSWR from "swr";
import { swrOptions } from "@/lib/swr.functions";
import { useMemo } from "react";


export const albumBaseUrl = `api/album`;

export function useAlbum(httpGet: TGet) {

    const { data, isValidating, error } = useSWR<Folder, HttpError>(
      albumBaseUrl,
      httpGet,
      { ...swrOptions }
   );

   return {
      data: data,
      isLoading: !error && !data && isValidating,
      error: error?.message
   };
}
