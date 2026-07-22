import { ActionIcon, Burger, Container, Group, Title, Button, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { useNavigate } from 'react-router';
import { IconArrowLeft, IconSun, IconMoon } from '@tabler/icons-react';

interface AdminHeaderProps {
  navOpened: boolean;
  onNavToggle: () => void;
}

export function AdminHeader({ navOpened, onNavToggle }: AdminHeaderProps) {
  const navigate = useNavigate();
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme('light', { getInitialValueInEffect: true });

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
            John, Jeri, and Sidney
          </Title>
        </Group>

        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="gray.4"
            size="sm"
            onClick={() => setColorScheme(computed === 'light' ? 'dark' : 'light')}
            aria-label="Toggle color scheme"
          >
            {computed === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
          </ActionIcon>
          <Button
            variant="subtle"
            color="gray.4"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/")}
            style={{ flexShrink: 0 }}
          >
            Exit
          </Button>
        </Group>
      </Group>
    </Container>
  );
}
