import { useNavigate } from "react-router"; // React Router v8 baseline
import { Container, SimpleGrid, Card, Text, Title, Button, Stack } from "@mantine/core";

export default function RecipeAdminPage() {
   const navigate = useNavigate();

   const placeholderCards = [
      {
         id: 1,
         title: "Posts",
         description: "Edit all posts",
         link: "/admin/post",
      }
   ];

   return (
      // Container replaces PageContainer and manages standard page widths
      <Container size="lg" py="xl">
         {/* Header Section */}
         <Stack gap="xs" mb="xl">
            <Title order={1} fw={700}>Administration</Title>
            <Text c="dimmed" size="sm">
               Manage your site content and settings.
            </Text>
         </Stack>

         {/* Grid Layout replacing Tailwind grid classes */}
         <SimpleGrid
            cols={{ base: 1, sm: 2, lg: 4 }}
            spacing="md"
         >
            {placeholderCards.map((card) => (
               <Card
                  key={card.id}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
               >
                  <div>
                     <Text fw={500} size="lg" mb="xs">
                        {card.title}
                     </Text>
                     <Text size="sm" c="dimmed" mb="md">
                        {card.description}
                     </Text>
                  </div>

                  {/* Action Footer Button mapping to programmatic router navigation */}
                  <Button
                     variant="light"
                     color="blue"
                     fullWidth
                     mt="md"
                     radius="md"
                     onClick={() => navigate(card.link)}
                  >
                     Manage more →
                  </Button>
               </Card>
            ))}
         </SimpleGrid>
      </Container>
   );
}
