import type { HttpError, TGet, TPost, TPatch } from "@/lib/httpClient";
import type { Comment, CommentSummary, PagedComments, NewCommentRequest } from "./comment";
import useSWR from "swr";
import { swrOptions, mutateKeysLike } from "@/lib/swr.functions";

const commentsByPostBaseUrl = (postId: number) => `api/comment/getbypost/${postId}`;
export const commentsByPostUrl = (postId: number, page: number) => `${commentsByPostBaseUrl(postId)}?page=${page}`;
export const addCommentUrl = (postId: number) => `api/comment/addforpost/${postId}`;

const repliesByCommentUrl = (commentId: number) => `api/comment/getreplies/${commentId}`;

export function useReplies(httpGet: TGet, commentId: number | undefined, enabled: boolean) {
   const key = (enabled && commentId) ? repliesByCommentUrl(commentId) : null;
   const { data, isValidating, error } = useSWR<Comment[], HttpError>(
      key,
      httpGet,
      { ...swrOptions }
   );
   return {
      data,
      isLoading: !error && !data && isValidating,
      error: error?.message,
   };
}

export const addReply = async (httpPost: TPost, postId: number, parentCommentId: number, request: Omit<NewCommentRequest, 'parentCommentFk'>) => {
   await httpPost(addCommentUrl(postId), { ...request, parentCommentFk: parentCommentId });
   mutateKeysLike(repliesByCommentUrl(parentCommentId));
};

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

export const hideComment = async (httpPatch: TPatch, commentId: number, screenResult?: string) => {
   await httpPatch(`api/comment/hidecomment/${commentId}`, { screenResult: screenResult ?? null });
   mutateKeysLike('api/comment/getbypost');
   mutateKeysLike('api/comment/getreplies');
   mutateKeysLike('api/comment/getall');
};

export const unhideComment = async (httpPatch: TPatch, commentId: number) => {
   await httpPatch(`api/comment/unhidecomment/${commentId}`);
   mutateKeysLike('api/comment/getbypost');
   mutateKeysLike('api/comment/getreplies');
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
