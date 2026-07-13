import { useState } from 'react';
import { Stack, Title, Text, Box, Group, ActionIcon, Tooltip, Button, Divider, Loader, Center } from '@mantine/core';
import { IconEye, IconEyeOff, IconUserX, IconBan, IconMessageCircle } from '@tabler/icons-react';
import type { Comment } from '@api/comment/comment';
import { useReplies } from '@api/comment/comment-fetcher';
import { useApiContext } from '@api/ApiContext';
import { useAuth } from '@lib/auth/authContext';
import HiddenOverlay from '@components/ui/HiddenOverlay';
import InlineAlert from '@components/ui/InlineAlert';
import AddCommentForm from './AddCommentForm';
import CommentReactions from './CommentReactions';

interface CommentItemProps {
   comment: Comment;
   isAdmin: boolean;
   isHighlighted?: boolean;
   isReply?: boolean;
   onHide: (commentId: number) => void;
   onUnhide: (commentId: number) => void;
   onBanUser: (comment: Comment) => Promise<void>;
}

export default function CommentItem({ comment, isAdmin, isHighlighted, isReply = false, onHide, onUnhide, onBanUser }: CommentItemProps) {
   const { httpGet } = useApiContext();
   const { isAuthenticated } = useAuth();
   const [banError, setBanError] = useState<string | null>(null);
   const [showReplyArea, setShowReplyArea] = useState(false);

   const { data: replies, isLoading: repliesLoading } = useReplies(httpGet, comment.commentId, showReplyArea);

   const handleBanClick = async () => {
      setBanError(null);
      try {
         await onBanUser(comment);
      } catch (e) {
         setBanError((e as Error).message);
      }
   };

   const handleReplyAdded = () => {
      // keep area open so user can see their reply appear
   };

   return (
      <Box
         id={`comment-${comment.commentId}`}
         pos="relative"
         style={isHighlighted ? {
            backgroundColor: 'var(--mantine-color-yellow-0)',
            borderLeft: '3px solid var(--mantine-color-yellow-5)',
            paddingLeft: '12px',
            marginLeft: '-15px',
            transition: 'background-color 0.3s ease',
         } : undefined}
      >
         <Stack gap={4} pr={isAdmin ? 56 : 0}>
            <Title order={5} fw={600}>{comment.title}</Title>
            <Group gap="xs" c="gray.6">
               <Text size="sm">{comment.authorName}</Text>
               <Text size="sm">·</Text>
               <Text size="sm">{new Date(comment.createdDate).toLocaleDateString()}</Text>
            </Group>
            <Text size="sm" mt={4}>{comment.entryText}</Text>
            <CommentReactions commentId={comment.commentId} />
            {banError && <InlineAlert message={banError} onClose={() => setBanError(null)} />}

            {!isReply && (
               <Group gap="xs" mt={6}>
                  {(isAuthenticated || comment.replyCount > 0) && (
                     <Button
                        variant="subtle"
                        color="gray"
                        size="compact-xs"
                        radius="xl"
                        leftSection={<IconMessageCircle size={13} />}
                        onClick={() => setShowReplyArea(v => !v)}
                     >
                        {comment.replyCount > 0
                           ? `${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`
                           : 'Reply'}
                     </Button>
                  )}
               </Group>
            )}
         </Stack>

         {isAdmin && comment.adminHidden && <HiddenOverlay />}

         {isAdmin && (
            <Box style={{ position: 'absolute', top: 0, right: 0, zIndex: 2 }}>
               <Group gap={4} wrap="nowrap">
                  <Tooltip label={comment.adminHidden ? 'Unhide comment' : 'Hide comment'} withArrow>
                     <ActionIcon
                        variant="subtle"
                        color={comment.adminHidden ? 'blue' : 'orange'}
                        size="sm"
                        onClick={() => comment.adminHidden ? onUnhide(comment.commentId) : onHide(comment.commentId)}
                     >
                        {comment.adminHidden ? <IconEye size={15} /> : <IconEyeOff size={15} />}
                     </ActionIcon>
                  </Tooltip>

                  <Tooltip label={comment.authorBlocked ? 'User is blocked' : 'Ban user'} withArrow>
                     <ActionIcon
                        variant="subtle"
                        color={comment.authorBlocked ? 'gray' : 'red'}
                        size="sm"
                        disabled={comment.authorBlocked}
                        onClick={handleBanClick}
                     >
                        {comment.authorBlocked ? <IconBan size={15} /> : <IconUserX size={15} />}
                     </ActionIcon>
                  </Tooltip>
               </Group>
            </Box>
         )}

         {!isReply && showReplyArea && (
            <Box
               mt="sm"
               ml="md"
               pl="md"
               style={{ borderLeft: '2px solid var(--mantine-color-gray-3)' }}
            >
               {repliesLoading && (
                  <Center py="xs">
                     <Loader size="xs" type="dots" />
                  </Center>
               )}

               {replies && replies.length > 0 && (
                  <Stack gap="sm" mb="sm">
                     {replies.map((reply, i) => (
                        <Box key={reply.commentId}>
                           <CommentItem
                              comment={reply}
                              isAdmin={isAdmin}
                              isReply
                              onHide={onHide}
                              onUnhide={onUnhide}
                              onBanUser={onBanUser}
                           />
                           {i < replies.length - 1 && <Divider mt="sm" />}
                        </Box>
                     ))}
                     <Divider />
                  </Stack>
               )}

               {isAuthenticated && (
                  <AddCommentForm
                     postId={comment.postFk}
                     parentCommentId={comment.commentId}
                     compact
                     onCommentAdded={handleReplyAdded}
                     onCancel={() => setShowReplyArea(false)}
                  />
               )}
            </Box>
         )}
      </Box>
   );
}
