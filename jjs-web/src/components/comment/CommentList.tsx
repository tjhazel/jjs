import { Stack, Title, Text, Divider, Box, Group, Loader, Center } from '@mantine/core';
import { useComments } from '@api/comment/comment-fetcher';
import { useApiContext } from '@api/ApiContext';

interface CommentListProps {
   postId: number;
}

export default function CommentList({ postId }: CommentListProps) {
   const { httpGet } = useApiContext();
   const { data: comments, isLoading, error } = useComments(httpGet, postId);

   if (isLoading) {
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

   if (!comments || comments.length === 0) {
      return <Text size="sm" c="dimmed">No comments yet.</Text>;
   }

   return (
      <Stack gap="lg">
         {comments.map((comment) => (
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
      </Stack>
   );
}
