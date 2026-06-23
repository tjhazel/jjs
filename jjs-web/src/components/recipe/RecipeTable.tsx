import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Table, Group, Text, Button, Select, Stack, Center, Loader, Card } from '@mantine/core';
import { IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons-react';
import { formatDate } from '@lib/time.functions'; // Adjust import paths as necessary
import type { Recipe } from '@api/recipe/recipe'; // Adjust import paths as necessary

interface RecipeTableProps {
  recipes: Recipe[] | undefined;
  isLoading: boolean;
}

type SortKey = 'name' | 'course' | 'dishType' | 'createdDate';

export default function RecipeTable({ recipes, isLoading }: RecipeTableProps) {
  const navigate = useNavigate();

  // Sorting and Pagination Component States
  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 1. Initial State Guards
  if (isLoading) {
    return (
      <Center py="xl">
        <Group gap="sm">
          <Loader size="sm" type="dots" />
          <Text c="dimmed">Loading recipes...</Text>
        </Group>
      </Center>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">No recipes found.</Text>
      </Center>
    );
  }

  // 2. Client-Side Sorting Engine Logic
  const handleSort = (field: SortKey) => {
    if (sortBy === field) {
      setReverseSortDirection((current) => !current);
    } else {
      setSortBy(field);
      setReverseSortDirection(false);
    }
    setActivePage(1); // Reset back to the first page index on ordering shifts
  };

  const sortedData = [...recipes].sort((a, b) => {
    if (!sortBy) return 0;
    
    let valA = a[sortBy] || '';
    let valB = b[sortBy] || '';

    if (sortBy === 'createdDate') {
      return reverseSortDirection
        ? new Date(valB).getTime() - new Date(valA).getTime()
        : new Date(valA).getTime() - new Date(valB).getTime();
    }

    return reverseSortDirection 
      ? String(valB).localeCompare(String(valA)) 
      : String(valA).localeCompare(String(valB));
  });

  // 3. Client-Side Pagination Slicing
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize
  );

  // Helper template engine to handle sort arrow icon swap triggers cleanly
  const renderTh = (field: SortKey, label: string) => {
    const isCurrent = sortBy === field;
    return (
      <Table.Th onClick={() => handleSort(field)} style={{ cursor: 'pointer' }}>
        <Group justify="space-between" wrap="nowrap">
          <Text size="sm" fw={600} c="dark.9">{label}</Text>
          <Center>
            {!isCurrent && <IconSelector size={16} stroke={1.5} color="var(--mantine-color-gray-4)" />}
            {isCurrent && (reverseSortDirection 
              ? <IconChevronDown size={16} stroke={1.5} /> 
              : <IconChevronUp size={16} stroke={1.5} />
            )}
          </Center>
        </Group>
      </Table.Th>
    );
  };

  return (
    <Stack gap="xl" w="100%">
      
      {/* ─── Desktop Table Layout Frame (Visible from Breakpoint Small) ─── */}
      <Table.ScrollContainer minWidth={600} visibleFrom="sm">
        <Table variant="simple" layout="fixed" highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              {renderTh('name', 'Name')}
              {renderTh('course', 'Course')}
              {renderTh('dishType', 'Dish Type')}
              {renderTh('createdDate', 'Created')}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedData.map((recipe) => (
              <Table.Tr
                key={recipe.recipeId}
                style={{ cursor: 'pointer' }}
                onClick={() => recipe.recipeId && navigate(`/recipe/${recipe.recipeId}`)}
              >
                <Table.Td><Text size="sm">{recipe.name}</Text></Table.Td>
                <Table.Td><Text size="sm">{recipe.course}</Text></Table.Td>
                <Table.Td><Text size="sm">{recipe.dishType}</Text></Table.Td>
                <Table.Td><Text size="sm">{formatDate(recipe.createdDate)}</Text></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {/* ─── Mobile Dynamic Stack Layout (Hidden from Breakpoint Small) ─── */}
      <Stack gap="sm" hiddenFrom="sm">
        {paginatedData.map((recipe) => (
          <Card
            key={recipe.recipeId}
            withBorder
            padding="md"
            radius="none"
            style={{ cursor: 'pointer' }}
            onClick={() => recipe.recipeId && navigate(`/recipe/${recipe.recipeId}`)}
          >
            <Text fw={600} size="md" c="dark.9" mb="xs">
              {recipe.name}
            </Text>
            <Stack gap={4}>
              <Text size="sm" c="gray.7">
                <strong>Course:</strong> {recipe.course}
              </Text>
              <Text size="sm" c="gray.7">
                <strong>Type:</strong> {recipe.dishType}
              </Text>
              <Text size="sm" c="gray.7">
                <strong>Created:</strong> {formatDate(recipe.createdDate)}
              </Text>
            </Stack>
          </Card>
        ))}
      </Stack>

      {/* ─── Unified Control Pagination Grid Frame ─── */}
      <Group justify="space-between" align="center" wrap="wrap" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
        <Text size="sm" c="dimmed">
          Page {activePage} of {totalPages || 1}
        </Text>

        <Group gap="xs">
          <Button
            variant="default"
            size="xs"
            radius="none"
            disabled={activePage === 1}
            onClick={() => setActivePage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <Button
            variant="default"
            size="xs"
            radius="none"
            disabled={activePage >= totalPages}
            onClick={() => setActivePage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </Button>
        </Group>

        <Group gap="xs">
          <Text size="sm" c="dimmed">Per page:</Text>
          <Select
            size="xs"
            w={80}
            radius="none"
            value={String(pageSize)}
            onChange={(val) => {
              setPageSize(Number(val));
              setActivePage(1);
            }}
            data={['5', '10', '20', '30', '40', '50']}
            allowDeselect={false}
          />
        </Group>
      </Group>

    </Stack>
  );
}
