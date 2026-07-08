import { useState } from 'react';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { TextInput, Textarea, Button, Stack, Text, Group, Box, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useAuth } from '@lib/auth/authContext';
import { GoogleSignInButton } from '@lib/auth/GoogleLoginButton';
import { useApiContext } from '@api/ApiContext';
import { addComment } from '@api/comment/comment-fetcher';
import { commentSchema, DEFAULT_COMMENT, type CommentFormValues } from '@api/comment/commentSchema';

interface AddCommentFormProps {
   postId: number;
}

export default function AddCommentForm({ postId }: AddCommentFormProps) {
   const { isAuthenticated, user } = useAuth();
   const { httpPost } = useApiContext();
   const [isSaving, setIsSaving] = useState(false);
   const [submitError, setSubmitError] = useState<string | null>(null);
   const [submitted, setSubmitted] = useState(false);

   const form = useForm<CommentFormValues>({
      mode: 'uncontrolled',
      initialValues: DEFAULT_COMMENT,
      validate: zod4Resolver(commentSchema),
   });

   if (!isAuthenticated) {
      return (
         <Box>
            <Text size="sm" c="dimmed" mb="sm">Sign in to leave a comment.</Text>
            <GoogleSignInButton />
         </Box>
      );
   }

   if (submitted) {
      return (
         <Alert color="green" radius="none">
            Your comment has been posted. Thanks, {user?.name}!
         </Alert>
      );
   }

   const handleSubmit = async (values: CommentFormValues) => {
      setIsSaving(true);
      setSubmitError(null);
      try {
         await addComment(httpPost, postId, values);
         form.reset();
         setSubmitted(true);
      } catch {
         setSubmitError('Failed to post comment. Please try again.');
      } finally {
         setIsSaving(false);
      }
   };

   return (
      <Box component="form" onSubmit={form.onSubmit(handleSubmit)} noValidate>
         <Stack gap="sm">
            <Text size="sm" c="dimmed">Commenting as <strong>{user?.name}</strong></Text>
            <TextInput
               withAsterisk
               label="Title"
               placeholder="Comment title"
               radius="none"
               key={form.key('title')}
               {...form.getInputProps('title')}
            />
            <Textarea
               withAsterisk
               label="Comment"
               placeholder="Write your comment…"
               rows={4}
               radius="none"
               key={form.key('entryText')}
               {...form.getInputProps('entryText')}
            />
            {submitError && (
               <Alert color="red" radius="none" icon={<IconInfoCircle size={16} />}>
                  {submitError}
               </Alert>
            )}
            <Group>
               <Button type="submit" color="dark" radius="none" loading={isSaving}>
                  Post Comment
               </Button>
            </Group>
         </Stack>
      </Box>
   );
}
