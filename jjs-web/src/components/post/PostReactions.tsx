import { Group, ActionIcon, Text, Tooltip, Stack, Divider } from '@mantine/core';
import { useApiContext } from '@api/ApiContext';
import { useAuth } from '@/lib/auth/authContext';
import { useReactions, toggleReaction } from '@api/reaction/reaction-fetcher';
import { ALLOWED_EMOJIS } from '@api/reaction/reaction';
import { useState } from 'react';

interface PostReactionsProps {
  postId: number;
}

export default function PostReactions({ postId }: PostReactionsProps) {
  const { httpGet, httpPost } = useApiContext();
  const { isAuthenticated } = useAuth();
  const { data } = useReactions(httpGet, postId);
  const [pending, setPending] = useState<string | null>(null);

  const counts = data?.counts ?? {};
  const userReactions = data?.userReactions ?? [];

  const handleToggle = async (emoji: string) => {
    if (!isAuthenticated || pending) return;
    setPending(emoji);
    try {
      await toggleReaction(httpPost, postId, emoji);
    } finally {
      setPending(null);
    }
  };

  return (
    <Stack gap="xs">
      <Divider />
      <Group gap="xs" wrap="nowrap">
        {ALLOWED_EMOJIS.map((emoji) => {
          const count = counts[emoji] ?? 0;
          const isActive = userReactions.includes(emoji);
          const isPending = pending === emoji;

          const button = (
            <ActionIcon
              key={emoji}
              variant={isActive ? 'filled' : 'light'}
              color={isActive ? 'dark' : 'gray'}
              size="lg"
              radius="xl"
              onClick={() => handleToggle(emoji)}
              disabled={isPending}
              loading={isPending}
              style={{
                cursor: isAuthenticated ? 'pointer' : 'default',
                minWidth: count > 0 ? 56 : 40,
              }}
            >
              <Text size="md" style={{ lineHeight: 1 }}>{emoji}</Text>
              {count > 0 && (
                <Text size="xs" fw={600} ml={4}>{count}</Text>
              )}
            </ActionIcon>
          );

          if (!isAuthenticated) {
            return (
              <Tooltip key={emoji} label={count > 0 ? `${count} reaction${count !== 1 ? 's' : ''}` : 'Sign in to react'} withArrow>
                <span>{button}</span>
              </Tooltip>
            );
          }

          return (
            <Tooltip
              key={emoji}
              label={
                count > 0
                  ? `${count} reaction${count !== 1 ? 's' : ''}${isActive ? ' · click to remove' : ''}`
                  : 'Be the first to react'
              }
              withArrow
            >
              {button}
            </Tooltip>
          );
        })}
      </Group>
    </Stack>
  );
}
