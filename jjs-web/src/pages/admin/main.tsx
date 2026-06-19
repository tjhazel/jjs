import { Container, Stack, Title, Text, SimpleGrid } from '@mantine/core';
import ImageCard from '@components/ui/ImageCard'; // Adjust this path to where your ImageCard lives

export default function AdminPage() {
  const placeholderCards = [
    {
      id: 1,
      title: "Posts",
      description: "Edit all posts",
      link: "/admin/articles",
    },
     {
      id: 2,
      title: "Recipes",
      description: "Edit all recipes",
      link: "/admin/recipes",
    }
  ];

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        
        {/* Heading Block replacing PageContainer header logic */}
        <Stack gap={4}>
          <Title order={1} size="h1" fw={600} lh="sm" c="dark.9">
            Administration
          </Title>
          <Text size="sm" c="dimmed">
            Manage your site content and settings.
          </Text>
        </Stack>

        {/* Responsive Grid Matrix matching your 4-column layout intent */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          {placeholderCards.map((card) => (
            <ImageCard
              key={card.id}
              title={card.title}
              previewText={card.description}
              previewLines={2}
              link={card.link}
              footerText="Manage more →"
              /* 
                imageUrl is omitted here. ImageCard will adapt 
                automatically and render as a text-only card.
              */
            />
          ))}
        </SimpleGrid>

      </Stack>
    </Container>
  );
}
