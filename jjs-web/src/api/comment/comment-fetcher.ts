import type { HttpError, TGet, TPost } from "@/lib/httpClient";
import type { PagedComments, NewCommentRequest } from "./comment";
import useSWR from "swr";
import { swrOptions, mutateKeysLike } from "@/lib/swr.functions";

const commentsByPostBaseUrl = (postId: number) => `api/comment/getbypost/${postId}`;
export const commentsByPostUrl = (postId: number, page: number) => `${commentsByPostBaseUrl(postId)}?page=${page}`;
export const addCommentUrl = (postId: number) => `api/comment/addforpost/${postId}`;

export function useComments(httpGet: TGet, postId: number | undefined, page: number) {
   const key = postId ? commentsByPostUrl(postId, page) : null;
   const { data, isValidating, error } = useSWR<PagedComments, HttpError>(
      key,
      httpGet,
      { ...swrOptions }
   );

   return {
      data,
      isLoading: !error && !data && isValidating,
      error: error?.message
   };
}

export const addComment = async (httpPost: TPost, postId: number, request: NewCommentRequest) => {
   await httpPost(addCommentUrl(postId), request);
   mutateKeysLike(commentsByPostBaseUrl(postId));
};
