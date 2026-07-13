import { useState } from 'react';
import { Group, ActionIcon, Text, Tooltip } from '@mantine/core';
import { useApiContext } from '@api/ApiContext';
import { useAuth } from '@/lib/auth/authContext';
import { useCommentReactions, toggleCommentReaction } from '@api/reaction/reaction-fetcher';
import { ALLOWED_EMOJIS } from '@api/reaction/reaction';

interface CommentReactionsProps {
  commentId: number;
}

export default function CommentReactions({ commentId }: CommentReactionsProps) {
  const { httpGet, httpPost } = useApiContext();
  const { isAuthenticated } = useAuth();
  const { data } = useCommentReactions(httpGet, commentId);
  const [pending, setPending] = useState<string | null>(null);

  const counts = data?.counts ?? {};
  const userReactions = data?.userReactions ?? [];

  const visibleEmojis = isAuthenticated
    ? ALLOWED_EMOJIS
    : ALLOWED_EMOJIS.filter(e => (counts[e] ?? 0) > 0);

  if (visibleEmojis.length === 0) return null;

  const handleToggle = async (emoji: string) => {
    if (!isAuthenticated || pending) return;
    setPending(emoji);
    try {
      await toggleCommentReaction(httpPost, commentId, emoji);
    } finally {
      setPending(null);
    }
  };

  return (
    <Group gap={4} mt={6}>
      {visibleEmojis.map((emoji) => {
        const count = counts[emoji] ?? 0;
        const isActive = userReactions.includes(emoji);
        const isPending = pending === emoji;

        const label = count > 0
          ? `${count} reaction${count !== 1 ? 's' : ''}${isAuthenticated ? (isActive ? ' · click to remove' : '') : ''}`
          : 'Be the first to react';

        return (
          <Tooltip key={emoji} label={label} withArrow>
            <ActionIcon
              variant={isActive ? 'filled' : 'subtle'}
              color={isActive ? 'dark' : 'gray'}
              size="xs"
              radius="xl"
              onClick={() => handleToggle(emoji)}
              disabled={isPending || !isAuthenticated}
              loading={isPending}
              style={{ cursor: isAuthenticated ? 'pointer' : 'default', minWidth: count > 0 ? 36 : 24 }}
            >
              <Text size="xs" style={{ lineHeight: 1 }}>{emoji}</Text>
              {count > 0 && (
                <Text size="xs" fw={600} ml={2}>{count}</Text>
              )}
            </ActionIcon>
          </Tooltip>
        );
      })}
    </Group>
  );
}
