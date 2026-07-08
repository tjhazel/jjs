import { AppShell, Group, Text, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useNavigate, useLocation } from 'react-router';
import CategorySelector from '../post/CategorySelector';
import {AdminHeader} from './AdminHeader';
import classes from './AdminLayout.module.css';

export function AdminLayout() {
   const [opened, { toggle, close }] = useDisclosure();
   const navigate = useNavigate();
   const location = useLocation();

   const navTo = (path: string) => { navigate(path); close(); };

   return (
      <AppShell
         header={{ height: 44 }}
         navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
         footer={{ height: { base: 0, sm: 44 } }}
         padding="xs">
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
               onClick={() => navTo("/admin")}
            />
            <NavLink
               label="Post Administration"
               active={location.pathname.includes("/admin/post")}
               onClick={() => navTo("/admin/posts")}
            />
            <NavLink
               label="Recipe Administration"
               active={location.pathname.includes("/admin/recipe")}
               onClick={() => navTo("/admin/recipes")}
            />
            <hr />
            <CategorySelector selectedCategory={null} onCategoryChange={() => { }} />

         </AppShell.Navbar>
         <AppShell.Main className={classes.main} >
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
