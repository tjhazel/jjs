import { Burger, Container, Group, Title, Button } from '@mantine/core';
import { useNavigate } from 'react-router';
import { IconArrowLeft } from '@tabler/icons-react';

interface AdminHeaderProps {
  navOpened: boolean;
  onNavToggle: () => void;
}

export function AdminHeader({ navOpened, onNavToggle }: AdminHeaderProps) {
  const navigate = useNavigate();

  return (
    <Container size="xl" h="100%">
      <Group justify="space-between" align="center" h="100%" wrap="nowrap">
        <Group gap="md" wrap="nowrap">
          <Burger
            opened={navOpened}
            onClick={onNavToggle}
            hiddenFrom="sm"
            size="sm"
            color="white"
            aria-label="Toggle navigation"
          />
          <Title order={3} size="h3" fw={600} c="white" visibleFrom="sm">
            Control Panel
          </Title>
        </Group>

        <Button
          variant="subtle"
          color="gray.4"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/")}
          style={{ flexShrink: 0 }}
        >
          Back
        </Button>
      </Group>
    </Container>
  );
}
