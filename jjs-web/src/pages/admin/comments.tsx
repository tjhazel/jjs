import { Stack, Title, Text, Group } from '@mantine/core';
import { useApiContext } from '@api/ApiContext';
import { useAllComments, hideComment, unhideComment } from '@api/comment/comment-fetcher';
import { blockUser, unblockUser } from '@api/user/user-fetcher';
import { mutateKeysLike } from '@lib/swr.functions';
import type { CommentSummary } from '@api/comment/comment';
import ManageComments from '@components/comment/ManageComments';

export default function ManageCommentsPage() {
  const { httpGet, httpPatch } = useApiContext();
  const { data, isLoading, error } = useAllComments(httpGet, {});

  const handleHide = (c: CommentSummary, screenResult?: string) =>
    hideComment(httpPatch, c.commentId, screenResult);

  const handleUnhide = (c: CommentSummary) =>
    unhideComment(httpPatch, c.commentId);

  const handleBan = async (c: CommentSummary) => {
    await blockUser(httpPatch, c.authorEmail!, `comment on post ${c.postFk}`);
    mutateKeysLike('api/comment/getall');
  };

  const handleUnban = async (c: CommentSummary) => {
    await unblockUser(httpPatch, c.authorEmail!);
    mutateKeysLike('api/comment/getall');
  };

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Stack gap={2}>
          <Title order={1} size="h3" fw={600} lh="sm">Comments</Title>
          <Text size="xs" c="dimmed">Review and moderate all comments. Default sort: most recent first.</Text>
        </Stack>
      </Group>
      <ManageComments
        data={data}
        isLoading={isLoading}
        error={error}
        onHide={handleHide}
        onUnhide={handleUnhide}
        onBan={handleBan}
        onUnban={handleUnban}
      />
    </Stack>
  );
}
