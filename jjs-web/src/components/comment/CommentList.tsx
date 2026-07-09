import { useState, useEffect } from 'react';
import { Stack, Title, Text, Divider, Box, Group, Loader, Center, Button } from '@mantine/core';
import { useComments } from '@api/comment/comment-fetcher';
import { useApiContext } from '@api/ApiContext';
import type { Comment } from '@api/comment/comment';
import AddCommentForm from './AddCommentForm';

interface CommentListProps {
   postId: number;
}

export default function CommentList({ postId }: CommentListProps) {
   const { httpGet } = useApiContext();
   const [page, setPage] = useState(1);
   const [allComments, setAllComments] = useState<Comment[]>([]);
   const { data, isLoading, error } = useComments(httpGet, postId, page);

   useEffect(() => {
      setPage(1);
      setAllComments([]);
   }, [postId]);

   useEffect(() => {
      if (!data?.items) return;
      setAllComments(prev => page === 1 ? data.items : [...prev, ...data.items]);
   }, [data]);

   const handleCommentAdded = () => {
      setPage(1);
      setAllComments([]);
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
                     <Stack gap={4}>
                        <Title order={5} fw={600}>{comment.title}</Title>
                        <Group gap="xs" c="gray.6">
                           <Text size="sm">{comment.authorName}</Text>
                           <Text size="sm">·</Text>
                           <Text size="sm">{new Date(comment.createdDate).toLocaleDateString()}</Text>
                        </Group>
                        <Text size="sm" mt={4}>{comment.entryText}</Text>
                     </Stack>
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
            <AddCommentForm postId={postId} onCommentAdded={handleCommentAdded} />
         </Box>
      </Stack>
   );
}
