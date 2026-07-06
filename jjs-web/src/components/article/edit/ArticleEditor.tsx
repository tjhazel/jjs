import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { DateInput } from '@mantine/dates';
import { TextInput, Textarea, Card, Title, Text, Stack, SimpleGrid, Grid, Checkbox, Switch, Group, Button, Box, Divider } from '@mantine/core';
import { articleSchema, DEFAULT_POST, type FormValues } from '@api/post/articleSchema';
import type { PostDetail } from '@api/post/post';
import type { Category } from '@api/post/category';
import { formatDate } from '@lib/time.functions';
import MarkdownEditor from '@components/ui/form/MarkdownEditor';

interface ArticleEditorProps {
  post?: PostDetail;
  categories: Category[];
  isSaving?: boolean;
  onSave: (data: PostDetail) => void;
  onCancel?: () => void;
}


export default function ArticleEditor({ post, categories = [], isSaving = false, onSave, onCancel }: ArticleEditorProps) {
   const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: DEFAULT_POST,
     validate: zod4Resolver(articleSchema),
  });

  useEffect(() => {
    if (post) {
      form.initialize({
        title: post.title ?? '',
        previewText: post.previewText ?? '',
        body: post.body ?? '',
        imageUrl: post.imageUrl ?? '',
        href: post.href ?? '',
         // Map numeric IDs to strings so they match Mantine Checkbox UI state
         categoryIds: post.categoryIds ? post.categoryIds.map(String) : [],
        commentsEnabled: !!post.commentsEnabled,
        approved: !!post.approved,
        viewCount: post.viewCount ?? 0,
        releaseDate: post.releaseDate ?? undefined,
        expireDate: post.expireDate ?? undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

  const isNew = !post?.postId;

  // Combine validated form values with base post properties to satisfy PostDetail
  const handleSubmit = (values: FormValues) => {
     const updatedPostData: PostDetail = {
        // 1. Roll down the existing post model (retains original audit fields if editing)
        ...(post || {}),

        // 2. Mix in form inputs
        ...values,

        // 3. Apply explicit type maps to satisfy API entity rules
        categoryIds: values.categoryIds.map(Number),
        releaseDate: values.releaseDate ?? undefined,
        expireDate: values.expireDate ?? undefined,
     };

     console.log('updatedPostdata', updatedPostData);
     onSave(updatedPostData);
  };

  return (
    <Box component="form" onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack gap={{ base: 'xs', sm: 'xl' }}>
        <Card withBorder padding={{ base: 'xs', sm: 'xl' }} radius="none">
          <Stack gap="md">
            <Title order={2} size="h4" fw={600} c="dark.9">Content</Title>
            <TextInput withAsterisk label="Title" placeholder="Post title" radius="none" key={form.key('title')} {...form.getInputProps('title')} />
            <Textarea withAsterisk label="Preview Text" description="Shown in listings" placeholder="Short description shown in post listings…" rows={3} radius="none" key={form.key('previewText')} {...form.getInputProps('previewText')} />
            <MarkdownEditor
              key={form.key('body')}
              label="Body (Markdown supported)"
              withAsterisk
              placeholder="Write your full post using markdown formatting…"
              {...form.getInputProps('body')}
              minRows={14}
            />
          </Stack>
        </Card>

        <Card withBorder padding={{ base: 'xs', sm: 'xl' }} radius="none">
          <Stack gap="md">
            <Title order={2} size="h4" fw={600} c="dark.9">Media &amp; Links</Title>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <TextInput label="Image URL" placeholder="https://…" radius="none" key={form.key('imageUrl')} {...form.getInputProps('imageUrl')} />
              <TextInput label="External Link (href)" placeholder="https://…" radius="none" key={form.key('href')} {...form.getInputProps('href')} />
            </SimpleGrid>
          </Stack>
        </Card>

        <Card withBorder padding={{ base: 'xs', sm: 'xl' }} radius="none">
          <Stack gap="md">
            <Title order={2} size="h4" fw={600} c="dark.9">Scheduling</Title>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <DateInput
                       label="Release Date"
                       description="Leave blank to publish immediately"
                       placeholder="Pick date"
                       radius="none"
                       clearable
                       key={form.key('releaseDate')}
                       {...form.getInputProps('releaseDate')} // FIX: restitch the value tracking loop
                    />
                    <DateInput
                       label="Expire Date"
                       description="Leave blank to never expire"
                       placeholder="Pick date"
                       radius="none"
                       clearable
                       key={form.key('expireDate')}
                       {...form.getInputProps('expireDate')}  // FIX: restitch the value tracking loop
                    />            </SimpleGrid>
          </Stack>
        </Card>

           {categories.length > 0 && (
              <Card withBorder padding={{ base: 'xs', sm: 'xl' }} radius="none">
                 <Stack gap="md">
                    {/* 
        FIX: Avoid spreading directly in an uncontrolled conditional block.
        Explicitly read values and bind change handlers via form.setFieldValue.
      */}
                    <Checkbox.Group
                       label="Categories"
                       key={form.key('categoryIds')}
                       {...form.getInputProps('categoryIds')}
                    >
                       <Group gap="md" mt="xs">
                          {categories.map((cat) => (
                             <Checkbox
                                key={cat.categoryId}
                                // FIX 2: Convert number ID to string so Mantine's group can track selection states
                                value={String(cat.categoryId)}
                                label={cat.title}
                                radius="none" 
                             />
                          ))}
                       </Group>
                    </Checkbox.Group>
                 </Stack>
              </Card>
           )}

        <Card withBorder padding={{ base: 'xs', sm: 'xl' }} radius="none">
          <Stack gap="md">
            <Title order={2} size="h4" fw={600} c="dark.9">Settings</Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" my="xs">
              <Switch labelPosition="left" label={<Box><Text size="sm" fw={500}>Approved</Text><Text size="xs" c="dimmed">Visible to the public</Text></Box>} key={form.key('approved')} {...form.getInputProps('approved', { type: 'checkbox' })} />
              <Switch labelPosition="left" label={<Box><Text size="sm" fw={500}>Comments Enabled</Text><Text size="xs" c="dimmed">Allow readers to comment</Text></Box>} key={form.key('commentsEnabled')} {...form.getInputProps('commentsEnabled', { type: 'checkbox' })} />
            </SimpleGrid>
            <Divider my="sm" />
            <TextInput label="View Count" description="Read-only diagnostic counter" type="number" w={{ base: '100%', sm: 200 }} disabled radius="none" key={form.key('viewCount')} {...form.getInputProps('viewCount')} />
          </Stack>
        </Card>

        {!isNew && (
          <Card withBorder padding={{ base: 'xs', sm: 'xl' }} radius="none" bg="var(--mantine-color-gray-0)">
            <Stack gap="md">
              <Title order={2} size="h4" fw={600} c="dark.9">Audit Overview</Title>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Created By</Text>
                  <Text size="sm" fw={500}>{post?.createdBy || 'System Automatic'}</Text>
                  <Text size="xs" c="dimmed">{post?.createdDate ? formatDate(post.createdDate) : "—"}</Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Last Modified</Text>
                  <Text size="sm" fw={500}>{post?.modifiedBy || 'System Automatic'}</Text>
                  <Text size="xs" c="dimmed">{post?.modifiedDate ? formatDate(post.modifiedDate) : "—"}</Text>
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>
        )}

        <Group justify="space-between" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
          <Group gap="md">
            <Button type="submit" color="dark" radius="none" loading={isSaving} disabled={!form.isDirty()}>{isNew ? 'Create Post' : 'Save Changes'}</Button>
            {onCancel && <Button type="button" variant="subtle" color="gray" radius="none" onClick={onCancel}>Cancel</Button>}
          </Group>
          {!isNew && <Text ff="monospace" size="xs" c="dimmed">ID: {post?.postId}</Text>}
        </Group>
      </Stack>
    </Box>
  );
}
