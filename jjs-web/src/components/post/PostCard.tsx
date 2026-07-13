import { Group, Text, Tooltip } from '@mantine/core';
import ImageCard from '@components/ui/ImageCard';
import { ALLOWED_EMOJIS, parseReactionCounts } from '@api/reaction/reaction';
import type { PostDetail } from '@api/post/post';

interface PostCardProps {
  post: PostDetail;
}

export default function PostCard({ post }: PostCardProps) {
  const counts = parseReactionCounts(post.reactionCounts);
  const reactionEmojis = ALLOWED_EMOJIS.filter(e => (counts[e] ?? 0) > 0);

  const reactionBar = reactionEmojis.length > 0 ? (
    <Group gap={6}>
      {reactionEmojis.map(emoji => (
        <Tooltip
          key={emoji}
          label={`${counts[emoji]} reaction${counts[emoji] !== 1 ? 's' : ''}`}
          withArrow
        >
          <Group gap={2} style={{ cursor: 'default' }}>
            <Text size="sm">{emoji}</Text>
            <Text size="xs" c="dimmed" fw={500}>{counts[emoji]}</Text>
          </Group>
        </Tooltip>
      ))}
    </Group>
  ) : undefined;

  return (
    <ImageCard
      title={post.title}
      previewText={post.previewText}
      previewLines={3}
      timestamp={post.createdDate ? new Date(post.createdDate) : undefined}
      imageUrl={post.imageUrl}
      link={`/post/${post.postId}`}
      footerText="Read more →"
      footerSlot={reactionBar}
    />
  );
}
