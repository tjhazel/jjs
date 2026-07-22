import { useNavigate, useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { 
  Container, Button, Title, Text, Group, Divider, 
  Center, Loader, Stack, SimpleGrid, Badge, Box, Image 
} from '@mantine/core';
import { IconArrowLeft, IconPrinter } from '@tabler/icons-react';
import { useSingleRecipe } from '@api/recipe/recipe-fetcher';
import { useApiContext } from '@api/ApiContext';
import { formatDate } from '../../lib/time.functions';
import classes from './RecipeView.module.css'; // 👉 IMPORT PRINT STYLES

export const recipeLoader = async ({ params }: LoaderFunctionArgs) => {
  const idStr = params.id;
  if (!idStr) throw new Response("Missing Recipe Identifier", { status: 400 });

  const parsedId = parseInt(idStr, 10);
  if (isNaN(parsedId)) throw new Response("Invalid Identification Format", { status: 400 });

  return { id: parsedId };
};

export default function RecipeView() {
  const navigate = useNavigate();
  const { httpGet } = useApiContext();
  const { id } = useLoaderData() as { id: number };
  const { data: recipe, isLoading } = useSingleRecipe(httpGet, id);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <Center py={64}>
        <Group gap="sm"><Loader size="sm" type="dots" /><Text c="dimmed">Loading recipe...</Text></Group>
      </Center>
    );
  }

  if (!recipe) {
    return (
      <Center py={64}>
        <Stack align="center" gap="md">
          <Text size="lg" c="dimmed">Recipe not found.</Text>
          <Button onClick={() => navigate(-1)} color="dark" radius="none">Go Back</Button>
        </Stack>
      </Center>
    );
  }

  const recipePicture = recipe.picture?.contentBase64 
    ? `data:image/jpeg;base64,${recipe.picture?.contentBase64}` 
    : undefined;

  return (
    /* 👉 Added container styling class hook */
    <Container size="md" py="xl" className={classes.recipeContainer}>
      <Stack gap="xl">
        
        {/* 👉 Added actionHeader visibility print hook wrapper */}
        <Group gap="sm" pb="md" className={classes.actionHeader} style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
          <Button onClick={() => navigate(-1)} variant="default" radius="none" leftSection={<IconArrowLeft size={16} />}>
            Back
          </Button>
          <Button onClick={handlePrint} color="dark" radius="none" leftSection={<IconPrinter size={16} />}>
            Print
          </Button>
        </Group>

        <Stack gap={4}>
          <Title order={1} size="h1" fw={600} lh="sm">{recipe.name}</Title>
          {recipe.recipeSource && (
            <Text size="sm" c="dimmed"><strong>Source:</strong> {recipe.recipeSource}</Text>
          )}
        </Stack>

        {recipePicture && (
          <Box style={{ overflow: 'hidden', backgroundColor: 'var(--mantine-color-gray-1)' }}>
            <Image src={recipePicture} alt="Recipe Graphic" h={{ base: 200, sm: 400 }} fit="cover" radius="none" />
          </Box>
        )}

        {recipe.description && (
          <Stack gap="xs">
            <Title order={2} size="h3" fw={600}>Description</Title>
            <Text size="sm" style={{ lineHeight: 1.6 }}>{recipe.description}</Text>
          </Stack>
        )}

        {/* 👉 Added printGrid fallback support class */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={32} className={classes.printGrid}>
          <Stack gap="md">
            <Title order={3} size="h4" fw={600}>Recipe Details</Title>
            <Stack gap={10} style={{ fontSize: 'var(--mantine-font-size-sm)' }}>
              <Group justify="space-between"><Text size="sm" fw={500}>Course:</Text><Text size="sm">{recipe.course}</Text></Group>
              <Group justify="space-between"><Text size="sm" fw={500}>Dish Type:</Text><Text size="sm">{recipe.dishType}</Text></Group>
              <Group justify="space-between"><Text size="sm" fw={500}>Servings:</Text><Text size="sm">{recipe.numberServed}</Text></Group>
              <Group justify="space-between"><Text size="sm" fw={500}>Prep Time:</Text><Text size="sm">{recipe.prepTime || "N/A"}</Text></Group>
              <Group justify="space-between"><Text size="sm" fw={500}>Cook Time:</Text><Text size="sm">{recipe.cookTime || "N/A"}</Text></Group>
              <Group justify="space-between"><Text size="sm" fw={500}>Cost:</Text><Text size="sm">{recipe.estimatedCost != null ? `$${recipe.estimatedCost.toFixed(2)}` : 'N/A'}</Text></Group>
              <Group justify="space-between"><Text size="sm" fw={500}>Calories:</Text><Text size="sm">{recipe.calories || "N/A"}</Text></Group>
              <Group justify="space-between"><Text size="sm" fw={500}>Fat:</Text><Text size="sm">{recipe.fat || "N/A"}g</Text></Group>
              <Divider my={4} />
              <Group justify="space-between"><Text size="sm" fw={500}>Created:</Text><Text size="sm">{formatDate(recipe.createdDate)}</Text></Group>
              <Group justify="space-between"><Text size="sm" fw={500}>Modified:</Text><Text size="sm">{formatDate(recipe.modifiedDate)}</Text></Group>
            </Stack>
          </Stack>

          <Stack gap="md">
            <Title order={3} size="h4" fw={600}>Categories</Title>
            {recipe.recipeCategories && recipe.recipeCategories.length > 0 ? (
              <Group gap="xs">
                {recipe.recipeCategories.map((category, index) => (
                  <Badge key={index} variant="outline" color="gray" radius="none" size="md" styles={{ label: { textTransform: 'none', fontWeight: 500 } }}>
                    {category}
                  </Badge>
                ))}
              </Group>
            ) : (
              <Text size="sm" c="dimmed" fs="italic">No categories</Text>
            )}
          </Stack>
        </SimpleGrid>

        {/* 👉 Added printGrid fallback support class */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={32} className={classes.printGrid}>
          <Stack gap="md">
            <Title order={3} size="h4" fw={600}>Ingredients</Title>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <Stack gap="sm">
                {recipe.ingredients.map((ingredient, index) => (
                  /* 👉 Added listItem class break optimization hook */
                  <Box key={index} pb="xs" className={classes.listItem} style={{ borderBottom: '1px solid var(--mantine-color-gray-1)' }}>
                    <Group align="flex-start" wrap="nowrap">
                      <Text size="sm" fw={600} style={{ minWidth: 90 }}>{ingredient.amount} {ingredient.unitOfMeasure}</Text>
                      <Box style={{ flex: 1 }}>
                        <Text size="sm" fw={500}>{ingredient.ingredient}</Text>
                        {ingredient.description && <Text size="xs" c="dimmed" mt={2}>{ingredient.description}</Text>}
                      </Box>
                    </Group>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed" fs="italic">No ingredients available</Text>
            )}
          </Stack>

          <Stack gap="md">
            <Title order={3} size="h4" fw={600}>Instructions</Title>
            {recipe.instructions && recipe.instructions.length > 0 ? (
              <Stack gap="md">
                {recipe.instructions.map((instruction, index) => (
                  /* 👉 Added listItem class break optimization hook */
                  <Group key={index} align="flex-start" wrap="nowrap" gap="sm" className={classes.listItem}>
                    <Text size="sm" fw={700} style={{ minWidth: 20 }}>{index + 1}.</Text>
                    <Box style={{ flex: 1 }}>
                      <Text size="sm" fw={600} mb={2}>{instruction.name}</Text>
                      <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>{instruction.instruction}</Text>
                    </Box>
                  </Group>
                ))}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed" fs="italic">No instructions available</Text>
            )}
          </Stack>
        </SimpleGrid>

        {/* 👉 Added footerImage target hide class parameter */}
        <Image
          src="http://johnandjeri.com"
          alt="Recipe Footer decoration"
          fit="contain"
          w="auto"
          mx="auto"
          mt="xl"
          pt="xl"
          className={classes.footerImage}
          style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}
        />

      </Stack>
    </Container>
  );
}
