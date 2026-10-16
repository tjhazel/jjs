import { useState } from 'react';
import { Alert, Button, Code, Group, Modal, Stack, Text, Textarea, Title } from '@mantine/core';
import { useApiContext } from '@api/ApiContext';
import { useAllComments, hideComment, unhideComment, testCommentModeration } from '@api/comment/comment-fetcher';
import { blockUser, unblockUser } from '@api/user/user-fetcher';
import { mutateKeysLike } from '@lib/swr.functions';
import type { CommentModerationResult, CommentSummary } from '@api/comment/comment';
import ManageComments from '@components/comment/ManageComments';

export default function ManageCommentsPage() {
  const { httpGet, httpPatch, httpPost } = useApiContext();
  const { data, isLoading, error } = useAllComments(httpGet, {});
  const [moderationDialogOpened, setModerationDialogOpened] = useState(false);
  const [moderationText, setModerationText] = useState('');
  const [moderationResult, setModerationResult] = useState<CommentModerationResult | null>(null);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [isTestingModeration, setIsTestingModeration] = useState(false);

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

  const handleTestModeration = async () => {
    setModerationResult(null);
    setModerationError(null);
    setIsTestingModeration(true);
    try {
      const result = await testCommentModeration(httpPost, moderationText);
      setModerationResult(result);
    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message
        : error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
          ? error.message
          : 'An unexpected error occurred while testing comment moderation.';
      setModerationError(message);
    } finally {
      setIsTestingModeration(false);
    }
  };

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Group justify="space-between" align="center" w="100%">
          <Stack gap={2}>
            <Title order={1} size="h3" fw={600} lh="sm">Comments</Title>
            <Text size="xs" c="dimmed">Review and moderate all comments. Default sort: most recent first.</Text>
          </Stack>
          <Button
            onClick={() => {
              setModerationResult(null);
              setModerationError(null);
              setModerationDialogOpened(true);
            }}
          >
            Test Moderation
          </Button>
        </Group>
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
      <Modal
        opened={moderationDialogOpened}
        onClose={() => setModerationDialogOpened(false)}
        title="Test Comment Moderation"
        centered
        size="lg"
      >
        <Stack>
          <Textarea
            label="Comment text"
            placeholder="Enter text to send to Gemini for moderation"
            value={moderationText}
            onChange={(event) => setModerationText(event.currentTarget.value)}
            minRows={4}
            autosize
          />
          <Group justify="flex-end">
            <Button
              onClick={handleTestModeration}
              loading={isTestingModeration}
              disabled={!moderationText.trim() || isTestingModeration}
            >
              Test Moderation
            </Button>
          </Group>
          {moderationError && (
            <Alert color="red" title="Moderation request failed">
              <Code block>{moderationError}</Code>
            </Alert>
          )}
          {moderationResult && (
            <Alert
              color={!moderationResult.wasProcessed ? 'red' : moderationResult.isFlagged ? 'orange' : 'green'}
              title={!moderationResult.wasProcessed ? 'Moderation service did not process the request' : 'Moderation result'}
            >
              <Stack gap="xs">
                <Text size="sm">Processed: {moderationResult.wasProcessed ? 'Yes' : 'No'}</Text>
                <Text size="sm">Spam: {moderationResult.isSpam ? 'Yes' : 'No'}</Text>
                <Text size="sm">Toxic: {moderationResult.isToxic ? 'Yes' : 'No'}</Text>
                <Text size="sm">Flagged: {moderationResult.isFlagged ? 'Yes' : 'No'}</Text>
                <Text size="sm" fw={600}>Reason</Text>
                <Code block>{moderationResult.reason || 'No reason was returned.'}</Code>
              </Stack>
            </Alert>
          )}
        </Stack>
      </Modal>
    </Stack>
  );
}
