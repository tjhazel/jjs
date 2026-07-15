import { useState } from 'react';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { TextInput, Textarea, Button, Stack, Text, Group, Box, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useAuth } from '@lib/auth/authContext';
import { GoogleSignInButton } from '@lib/auth/GoogleLoginButton';
import { useApiContext } from '@api/ApiContext';
import { addComment, addReply } from '@api/comment/comment-fetcher';
import { commentSchema, DEFAULT_COMMENT, type CommentFormValues } from '@api/comment/commentSchema';

interface AddCommentFormProps {
   postId: number;
   parentCommentId?: number;
   compact?: boolean;
   onCommentAdded?: () => void;
   onCancel?: () => void;
}

export default function AddCommentForm({ postId, parentCommentId, compact, onCommentAdded, onCancel }: AddCommentFormProps) {
   const { isAuthenticated, user } = useAuth();
   const { httpPost } = useApiContext();
   const [isSaving, setIsSaving] = useState(false);
   const [submitError, setSubmitError] = useState<string | null>(null);
   const [submitted, setSubmitted] = useState(false);

   const isReply = parentCommentId !== undefined;

   const form = useForm<CommentFormValues>({
      mode: 'uncontrolled',
      initialValues: DEFAULT_COMMENT,
      validate: zod4Resolver(commentSchema),
   });

   if (!isAuthenticated) {
      if (isReply) return null;
      return (
         <Box>
            <Text size="sm" c="dimmed" mb="sm">Sign in to leave a comment.</Text>
            <GoogleSignInButton />
         </Box>
      );
   }

   const handleSubmit = async (values: CommentFormValues) => {
      setIsSaving(true);
      setSubmitError(null);
      try {
         if (isReply) {
            await addReply(httpPost, postId, parentCommentId, values);
         } else {
            await addComment(httpPost, postId, values);
         }
         form.reset();
         setSubmitted(true);
         onCommentAdded?.();
      } catch {
         setSubmitError(`Failed to post ${isReply ? 'reply' : 'comment'}. Please try again.`);
      } finally {
         setIsSaving(false);
      }
   };

   return (
      <Stack gap="sm">
         {submitted && (
            <Alert color="green" radius="none">
               {isReply ? `Reply posted. Thanks, ${user?.displayName}!` : `Your comment has been posted. Thanks, ${user?.displayName}!`}
            </Alert>
         )}
         <Box component="form" onSubmit={form.onSubmit(handleSubmit)} noValidate>
            <Stack gap="sm">
               {!compact && (
                  <Text size="sm" c="dimmed">Commenting as <strong>{user?.displayName}</strong></Text>
               )}
               <TextInput
                  label="Title"
                  placeholder={isReply ? 'Reply title' : 'Comment title'}
                  radius="none"
                  size={compact ? 'sm' : 'md'}
                  key={form.key('title')}
                  {...form.getInputProps('title')}
               />
               <Textarea
                  withAsterisk
                  spellCheck={true}
                  label={compact ? undefined : 'Comment'}
                  placeholder={isReply ? 'Write your reply…' : 'Write your comment…'}
                  rows={compact ? 2 : 4}
                  radius="none"
                  size={compact ? 'sm' : 'md'}
                  key={form.key('entryText')}
                  {...form.getInputProps('entryText')}
               />
               {submitError && (
                  <Alert color="red" radius="none" icon={<IconInfoCircle size={16} />}>
                     {submitError}
                  </Alert>
               )}
               <Group gap="xs">
                  <Button type="submit" color="dark" radius="none" size={compact ? 'xs' : 'sm'} loading={isSaving}>
                     {isReply ? 'Post Reply' : 'Post Comment'}
                  </Button>
                  {onCancel && (
                     <Button variant="subtle" color="gray" radius="none" size={compact ? 'xs' : 'sm'} onClick={onCancel}>
                        Cancel
                     </Button>
                  )}
               </Group>
            </Stack>
         </Box>
      </Stack>
   );
}
