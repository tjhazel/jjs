import { useState } from 'react';
import { useNavigate, useLoaderData, useSearchParams, type LoaderFunctionArgs } from 'react-router';
import { Stack, Title, Text, Button, Alert, Group, Center, Loader } from '@mantine/core';
import { IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';
import { useAllPosts, savePost } from '@api/post/post-fetcher';
import { useCategories } from '@api/post/category-fetcher';
import { useApiContext } from '@api/ApiContext';
import PostEditor from '@components/post/edit/PostEditor';
import type { PostDetail } from '@api/post/post';

// 🟢 1. EXPORT THE LOADER INTERCEPTOR FROM HERE
export const editPostLoader = async ({ params }: LoaderFunctionArgs) => {
  const idParam = params.id;
  if (!idParam) {
    throw new Response("Missing Parameter Target Identifier", { status: 400 });
  }

  if (idParam === 'new') {
    return { id: null, isNew: true };
  }

  const parsedId = parseInt(idParam, 10);
  if (isNaN(parsedId)) {
    throw new Response("Invalid Target Identification Format", { status: 400 });
  }

  return { id: parsedId, isNew: false };
};

// 🟢 2. THE EDITING WRAPPER ROUTE COMPONENT
export default function EditPostPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { httpGet, httpPost } = useApiContext();
   const { data: posts, isLoading, error } = useAllPosts(httpGet);
  const { data: categories, isLoading: isLoadingCategories } = useCategories(httpGet);

  // Safely retrieve parameters prepared by the route loader above
  const { id, isNew } = useLoaderData() as { id: number | null; isNew: boolean };

  const backHref = (() => {
    const params = new URLSearchParams();
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    if (category) params.set('category', category);
    if (status) params.set('status', status);
    const qs = params.toString();
    return qs ? `/admin/posts?${qs}` : '/admin/posts';
  })();

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const post = isNew ? undefined : posts?.find((p) => p.postId === id);

  const handleSave = async (formData: PostDetail) => {
    setIsSaving(true);
     setSaveError(null);


    try {
      if (isNew) {
        console.log('Sending creation payload to database:', formData);
      } else {
        console.log(`Sending updates for post ID ${id}:`, formData);
       }
       await savePost(httpPost, formData);
      navigate(backHref);
    } catch (err: any) {
      setSaveError(err?.message || 'An error occurred while saving the document.');
    } finally {
      setIsSaving(false);
    }
  };

   const showLoading = !isNew && (isLoading || isLoadingCategories);
  const postNotFound = !isNew && !isLoading && !post;

   if (showLoading) {
      return (
         <Center py="xl">
            <Group gap="sm">
               <Loader size="sm" type="dots" />
               <Text c="dimmed">Loading posts...</Text>
            </Group>
         </Center>
      );
   }

  return (
    <Stack gap={{ base: 'xs', sm: 'xl' }}>
        <Stack gap={4}>
          <Group>
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate(backHref)}
              styles={{ root: { paddingLeft: 0 } }}
            >
              Back to Posts
            </Button>
          </Group>

          <Title order={1} size="h2" fw={600} lh="sm" c="dark.9">
            {isNew ? 'Create New Post' : 'Edit Post'}
          </Title>
          <Text size="xs" c="dimmed">
            {isNew ? 'Configure content parameters to publish a new page.' : `Modifying parameters for Post reference #${id}`}
          </Text>
        </Stack>

        {(error || saveError || postNotFound) && (
          <Alert variant="light" color="red" title="Administrative Warning Alert" icon={<IconAlertCircle size={16} />} radius="none">
            {postNotFound && "The requested post reference details could not be found."}
            {saveError && saveError}
            {error && "Failed to coordinate current post collection rows with the database server backend."}
          </Alert>
        )}

        {!postNotFound && (
          <PostEditor
            post={post}
            categories={categories}
            isSaving={isSaving}
            onSave={handleSave}
            onCancel={() => navigate('/admin')}
          />
        )}
    </Stack>
  );
}
