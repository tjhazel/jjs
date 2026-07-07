import { Container } from '@mantine/core';
import { Outlet } from 'react-router';

export function AdminPageLayout() {
  return (
    <Container size="xl" py="sm" px={0}>
      <Outlet />
    </Container>
  );
}
