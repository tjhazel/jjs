import { Stack, Title, Text, Box, Group, ActionIcon, Tooltip } from '@mantine/core';
import { IconEye, IconEyeOff, IconUserX } from '@tabler/icons-react';
import type { Comment } from '@api/comment/comment';
import HiddenOverlay from './HiddenOverlay';

interface CommentItemProps {
   comment: Comment;
   isAdmin: boolean;
   onHide: (commentId: number) => void;
   onUnhide: (commentId: number) => void;
   onBanUser: (comment: Comment) => void;
}

export default function CommentItem({ comment, isAdmin, onHide, onUnhide, onBanUser }: CommentItemProps) {
   return (
      <Box pos="relative">
         <Stack gap={4} pr={isAdmin ? 56 : 0}>
            <Title order={5} fw={600}>{comment.title}</Title>
            <Group gap="xs" c="gray.6">
               <Text size="sm">{comment.authorName}</Text>
               <Text size="sm">·</Text>
               <Text size="sm">{new Date(comment.createdDate).toLocaleDateString()}</Text>
            </Group>
            <Text size="sm" mt={4}>{comment.entryText}</Text>
         </Stack>

         {isAdmin && comment.adminHidden && <HiddenOverlay />}

         {isAdmin && (
            <Box style={{ position: 'absolute', top: 0, right: 0, zIndex: 2 }}>
               <Group gap={4} wrap="nowrap">
                  <Tooltip
                     label={comment.adminHidden ? 'Unhide comment' : 'Hide comment'}
                     withArrow
                  >
                     <ActionIcon
                        variant="subtle"
                        color={comment.adminHidden ? 'blue' : 'orange'}
                        size="sm"
                        onClick={() => comment.adminHidden ? onUnhide(comment.commentId) : onHide(comment.commentId)}
                     >
                        {comment.adminHidden ? <IconEye size={15} /> : <IconEyeOff size={15} />}
                     </ActionIcon>
                  </Tooltip>

                  <Tooltip label="Ban user" withArrow>
                     <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => onBanUser(comment)}
                     >
                        <IconUserX size={15} />
                     </ActionIcon>
                  </Tooltip>
               </Group>
            </Box>
         )}
      </Box>
   );
}
