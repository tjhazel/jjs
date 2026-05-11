"use client" 

import { HttpError, TGet, TPost } from "@/lib/httpClient";
import { Post } from "./post";
import useSWR, { mutate } from "swr";
import { swrOptions } from "@/lib/swr.functions";


export const postBaseUrl = `api/post`;
export const getPostUrl = (id: number) => `${postBaseUrl}/${id}`;
export const postSaveUrl = `${getPostUrl}/Save`;

export function usePosts(httpGet: TGet) {
   const { data, isValidating, error } = useSWR<Post[], HttpError>(
      postBaseUrl,
      httpGet,
      { ...swrOptions }
   );

   return {
      data: data,
      isLoading: !error && !data && isValidating,
      error: error?.message
   };
}

export const savePost = async (httpPost: TPost, post: Post) => {
   const result = await httpPost(postSaveUrl, post)
      .then(() => mutate(postSaveUrl));
   return result;
}

