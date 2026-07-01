import type { HttpError, TGet, TPatch, TPost } from "@/lib/httpClient";
import type { PostDetail } from "./post";
import useSWR, { mutate } from "swr";
import { swrOptions } from "@/lib/swr.functions";


export const basePostUrl = `api/post`;
export const viewPostUrl = (id: number) => `${basePostUrl}/view/${id}`;
export const allPostsUrl = `${basePostUrl}/getall`;
export const postSaveUrl = `${basePostUrl}`;

export function usePosts(httpGet: TGet) {
   const { data, isValidating, error } = useSWR<PostDetail[], HttpError>(
      basePostUrl,
      httpGet,
      { ...swrOptions }
   );

   return {
      data: data,
      isLoading: !error && !data && isValidating,
      error: error?.message
   };
}

export function useAllPosts(httpGet: TGet) {
   const { data, isValidating, error } = useSWR<PostDetail[], HttpError>(
      allPostsUrl,
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

export const viewPost = async (httpPatch: TPatch, postId: number) => {
   const url = viewPostUrl(postId);
   const result = await httpPatch(url)
      .then(() => {
         mutate(basePostUrl);
         mutate(allPostsUrl)
      });
   return result;
}

export const savePost = async (httpPost: TPost, post: PostDetail) => {
   const result = await httpPost(postSaveUrl, post)
      .then(() => {
         mutate(basePostUrl);
         mutate(allPostsUrl)
      });
   return result;
}

