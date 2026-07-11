import type { HttpError, TGet, TPost, TPatch } from "@/lib/httpClient";
import type { CommentSummary, PagedComments, NewCommentRequest } from "./comment";
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

export const hideComment = async (httpPatch: TPatch, commentId: number) => {
   await httpPatch(`api/comment/hidecomment/${commentId}`);
   mutateKeysLike('api/comment/getbypost');
   mutateKeysLike('api/comment/getall');
};

export const unhideComment = async (httpPatch: TPatch, commentId: number) => {
   await httpPatch(`api/comment/unhidecomment/${commentId}`);
   mutateKeysLike('api/comment/getbypost');
   mutateKeysLike('api/comment/getall');
};

export function useAllComments(httpGet: TGet, params?: { email?: string; postId?: number }) {
   const qs = new URLSearchParams();
   if (params?.email) qs.set('email', params.email);
   if (params?.postId != null) qs.set('postId', String(params.postId));
   const key = `api/comment/getall?${qs.toString()}`;
   const { data, isValidating, error } = useSWR<CommentSummary[], HttpError>(key, httpGet, { ...swrOptions });
   return {
      data,
      isLoading: !error && !data && isValidating,
      error: error?.message,
   };
}
