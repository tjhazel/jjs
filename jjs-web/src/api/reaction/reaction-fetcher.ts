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
