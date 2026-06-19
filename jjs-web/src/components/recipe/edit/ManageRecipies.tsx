import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Table, Group, Text, Button, Select, Stack, Center, Loader, Card, Badge } from '@mantine/core';
import { IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons-react';
import type { Recipe } from '@api/recipe/recipe';

interface ManageRecipesProps {
  recipes: Recipe[] | undefined;
  isLoading: boolean;
}

type SortKey = 'name' | 'course' | 'dishType' | 'estimatedCost' | 'isViewableByPublic';

export default function ManageRecipes({ recipes, isLoading }: ManageRecipesProps) {
  const navigate = useNavigate();

  // Sorting and Pagination Layout States
  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  // Client-Side Sorting Engine Array Maps
  const handleSort = (field: SortKey) => {
    if (sortBy === field) {
      setReverseSortDirection((current) => !current);
    } else {
      setSortBy(field);
      setReverseSortDirection(false);
    }
    setActivePage(1);
  };

  const sortedData = [...recipes].sort((a, b) => {
    if (!sortBy) return 0;

    const valA = a[sortBy];
    const valB = b[sortBy];

    if (sortBy === 'estimatedCost') {
      return reverseSortDirection 
        ? (valB as number) - (valA as number) 
        : (valA as number) - (valB as number);
    }

    if (sortBy === 'isViewableByPublic') {
      return reverseSortDirection
        ? Number(valB) - Number(valA)
        : Number(valA) - Number(valB);
    }

    return reverseSortDirection
      ? String(valB).localeCompare(String(valA))
      : String(valA).localeCompare(String(valB));
  });

  // Dynamic Pagination Calculations
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize
  );

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
      
      {/* ─── Desktop Table Layout Frame ─── */}
      <Table.ScrollContainer minWidth={750} visibleFrom="sm">
        <Table variant="simple" layout="fixed" highlightOnHover withBorder>
          <Table.Thead>
            <Table.Tr>
              {renderTh('name', 'Name')}
              {renderTh('course', 'Course')}
              {renderTh('dishType', 'Dish Type')}
              {renderTh('estimatedCost', 'Cost')}
              {renderTh('isViewableByPublic', 'Visibility')}
              <Table.Th style={{ width: 80 }} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedData.map((recipe) => (
              <Table.Tr
                key={recipe.recipeId}
                style={{ cursor: 'pointer' }}
                onClick={() => recipe.recipeId && navigate(`/admin/recipe/${recipe.recipeId}`)}
              >
                <Table.Td><Text size="sm" truncate fw={500}>{recipe.name}</Text></Table.Td>
                <Table.Td><Text size="sm">{recipe.course}</Text></Table.Td>
                <Table.Td><Text size="sm">{recipe.dishType}</Text></Table.Td>
                <Table.Td><Text size="sm">${recipe.estimatedCost.toFixed(2)}</Text></Table.Td>
                <Table.Td>
                  <Badge color={recipe.isViewableByPublic ? 'green' : 'orange'} radius="none" variant="light">
                    {recipe.isViewableByPublic ? 'Public' : 'Private'}
                  </Badge>
                </Table.Td>
                <Table.Td onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="default"
                    size="xs"
                    radius="none"
                    onClick={() => recipe.recipeId && navigate(`/admin/recipe/${recipe.recipeId}`)}
                  >
                    Edit
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {/* ─── Mobile List Stack View Frame ─── */}
      <Stack gap="sm" hiddenFrom="sm">
        {paginatedData.map((recipe) => (
          <Card
            key={recipe.recipeId}
            withBorder
            padding="md"
            radius="none"
            style={{ cursor: 'pointer' }}
            onClick={() => recipe.recipeId && navigate(`/admin/recipe/${recipe.recipeId}`)}
          >
            <Text fw={600} size="md" c="dark.9" mb="xs">
              {recipe.name}
            </Text>
            <Stack gap={4}>
              <Text size="sm" c="gray.7"><strong>Course:</strong> {recipe.course}</Text>
              <Text size="sm" c="gray.7"><strong>Type:</strong> {recipe.dishType}</Text>
              <Text size="sm" c="gray.7"><strong>Cost:</strong> ${recipe.estimatedCost.toFixed(2)}</Text>
              <Group gap="xs">
                <Text size="sm" c="gray.7"><strong>Visibility:</strong></Text>
                <Badge color={recipe.isViewableByPublic ? 'green' : 'orange'} radius="none" size="xs" variant="light">
                  {recipe.isViewableByPublic ? 'Public' : 'Private'}
                </Badge>
              </Group>
            </Stack>
          </Card>
        ))}
      </Stack>

      {/* ─── Control Pagination Footer Grid Frame ─── */}
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
