import { AppShell, Group, Text, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useNavigate, useLocation } from 'react-router';
import CategorySelector from '../article/CategorySelector';
import {AdminHeader} from './AdminHeader';

export function AdminLayout() {
   const [opened, { toggle }] = useDisclosure();
   const navigate = useNavigate();
   const location = useLocation();

   return (
      <AppShell
         header={{ height: 60 }}
         navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
         footer={{ height: 44 }}
         padding="md"
      >

         <AppShell.Header style={{ backgroundColor: 'var(--mantine-color-dark-8)', borderBottom: '1px solid var(--mantine-color-dark-6)' }}>
            <AdminHeader navOpened={opened} onNavToggle={toggle} />
         </AppShell.Header>
         <AppShell.Navbar p="md">
            <Text size="xs" fw={700} c="dimmed" mb="sm" tt="uppercase">
               Control Panel
            </Text>
            <NavLink
               label="Admin Dashboard"
               active={location.pathname === "/admin"}
               onClick={() => navigate("/admin")}
            />
            <NavLink
               label="Article Administration"
               active={location.pathname.includes("/admin/article")}
               onClick={() => navigate("/admin/articles")}
            />
            <NavLink
               label="Recipe Administration"
               active={location.pathname.includes("/admin/recipe")}
               onClick={() => navigate("/admin/recipes")}
            />
            <hr />
            <CategorySelector selectedCategory={null} onCategoryChange={() => { }} />

         </AppShell.Navbar>
         <AppShell.Main>
            <Outlet />
         </AppShell.Main>
         <AppShell.Footer visibleFrom="sm">
            <Group h={44} px="md" align="center">
               <Text size="sm" c="dimmed">© 2006 - {new Date().getFullYear()} johnandjeri.com. All rights reserved.</Text>
            </Group>
         </AppShell.Footer>
      </AppShell>
   );
}
