import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import {
  TextInput, Card, Title, Text, Stack,
  SimpleGrid, Grid, Switch, Group, Button, Box, NumberInput
} from '@mantine/core';
import { recipeSchema, DEFAULT_RECIPE } from '@api/recipe/recipeSchema';
import type { RecipeDetail, Ingredient, Instruction } from '@api/recipe/recipe';
import { formatDate } from '@lib/time.functions';
import MarkdownEditor from '@components/ui/form/MarkdownEditor';
import IngredientsEditor from './IngredientsEditor';
import InstructionsEditor from './InstructionsEditor';

interface RecipeEditorProps {
  recipe?: RecipeDetail | null;
  isSaving?: boolean;
  onSave: (data: RecipeDetail) => void;
  onCancel?: () => void;
}

export default function RecipeEditor({ recipe, isSaving = false, onSave, onCancel }: RecipeEditorProps) {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: DEFAULT_RECIPE,
    validate: zodResolver(recipeSchema),
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);

  useEffect(() => {
    if (recipe) {
      form.initialize({
        name: recipe.name ?? '',
        description: recipe.description ?? '',
        recipeSource: recipe.recipeSource ?? '',
        course: recipe.course ?? '',
        dishType: recipe.dishType ?? '',
        calories: recipe.calories ?? 0,
        fat: recipe.fat ?? 0,
        numberServed: recipe.numberServed ?? 2,
        prepTime: recipe.prepTime ?? '',
        cookTime: recipe.cookTime ?? '',
        estimatedCost: recipe.estimatedCost ?? 0,
        isViewableByPublic: recipe.isViewableByPublic ?? false,
        recipeCategoryIds: recipe.recipeCategoryIds ?? [],
      });
    }
    setIngredients(recipe?.ingredients ?? []);
    setInstructions(recipe?.instructions ?? []);
  }, [recipe]);

  const isNew = !recipe?.recipeId;

  const handleSubmit = (values: typeof DEFAULT_RECIPE) => {
    const payload: RecipeDetail = {
      // identity & system fields preserved from loaded recipe
      recipeId: recipe?.recipeId ?? 0,
      pictureFk: recipe?.pictureFk,
      viewCount: recipe?.viewCount ?? 0,
      createdDate: recipe?.createdDate,
      createdByFk: recipe?.createdByFk,
      createdBy: recipe?.createdBy,
      modifiedDate: recipe?.modifiedDate,
      modifiedByFk: recipe?.modifiedByFk,
      modifiedBy: recipe?.modifiedBy,
      recipeCategories: recipe?.recipeCategories ?? [],
      picture: recipe?.picture ?? null,
      // user-edited fields from form
      ...values,
      prepTime: values.prepTime ?? '',
      cookTime: values.cookTime ?? '',
      // managed lists — sequence assigned from array position
      ingredients: ingredients.map((ing, i) => ({ ...ing, sequence: i + 1 })),
      instructions: instructions.map((ins, i) => ({ ...ins, sequence: i + 1 })),
    };
    onSave(payload);
  };

  return (
    <Box component="form" onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack gap={{ base: 'xs', sm: 'xl' }}>

        {/* ─── Core Info ─── */}
        <Card withBorder padding={{ base: 'xs', sm: 'xl' }} radius="none">
          <Stack gap="md">
            <Title order={2} size="h4" fw={600}>Core Content</Title>
            <TextInput withAsterisk label="Recipe Name" radius="none"
              key={form.key('name')} {...form.getInputProps('name')} />
            <MarkdownEditor
              key={form.key('description')}
              withAsterisk
              label="Description"
              placeholder="Describe the recipe…"
              {...form.getInputProps('description')}
              minRows={5}
            />
            <TextInput label="Source / Reference" radius="none"
              key={form.key('recipeSource')} {...form.getInputProps('recipeSource')} />
          </Stack>
        </Card>

        {/* ─── Classifications ─── */}
        <Card withBorder padding={{ base: 'xs', sm: 'xl' }} radius="none">
          <Stack gap="md">
            <Title order={2} size="h4" fw={600}>Classifications</Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput withAsterisk label="Course" placeholder="e.g. Dinner" radius="none"
                key={form.key('course')} {...form.getInputProps('course')} />
              <TextInput withAsterisk label="Dish Type" placeholder="e.g. Pasta" radius="none"
                key={form.key('dishType')} {...form.getInputProps('dishType')} />
            </SimpleGrid>
          </Stack>
        </Card>

        {/* ─── Metrics ─── */}
        <Card withBorder padding={{ base: 'xs', sm: 'xl' }} radius="none">
          <Stack gap="md">
            <Title order={2} size="h4" fw={600}>Cooking Metrics & Cost</Title>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              <NumberInput label="Servings" min={1} radius="none"
                key={form.key('numberServed')} {...form.getInputProps('numberServed')} />
              <TextInput label="Prep Time" placeholder="e.g. 15 mins" radius="none"
                key={form.key('prepTime')} {...form.getInputProps('prepTime')} />
              <TextInput label="Cook Time" placeholder="e.g. 30 mins" radius="none"
                key={form.key('cookTime')} {...form.getInputProps('cookTime')} />
              <NumberInput label="Calories" min={0} radius="none"
                key={form.key('calories')} {...form.getInputProps('calories')} />
              <NumberInput label="Fat (grams)" min={0} radius="none"
                key={form.key('fat')} {...form.getInputProps('fat')} />
              <NumberInput label="Estimated Cost ($)" min={0} decimalScale={2} fixedDecimalScale radius="none"
                key={form.key('estimatedCost')} {...form.getInputProps('estimatedCost')} />
            </SimpleGrid>
          </Stack>
        </Card>

        {/* ─── Ingredients ─── */}
        <Card withBorder padding={{ base: 'xs', sm: 'xl' }} radius="none">
          <Stack gap="md">
            <Title order={2} size="h4" fw={600}>Ingredients</Title>
            <IngredientsEditor ingredients={ingredients} onChange={setIngredients} />
          </Stack>
        </Card>

        {/* ─── Instructions ─── */}
        <Card withBorder padding={{ base: 'xs', sm: 'xl' }} radius="none">
          <Stack gap="md">
            <Title order={2} size="h4" fw={600}>Instructions</Title>
            <InstructionsEditor instructions={instructions} onChange={setInstructions} />
          </Stack>
        </Card>

        {/* ─── Visibility ─── */}
        <Card withBorder padding={{ base: 'xs', sm: 'xl' }} radius="none">
          <Stack gap="md">
            <Title order={2} size="h4" fw={600}>Visibility Settings</Title>
            <Switch
              labelPosition="left"
              label={
                <Box>
                  <Text size="sm" fw={500}>Visible by Public</Text>
                  <Text size="xs" c="dimmed">Allow anonymous visitors to view this recipe</Text>
                </Box>
              }
              key={form.key('isViewableByPublic')}
              {...form.getInputProps('isViewableByPublic', { type: 'checkbox' })}
            />
          </Stack>
        </Card>

        {/* ─── Audit ─── */}
        {!isNew && (
          <Card withBorder padding={{ base: 'xs', sm: 'xl' }} radius="none" bg="var(--mantine-color-gray-0)">
            <Stack gap="md">
              <Title order={2} size="h4" fw={600}>Audit Overview</Title>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Created By</Text>
                  <Text size="sm" fw={500}>{recipe?.createdBy}</Text>
                  <Text size="xs" c="dimmed">{recipe?.createdDate ? formatDate(recipe.createdDate) : '—'}</Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Last Modified</Text>
                  <Text size="sm" fw={500}>{recipe?.modifiedBy}</Text>
                  <Text size="xs" c="dimmed">{recipe?.modifiedDate ? formatDate(recipe.modifiedDate) : '—'}</Text>
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>
        )}

        {/* ─── Submit ─── */}
        <Group justify="space-between" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
          <Group gap="md">
            <Button type="submit" color="dark" radius="none" loading={isSaving}>
              {isNew ? 'Create Recipe' : 'Save Changes'}
            </Button>
            {onCancel && (
              <Button type="button" variant="subtle" color="gray" radius="none" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </Group>
          {!isNew && <Text ff="monospace" size="xs" c="dimmed">ID: {recipe?.recipeId}</Text>}
        </Group>

      </Stack>
    </Box>
  );
}
