import { useRef } from 'react';
import { Table, Autocomplete, Select, TextInput, ActionIcon, Group, Text, Button, Stack, Card } from '@mantine/core';
import { IconTrash, IconChevronUp, IconChevronDown, IconPlus } from '@tabler/icons-react';
import type { Ingredient } from '@api/recipe/recipe';
import { useIngredients, useUnitOfMeasures, createIngredient } from '@api/recipe/ingredient-fetcher';
import { useApiContext } from '@api/ApiContext';

interface Props {
  ingredients: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
}

export default function IngredientsEditor({ ingredients, onChange }: Props) {
  const { httpGet, httpPost } = useApiContext();
  const { data: allIngredients } = useIngredients(httpGet);
  const { data: allUoms } = useUnitOfMeasures(httpGet);
  const localId = useRef(-1);

  const ingredientOptions = allIngredients.map(x => x.name);

  const uomOptions = allUoms.map(x => ({
    value: x.unitOfMeasureId.toString(),
    label: x.name,
  }));

  const add = () => onChange([...ingredients, {
    ingredientsXrefId: localId.current--,
    ingredientFk: 0,
    unitOfMeasureFk: 0,
    amount: '',
    unitOfMeasure: '',
    ingredient: '',
    description: '',
    sequence: 0,
  }]);

  const set = (index: number, partial: Partial<Ingredient>) =>
    onChange(ingredients.map((ing, i) => i === index ? { ...ing, ...partial } : ing));

  const swap = (a: number, b: number) => {
    const next = [...ingredients];
    [next[a], next[b]] = [next[b], next[a]];
    onChange(next);
  };

  const remove = (index: number) => onChange(ingredients.filter((_, i) => i !== index));

  // Resolve ingredient FK on blur: match existing (case-insensitive) or create new.
  const handleIngredientBlur = async (index: number, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const match = allIngredients.find(x => x.name.toLowerCase() === trimmed.toLowerCase());
    if (match) {
      set(index, { ingredient: match.name, ingredientFk: match.ingredientId });
    } else {
      const newId = await createIngredient(httpPost, trimmed);
      set(index, { ingredientFk: newId });
    }
  };

  const handleUomChange = (index: number, uomId: string | null) => {
    if (!uomId) {
      set(index, { unitOfMeasureFk: 0, unitOfMeasure: '' });
      return;
    }
    const uom = allUoms.find(x => x.unitOfMeasureId.toString() === uomId);
    set(index, { unitOfMeasureFk: parseInt(uomId, 10), unitOfMeasure: uom?.name ?? '' });
  };

  const empty = ingredients.length === 0;
  const last = ingredients.length - 1;

  const actions = (i: number) => (
    <Group gap={2} wrap="nowrap" justify="center">
      <ActionIcon variant="subtle" color="gray" size="sm" disabled={i === 0} onClick={() => swap(i, i - 1)}>
        <IconChevronUp size={14} />
      </ActionIcon>
      <ActionIcon variant="subtle" color="gray" size="sm" disabled={i === last} onClick={() => swap(i, i + 1)}>
        <IconChevronDown size={14} />
      </ActionIcon>
      <ActionIcon variant="subtle" color="red" size="sm" onClick={() => remove(i)}>
        <IconTrash size={14} />
      </ActionIcon>
    </Group>
  );

  return (
    <Stack gap="sm">

      {/* ─── Desktop table ─── */}
      <Table.ScrollContainer minWidth={680} visibleFrom="sm">
        <Table variant="simple" withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={36}><Text size="xs" ta="center">#</Text></Table.Th>
              <Table.Th w={88}>Amount</Table.Th>
              <Table.Th w={140}>Unit</Table.Th>
              <Table.Th w={200}>Ingredient</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th w={90} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {empty && (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text size="sm" c="dimmed" ta="center" py="xs">No ingredients — click Add Ingredient to begin.</Text>
                </Table.Td>
              </Table.Tr>
            )}
            {ingredients.map((ing, i) => (
              <Table.Tr key={ing.ingredientsXrefId}>
                <Table.Td><Text size="sm" c="dimmed" ta="center">{i + 1}</Text></Table.Td>
                <Table.Td>
                  <TextInput size="xs" radius="none" value={ing.amount}
                    onChange={e => set(i, { amount: e.currentTarget.value })} />
                </Table.Td>
                <Table.Td>
                  <Select
                    size="xs"
                    radius="none"
                    searchable
                    clearable
                    data={uomOptions}
                    value={ing.unitOfMeasureFk > 0 ? ing.unitOfMeasureFk.toString() : null}
                    onChange={val => handleUomChange(i, val)}
                    comboboxProps={{ withinPortal: true }}
                  />
                </Table.Td>
                <Table.Td>
                  <Autocomplete
                    size="xs"
                    radius="none"
                    data={ingredientOptions}
                    value={ing.ingredient}
                    onChange={value => set(i, { ingredient: value })}
                    onBlur={() => handleIngredientBlur(i, ing.ingredient)}
                    comboboxProps={{ withinPortal: true }}
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput size="xs" radius="none" value={ing.description ?? ''}
                    onChange={e => set(i, { description: e.currentTarget.value })} />
                </Table.Td>
                <Table.Td>{actions(i)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {/* ─── Mobile cards ─── */}
      <Stack gap="xs" hiddenFrom="sm">
        {empty && <Text size="sm" c="dimmed" ta="center">No ingredients yet.</Text>}
        {ingredients.map((ing, i) => (
          <Card key={ing.ingredientsXrefId} withBorder padding="sm" radius="none">
            <Group justify="space-between" mb="xs">
              <Text size="xs" fw={700} c="dimmed">#{i + 1}</Text>
              {actions(i)}
            </Group>
            <Stack gap="xs">
              <Group grow gap="xs">
                <TextInput size="xs" label="Amount" radius="none" value={ing.amount}
                  onChange={e => set(i, { amount: e.currentTarget.value })} />
                <Select
                  size="xs"
                  label="Unit"
                  radius="none"
                  searchable
                  clearable
                  data={uomOptions}
                  value={ing.unitOfMeasureFk > 0 ? ing.unitOfMeasureFk.toString() : null}
                  onChange={val => handleUomChange(i, val)}
                  comboboxProps={{ withinPortal: true }}
                />
              </Group>
              <Autocomplete
                size="xs"
                label="Ingredient"
                radius="none"
                data={ingredientOptions}
                value={ing.ingredient}
                onChange={value => set(i, { ingredient: value })}
                onBlur={() => handleIngredientBlur(i, ing.ingredient)}
                comboboxProps={{ withinPortal: true }}
              />
              <TextInput size="xs" label="Description" radius="none" value={ing.description ?? ''}
                onChange={e => set(i, { description: e.currentTarget.value })} />
            </Stack>
          </Card>
        ))}
      </Stack>

      <Button size="xs" variant="default" radius="none" leftSection={<IconPlus size={14} />} onClick={add}>
        Add Ingredient
      </Button>

    </Stack>
  );
}
