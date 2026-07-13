import type { HttpError, TGet, TPost } from "@/lib/httpClient";
import type { ReactionSummary } from "./reaction";
import useSWR from "swr";
import { swrOptions, mutateKeysLike } from "@/lib/swr.functions";
import { mutate } from "swr";
import { basePostUrl, allPostsUrl } from "@api/post/post-fetcher";

const reactionsByPostUrl = (postId: number) => `api/reaction/getbypost/${postId}`;
const toggleReactionUrl = (postId: number) => `api/reaction/toggle/${postId}`;

export function useReactions(httpGet: TGet, postId: number | undefined) {
  const key = postId ? reactionsByPostUrl(postId) : null;
  const { data, isValidating, error } = useSWR<ReactionSummary, HttpError>(
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

export const toggleReaction = async (httpPost: TPost, postId: number, emoji: string) => {
  await httpPost(toggleReactionUrl(postId), { emoji });
  mutateKeysLike(reactionsByPostUrl(postId));
  mutate(basePostUrl);
  mutate(allPostsUrl);
};

const reactionsByCommentUrl = (commentId: number) => `api/reaction/getbycomment/${commentId}`;
const toggleCommentReactionUrl = (commentId: number) => `api/reaction/togglecomment/${commentId}`;

export function useCommentReactions(httpGet: TGet, commentId: number | undefined) {
  const key = commentId ? reactionsByCommentUrl(commentId) : null;
  const { data, isValidating, error } = useSWR<ReactionSummary, HttpError>(
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

export const toggleCommentReaction = async (httpPost: TPost, commentId: number, emoji: string) => {
  await httpPost(toggleCommentReactionUrl(commentId), { emoji });
  mutateKeysLike(reactionsByCommentUrl(commentId));
};
