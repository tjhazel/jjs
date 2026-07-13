export const ALLOWED_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🎉"] as const;
export type AllowedEmoji = typeof ALLOWED_EMOJIS[number];

export interface ReactionSummary {
  counts: Record<string, number>;
  userReactions: string[];
}

export interface PostReactionInput {
  emoji: string;
}

export function parseReactionCounts(raw?: string): Record<string, number> {
  if (!raw) return {};
  return Object.fromEntries(
    raw.split(',')
      .map(pair => pair.split(':'))
      .filter(parts => parts.length === 2)
      .map(([emoji, count]) => [emoji, parseInt(count, 10)])
  );
}
