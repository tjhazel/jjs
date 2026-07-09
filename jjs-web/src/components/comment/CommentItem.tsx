import { useState } from 'react';
import { Stack, Title, Text, Box, Group, ActionIcon, Tooltip } from '@mantine/core';
import { IconEye, IconEyeOff, IconUserX, IconBan } from '@tabler/icons-react';
import type { Comment } from '@api/comment/comment';
import HiddenOverlay from '@components/ui/HiddenOverlay';
import InlineAlert from '@components/ui/InlineAlert';

interface CommentItemProps {
   comment: Comment;
   isAdmin: boolean;
   onHide: (commentId: number) => void;
   onUnhide: (commentId: number) => void;
   onBanUser: (comment: Comment) => Promise<void>;
}

export default function CommentItem({ comment, isAdmin, onHide, onUnhide, onBanUser }: CommentItemProps) {
   const [banError, setBanError] = useState<string | null>(null);

   const handleBanClick = async () => {
      setBanError(null);
      try {
         await onBanUser(comment);
      } catch (e) {
         setBanError((e as Error).message);
      }
   };

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
            {banError && <InlineAlert message={banError} onClose={() => setBanError(null)} />}
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
      </Box>
   );
}
