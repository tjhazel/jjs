// src/components/article/edit/ManageArticles.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Table, Group, Text, Button, Select, Stack, Center, Loader, Card, Badge } from '@mantine/core';
import { IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons-react';
import { formatDate } from '@lib/time.functions';
import type { PostDetail } from '@api/post/post';

interface ManageArticlesProps {
  posts: PostDetail[] | undefined;
  isLoading: boolean;
}

type SortKey = 'title' | 'approved' | 'viewCount' | 'createdDate';

export default function ManageArticles({ posts, isLoading }: ManageArticlesProps) {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  if (isLoading) {
    return (
      <Center py="xl">
        <Group gap="sm"><Loader size="sm" type="dots" /><Text c="dimmed">Loading posts...</Text></Group>
      </Center>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Center py="xl"><Text c="dimmed">No posts found.</Text></Center>
    );
  }

  const handleSort = (field: SortKey) => {
    if (sortBy === field) {
      setReverseSortDirection((current) => !current);
    } else {
      setSortBy(field);
      setReverseSortDirection(false);
    }
    setActivePage(1);
  };

  const sortedData = [...posts].sort((a, b) => {
    if (!sortBy) return 0;
    const valA = a[sortBy];
    const valB = b[sortBy];

    if (sortBy === 'createdDate') {
      return reverseSortDirection
        ? new Date(valB as string).getTime() - new Date(valA as string).getTime()
        : new Date(valA as string).getTime() - new Date(valB as string).getTime();
    }
    if (sortBy === 'viewCount') {
      return reverseSortDirection ? (valB as number) - (valA as number) : (valA as number) - (valB as number);
    }
    if (sortBy === 'approved') {
      return reverseSortDirection ? Number(valB) - Number(valA) : Number(valA) - Number(valB);
    }
    return reverseSortDirection ? String(valB).localeCompare(String(valA)) : String(valA).localeCompare(String(valB));
  });

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice((activePage - 1) * pageSize, activePage * pageSize);

  const renderTh = (field: SortKey, label: string) => {
    const isCurrent = sortBy === field;
    return (
      <Table.Th onClick={() => handleSort(field)} style={{ cursor: 'pointer' }}>
        <Group justify="space-between" wrap="nowrap">
          <Text size="sm" fw={600} c="dark.9">{label}</Text>
          <Center>
            {!isCurrent && <IconSelector size={16} stroke={1.5} color="var(--mantine-color-gray-4)" />}
            {isCurrent && (reverseSortDirection ? <IconChevronDown size={16} stroke={1.5} /> : <IconChevronUp size={16} stroke={1.5} />)}
          </Center>
        </Group>
      </Table.Th>
    );
  };

  return (
    <Stack gap="xl" w="100%">
      <Table.ScrollContainer minWidth={700} visibleFrom="sm">
        <Table variant="simple" layout="fixed" highlightOnHover withBorder>
          <Table.Thead>
            <Table.Tr>
              {renderTh('title', 'Title')}
              <Table.Th><Text size="sm" fw={600} c="dark.9">Categories</Text></Table.Th>
              {renderTh('approved', 'Status')}
              {renderTh('viewCount', 'Views')}
              {renderTh('createdDate', 'Created')}
              <Table.Th style={{ width: 80 }} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedData.map((post) => (
              <Table.Tr key={post.postId} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/article/${post.postId}`)}>
                <Table.Td><Text size="sm" truncate fw={500}>{post.title}</Text></Table.Td>
                <Table.Td><Text size="sm" truncate c="gray.6">{post.categories?.join(', ') || '—'}</Text></Table.Td>
                <Table.Td><Badge color={post.approved ? 'green' : 'gray'} radius="none" variant="light">{post.approved ? 'Approved' : 'Draft'}</Badge></Table.Td>
                <Table.Td><Text size="sm">{post.viewCount.toLocaleString()}</Text></Table.Td>
                <Table.Td><Text size="sm">{formatDate(post.createdDate)}</Text></Table.Td>
                <Table.Td onClick={(e) => e.stopPropagation()}>
                  <Button variant="default" size="xs" radius="none" onClick={() => navigate(`/admin/article/${post.postId}`)}>Edit</Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {/* Mobile Stack View Frame */}
      <Stack gap="sm" hiddenFrom="sm">
        {paginatedData.map((post) => (
          <Card key={post.postId} withBorder padding="md" radius="none" style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/article/${post.postId}`)}>
            <Text fw={600} size="md" c="dark.9" mb="xs">{post.title}</Text>
            <Stack gap={4}>
              <Text size="sm" c="gray.7"><strong>Categories:</strong> {post.categories?.join(', ') || '—'}</Text>
              <Group gap="xs">
                <Text size="sm" c="gray.7"><strong>Status:</strong></Text>
                <Badge color={post.approved ? 'green' : 'gray'} radius="none" size="xs" variant="light">{post.approved ? 'Approved' : 'Draft'}</Badge>
              </Group>
              <Text size="sm" c="gray.7"><strong>Views:</strong> {post.viewCount.toLocaleString()}</Text>
              <Text size="sm" c="gray.7"><strong>Created:</strong> {formatDate(post.createdDate)}</Text>
            </Stack>
          </Card>
        ))}
      </Stack>

      {/* Pagination Footer Controls */}
      <Group justify="space-between" align="center" wrap="wrap" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
        <Text size="sm" c="dimmed">Page {activePage} of {totalPages || 1}</Text>
        <Group gap="xs">
          <Button variant="default" size="xs" radius="none" disabled={activePage === 1} onClick={() => setActivePage((prev) => Math.max(prev - 1, 1))}>Previous</Button>
          <Button variant="default" size="xs" radius="none" disabled={activePage >= totalPages} onClick={() => setActivePage((prev) => Math.min(prev + 1, totalPages))}>Next</Button>
        </Group>
        <Group gap="xs">
          <Text size="sm" c="dimmed">Per page:</Text>
          <Select size="xs" w={80} radius="none" value={String(pageSize)} onChange={(val) => { setPageSize(Number(val)); setActivePage(1); }} data={['5', '10', '20', '30', '40', '50']} allowDeselect={false} />
        </Group>
      </Group>
    </Stack>
  );
}
