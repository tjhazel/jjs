import type { HttpError, TGet, TPost } from "@/lib/httpClient";
import type { PostDetail } from "./post";
import useSWR, { mutate } from "swr";
import { swrOptions } from "@/lib/swr.functions";


export const postBaseUrl = `api/post`;
//export const getPostUrl = (id: number) => `${postBaseUrl}/${id}`;
export const postSaveUrl = `${postBaseUrl}`;

export function usePosts(httpGet: TGet) {
   const { data, isValidating, error } = useSWR<PostDetail[], HttpError>(
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

export function useGetPost(httpGet: TGet, id?: number) {

   const shouldFetch = id !== undefined && id !== null && !isNaN(id) && id > 0;

   const { data, isLoading, error} = usePosts(httpGet);

   if (!shouldFetch) {
      return {
         post: {} as PostDetail
      }
   }

   return {
      post: data?.find((p) => p.postId === id),
      isLoading: !error && !data && isLoading,
      error: error
   };
}

export const savePost = async (httpPost: TPost, post: PostDetail) => {
   const result = await httpPost(postSaveUrl, post)
      .then(() => mutate(postSaveUrl));
   return result;
}

