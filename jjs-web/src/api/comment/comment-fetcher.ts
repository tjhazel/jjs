import type { HttpError, TGet, TPost } from "@/lib/httpClient";
import type { Comment, NewCommentRequest } from "./comment";
import useSWR, { mutate } from "swr";
import { swrOptions } from "@/lib/swr.functions";

export const commentsByPostUrl = (postId: number) => `api/comment/getbypost/${postId}`;
export const addCommentUrl = (postId: number) => `api/comment/addforpost/${postId}`;

export function useComments(httpGet: TGet, postId: number | undefined) {
   const key = postId ? commentsByPostUrl(postId) : null;
   const { data, isValidating, error } = useSWR<Comment[], HttpError>(
      key,
      httpGet,
      { ...swrOptions }
   );

   return {
      data: data,
      isLoading: !error && !data && isValidating,
      error: error?.message
   };
}

export const addComment = async (httpPost: TPost, postId: number, request: NewCommentRequest) => {
   await httpPost(addCommentUrl(postId), request);
   await mutate(commentsByPostUrl(postId));
};
