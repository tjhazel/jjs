import type { HttpError, TGet } from "@/lib/httpClient";
import type { Comment } from "./comment";
import useSWR from "swr";
import { swrOptions } from "@/lib/swr.functions";

export const commentsByPostUrl = (postId: number) => `api/comment/getbypost/${postId}`;

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
