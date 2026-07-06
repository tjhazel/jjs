import { AppShell, Text, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useNavigate, useLocation } from 'react-router'; // Grabbed from v8 core
import CategorySelector from '../article/CategorySelector';
import {AdminHeader} from './AdminHeader';

export function AdminLayout() {
   // Handles mobile toggle states out of the box
   //const [opened, { toggle }] = useDisclosure();
   const [opened] = useDisclosure();
   const navigate = useNavigate();
   const location = useLocation();

   return (
      <AppShell
         header={{ height: 60 }}
         navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
         padding="md"
      >
        
 <AppShell.Header style={{ backgroundColor: 'var(--mantine-color-dark-8)', borderBottom: '1px solid var(--mantine-color-dark-6)' }}>
         <AdminHeader />   
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
         <AppShell.Footer>
            <p>© 2006 - {new Date().getFullYear()} johnandjeri.com. All rights reserved.</p>
         </AppShell.Footer>
      </AppShell>
   );
}
