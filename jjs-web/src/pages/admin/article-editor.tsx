import { useState } from 'react';
import { useNavigate, useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { Stack, Title, Text, Button, Alert, Group, Center, Loader } from '@mantine/core';
import { IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';
import { useAllPosts, savePost } from '@api/post/post-fetcher';
import { useCategories } from '@api/post/category-fetcher';
import { useApiContext } from '@api/ApiContext';
import ArticleEditor from '@components/article/edit/ArticleEditor';
import type { PostDetail } from '@api/post/post';

// 🟢 1. EXPORT THE LOADER INTERCEPTOR FROM HERE
export const editArticleLoader = async ({ params }: LoaderFunctionArgs) => {
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
export default function EditArticlePage() {
  const navigate = useNavigate();
  const { httpGet, httpPost } = useApiContext();
   const { data: posts, isLoading, error } = useAllPosts(httpGet);
  const { data: categories, isLoading: isLoadingCategories } = useCategories(httpGet);

  // Safely retrieve parameters prepared by the route loader above
  const { id, isNew } = useLoaderData() as { id: number | null; isNew: boolean };

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const article = isNew ? undefined : posts?.find((p) => p.postId === id);

  const handleSave = async (formData: PostDetail) => {
    setIsSaving(true);
     setSaveError(null);


    try {
      if (isNew) {
        console.log('Sending creation payload to database:', formData);
      } else {
        console.log(`Sending updates for article ID ${id}:`, formData);
       }
       await savePost(httpPost, formData);
      navigate('/admin');
    } catch (err: any) {
      setSaveError(err?.message || 'An error occurred while saving the document.');
    } finally {
      setIsSaving(false);
    }
  };

   const showLoading = !isNew && (isLoading || isLoadingCategories);
  const articleNotFound = !isNew && !isLoading && !article;

   if (showLoading) {
      return (
         <Center py="xl">
            <Group gap="sm">
               <Loader size="sm" type="dots" />
               <Text c="dimmed">Loading articles...</Text>
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
              onClick={() => navigate('/admin')}
              styles={{ root: { paddingLeft: 0 } }}
            >
              Back to Articles
            </Button>
          </Group>
          
          <Title order={1} size="h2" fw={600} lh="sm" c="dark.9">
            {isNew ? 'Create New Article' : 'Edit Article'}
          </Title>
          <Text size="xs" c="dimmed">
            {isNew ? 'Configure content parameters to publish a new page.' : `Modifying parameters for Article reference #${id}`}
          </Text>
        </Stack>

        {(error || saveError || articleNotFound) && (
          <Alert variant="light" color="red" title="Administrative Warning Alert" icon={<IconAlertCircle size={16} />} radius="none">
            {articleNotFound && "The requested article reference details could not be found."}
            {saveError && saveError}
            {error && "Failed to coordinate current article collection rows with the database server backend."}
          </Alert>
        )}

        {!articleNotFound && (
          <ArticleEditor
            post={article}
            categories={categories}
            isSaving={isSaving}
            onSave={handleSave}
            onCancel={() => navigate('/admin')}
          />
        )}
    </Stack>
  );
}
