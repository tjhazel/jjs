import { Container, Group, Title, Button } from '@mantine/core';
import { useNavigate } from 'react-router';
import { IconArrowLeft } from '@tabler/icons-react';

export function AdminHeader() {
  const navigate = useNavigate();

  return (
    <Container size="xl" h="100%">
      <Group justify="space-between" align="center" h="100%">
        <Group gap="md">
          <Title order={3} size="h3" fw={600} c="white">
            Site Control Panel
          </Title>
        </Group>
        
        <Button 
          variant="subtle" 
          color="gray.4" 
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/")}
        >
          Back to Main Site
        </Button>
      </Group>
    </Container>
  );
}
