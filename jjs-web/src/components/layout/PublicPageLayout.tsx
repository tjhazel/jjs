import { Container } from '@mantine/core';
import { Outlet } from 'react-router';

export function PublicPageLayout() {
  return (
    <Container size="xl" py="md" px={{ base: 'md', sm: 'xl' }}>
      <Outlet />
    </Container>
  );
}
