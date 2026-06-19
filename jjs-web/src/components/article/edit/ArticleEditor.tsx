import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { DateInput } from '@mantine/dates';
import { TextInput, Textarea, Card, Title, Text, Stack, SimpleGrid, Grid, Checkbox, Switch, Group, Button, Box, Divider } from '@mantine/core';
import { articleSchema } from '@api/post/articleSchema';
import type { PostDetail } from '@api/post/post';
import type { Category } from '@api/post/category';
import { formatDate } from '@lib/time.functions';
import type z from 'zod';

interface ArticleEditorProps {
  post?: PostDetail;
  categories: Category[];
  isSaving?: boolean;
  onSave: (data: PostDetail) => void;
  onCancel?: () => void;
}

const DEFAULT_POST: Partial<PostDetail> = {
  title: "",
  previewText: "",
  body: "",
  releaseDate: "",
  expireDate: "",
  commentsEnabled: false,
  approved: false,
  viewCount: 0,
  imageUrl: "",
  href: "",
  categoryIds: [],
  categories: [],
};

type FormValues = z.infer<typeof articleSchema>;

export default function ArticleEditor({ post, categories = [], isSaving = false, onSave, onCancel }: ArticleEditorProps) {
  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: DEFAULT_POST as FormValues,
    validate: zodResolver(articleSchema),
  });

  useEffect(() => {
    if (post) {
      form.initialize({
        title: post.title ?? '',
        previewText: post.previewText ?? '',
        body: post.body ?? '',
        imageUrl: post.imageUrl ?? '',
        href: post.href ?? '',
        categoryIds: post.categoryIds ?? [],
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
      ...(post || {}),
      ...values,
      // Fallback handlers to ensure types strictly map back to your entity
      releaseDate: values.releaseDate ?? "",
      expireDate: values.expireDate ?? "",
    } as PostDetail;

    onSave(updatedPostData);
  };

  return (
    <Box component="form" onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack gap="xl">
        <Card withBorder padding="xl" radius="none">
          <Stack gap="md">
            <Title order={2} size="h4" fw={600} c="dark.9">Content</Title>
            <TextInput withAsterisk label="Title" placeholder="Post title" radius="none" key={form.key('title')} {...form.getInputProps('title')} />
            <Textarea withAsterisk label="Preview Text" description="Shown in listings" placeholder="Short description shown in post listings…" rows={3} radius="none" key={form.key('previewText')} {...form.getInputProps('previewText')} />
            <Textarea withAsterisk label="Body (Markdown supported)" placeholder="Write your full post using markdown formatting..." rows={14} radius="none" styles={{ input: { fontFamily: 'var(--mantine-font-family-mono)' } }} key={form.key('body')} {...form.getInputProps('body')} />
          </Stack>
        </Card>

        <Card withBorder padding="xl" radius="none">
          <Stack gap="md">
            <Title order={2} size="h4" fw={600} c="dark.9">Media &amp; Links</Title>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <TextInput label="Image URL" placeholder="https://…" radius="none" key={form.key('imageUrl')} {...form.getInputProps('imageUrl')} />
              <TextInput label="External Link (href)" placeholder="https://…" radius="none" key={form.key('href')} {...form.getInputProps('href')} />
            </SimpleGrid>
          </Stack>
        </Card>

        <Card withBorder padding="xl" radius="none">
          <Stack gap="md">
            <Title order={2} size="h4" fw={600} c="dark.9">Scheduling</Title>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <DateInput label="Release Date" description="Leave blank to publish immediately" placeholder="Pick date" radius="none" clearable value={form.getValues().releaseDate ? new Date(form.getValues().releaseDate!) : null} onChange={(date) => form.setFieldValue('releaseDate', date ? date.toISOString() : null)} error={form.errors.releaseDate} />
              <DateInput label="Expire Date" description="Leave blank to never expire" placeholder="Pick date" radius="none" clearable value={form.getValues().expireDate ? new Date(form.getValues().expireDate!) : null} onChange={(date) => form.setFieldValue('expireDate', date ? date.toISOString() : null)} error={form.errors.expireDate} />
            </SimpleGrid>
          </Stack>
        </Card>

        {categories.length > 0 && (
          <Card withBorder padding="xl" radius="none">
            <Stack gap="md">
              <Checkbox.Group label="Categories" value={form.getValues().categoryIds?.map(String) || []} onChange={(values) => form.setFieldValue('categoryIds', values.map(Number))} error={form.errors.categoryIds}>
                <Group gap="md" mt="xs">
                  {categories.map((cat) => <Checkbox key={cat.categoryId} value={String(cat.categoryId)} label={cat.title} radius="none" />)}
                </Group>
              </Checkbox.Group>
            </Stack>
          </Card>
        )}

        <Card withBorder padding="xl" radius="none">
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
          <Card withBorder padding="xl" radius="none" bg="var(--mantine-color-gray-0)">
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
          {!isNew && <Text fontFamily="monospace" size="xs" c="dimmed">ID: {post?.postId}</Text>}
        </Group>
      </Stack>
    </Box>
  );
}
