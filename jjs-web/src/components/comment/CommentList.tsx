import { useState, useEffect, useRef } from 'react';
import { Stack, Title, Text, Divider, Box, Group, Loader, Center, Button } from '@mantine/core';
import { useComments, hideComment, unhideComment } from '@api/comment/comment-fetcher';
import { blockUser } from '@api/user/user-fetcher';
import { useApiContext } from '@api/ApiContext';
import { useAuth } from '@lib/auth/authContext';
import type { HttpError } from '@lib/httpClient';
import type { Comment } from '@api/comment/comment';
import CommentItem from './CommentItem';
import AddCommentForm from './AddCommentForm';

interface CommentListProps {
   postId: number;
   highlightCommentId?: number;
}

export default function CommentList({ postId, highlightCommentId }: CommentListProps) {
   const { httpGet, httpPatch } = useApiContext();
   const { hasRole } = useAuth();
   const isAdmin = hasRole('Admin');
   const [page, setPage] = useState(1);
   const [allComments, setAllComments] = useState<Comment[]>([]);
   const scrolledRef = useRef(false);
   const { data, isLoading, error } = useComments(httpGet, postId, page);

   useEffect(() => {
      setPage(1);
      setAllComments([]);
   }, [postId]);

   useEffect(() => {
      if (!data?.items) return;
      setAllComments(prev => page === 1 ? data.items : [...prev, ...data.items]);
   }, [data]);

   // Scroll to and highlight a specific comment when navigating from admin users page
   useEffect(() => {
      if (!highlightCommentId || allComments.length === 0 || scrolledRef.current) return;
      const el = document.getElementById(`comment-${highlightCommentId}`);
      if (el) {
         scrolledRef.current = true;
         setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
      }
   }, [highlightCommentId, allComments]);

   const reset = () => { setPage(1); setAllComments([]); scrolledRef.current = false; };

   const handleHide = async (commentId: number) => {
      await hideComment(httpPatch, commentId);
      reset();
   };

   const handleUnhide = async (commentId: number) => {
      await unhideComment(httpPatch, commentId);
      reset();
   };

   const handleBanUser = async (comment: Comment) => {
      try {
         await blockUser(httpPatch, comment.authorEmail!, `comment on post ${comment.postFk}`);
      } catch (e) {
         const err = e as HttpError;
         const data = err.responseData as { message?: string } | undefined;
         throw new Error(data?.message ?? err.message);
      }
   };

   if (isLoading && page === 1) {
      return (
         <Center py="md">
            <Group gap="sm">
               <Loader size="xs" type="dots" />
               <Text size="sm" c="dimmed">Loading comments...</Text>
            </Group>
         </Center>
      );
   }

   if (error) {
      return <Text size="sm" c="dimmed">Unable to load comments.</Text>;
   }

   return (
      <Stack gap="xl">
         {allComments.length === 0 ? (
            <Text size="sm" c="dimmed">No comments yet. Be the first!</Text>
         ) : (
            <Stack gap="lg">
               {allComments.map((comment) => (
                  <Box key={comment.commentId}>
                     <CommentItem
                        comment={comment}
                        isAdmin={isAdmin}
                        isHighlighted={comment.commentId === highlightCommentId}
                        onHide={handleHide}
                        onUnhide={handleUnhide}
                        onBanUser={handleBanUser}
                     />
                     <Divider mt="md" />
                  </Box>
               ))}

               {data?.hasMore && (
                  <Center>
                     <Button
                        variant="subtle"
                        color="dark"
                        radius="none"
                        loading={isLoading}
                        onClick={() => setPage(p => p + 1)}
                     >
                        Load more comments
                     </Button>
                  </Center>
               )}
            </Stack>
         )}

         <Box>
            <Title order={4} fw={600} mb="sm">Leave a Comment</Title>
            <AddCommentForm postId={postId} onCommentAdded={reset} />
         </Box>
      </Stack>
   );
}
