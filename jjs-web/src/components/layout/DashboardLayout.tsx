import { AppShell, Container, Group, Text } from '@mantine/core';
import { Outlet } from 'react-router';
import { HeaderMenu } from './HeaderMenu';

export function DashboardLayout() {
  return (
    <AppShell 
      header={{ height: 60 }} 
      padding={0}
      /* 👉 Removed navbar configuration to eliminate the 250px dead structural offset space */
    >
      {/* ─── Header View Frame ─── */}
      <AppShell.Header>
        {/* 
          If HeaderMenu doesn't have an internal layout container, 
          you can wrap it in a <Container size="xl"> here to match the body symmetry.
        */}
        <HeaderMenu />
      </AppShell.Header>

      {/* ─── Centered Responsive Content View Frame ─── */}
      <AppShell.Main style={{ paddingTop: 60 }}>
        {/* 
          🔴 CRITICAL CORE NODE: React Router injects <DashboardPage /> right here.
          Because DashboardPage uses <Container size="xl">, it will automatically 
          center itself symmetrically on all desktop, tablet, and phone screens.
        */}
        <Outlet />
      </AppShell.Main>

      {/* ─── Balanced Footer Frame ─── */}
      <AppShell.Footer 
        pos="static" 
        mt="xl" 
        style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}
      >
        {/* 👉 Wrapped in a matching container size="xl" to lock symmetrical alignment with your main articles */}
        <Container size="xl" py="md">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              © 2006 - {new Date().getFullYear()} johnandjeri.com. All rights reserved.
            </Text>
          </Group>
        </Container>
      </AppShell.Footer>
    </AppShell>
  );
}
