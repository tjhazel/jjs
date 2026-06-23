import { IconChevronDown } from '@tabler/icons-react';
import {
   Burger,
   Center,
   Collapse,
   Container,
   Divider,
   Drawer,
   Group,
   Image,
   Menu,
   ScrollArea,
   UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from 'react-router'; // 🔴 React Router v8 Link component
import classes from './HeaderMenu.module.css';

const links = [
   { link: '/', label: 'Home' },
   { link: '/album', label: 'Album' },
   { link: '/recipe', label: 'Recipe' },
   {
      link: '/things',
      label: 'Things',
      links: [
         { link: 'https://tjhazel.github.io/wordlehints/', label: 'Original Wordle Hints' },
         { link: '/things/wordlehints/', label: 'Ported Wordle Hints' },
         { link: '/#', label: 'Placeholder' },
         { link: '/wedding/arrangements/default.htm', label: 'Wedding' },
      ],
   },
   { link: '/about', label: 'About' },
   {
      link: '#2',
      label: 'Admin',
      links: [
         { link: '/login', label: 'Login' },
         { link: '/admin/recipe', label: 'Recipe Management' },
         { link: '/admin/articles', label: 'Article Management' },
      ],
   },
];

export function HeaderMenu() {
   const [opened, { toggle, close }] = useDisclosure(false);

   // Helper utility to render either an external standard anchor tag or a native router link
   const renderLink = (to: string, label: string, className: string, onClickCb?: () => void) => {
      const isExternal = to.startsWith('http://') || to.startsWith('https://');

      if (isExternal) {
         return (
            <a key={to} href={to} className={className} target="_blank" rel="noopener noreferrer" onClick={onClickCb}>
               {label}
            </a>
         );
      }

      return (
         <Link key={to} to={to} className={className} onClick={onClickCb}>
            {label}
         </Link>
      );
   };

   const items = links.map((link) => {
      const menuItems = link.links?.map((item) => {
         const isExternal = item.link.startsWith('http');

         if (isExternal) {
            return (
            <Menu.Item
               key={item.link}
               component="a"
               href={item.link}
               target="_blank"
               rel="noopener noreferrer"
            >
               {renderLink(item.link, item.label, classes.dropdownLink, close)}
            </Menu.Item>
            );
         }

         return (
            <Menu.Item
            key={item.link}
            component={Link}
            to={item.link}
            >
            {renderLink(item.link, item.label, classes.dropdownLink, close)}
            </Menu.Item>
         );
      });

      if (menuItems) {
         return (
            <Menu key={link.label} trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
            <Menu.Target>
               <a href={link.link} className={classes.link} onClick={(e) => e.preventDefault()}>
                  <Center>
                  <span className={classes.linkLabel}>{link.label}</span>
                  <IconChevronDown size={14} stroke={1.5} />
                  </Center>
               </a>
            </Menu.Target>
            <Menu.Dropdown>{menuItems}</Menu.Dropdown>
            </Menu>
         );
      }

      return renderLink(link.link, link.label, classes.link);
      });


   return (
       <header className={classes.header}>
    {/* 👉 FIXED: Changed size from "md" to "xl" to match your dashboard page widths */}
    <Container size="xl" h="100%">
      <div className={classes.inner}>
        <Image h={30} w="auto" fit="contain" alt="Logo" src="/images/logopig-sm.png" />
        <Group gap={5} visibleFrom="sm">
          {items}
        </Group>
        <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" aria-label="Toggle navigation" />
      </div>
    </Container>

    {/* Mobile Drawer Layout */}
    <Drawer opened={opened} onClose={close} size="100%" padding="md" title="Navigation" hiddenFrom="sm" zIndex={1000000}>
      <ScrollArea h="calc(100vh - 80px)" mx="-md">
        <Divider my="sm" />
        {links.map((link) => {
          if (link.links) {
            return <DrawerLinksGroup key={link.label} link={link} onLinkClick={close} renderLinkHelper={renderLink} />;
          }
          return renderLink(link.link, link.label, classes.link, close);
        })}
      </ScrollArea>
    </Drawer>
  </header>
   );
}

// ─── Refactored Mobile Submenu Drawer ───────────────────────────────────
function DrawerLinksGroup({
   link,
   onLinkClick,
   renderLinkHelper,
}: {
   link: { link: string; label: string; links?: { link: string; label: string }[] };
   onLinkClick: () => void;
   renderLinkHelper: (to: string, label: string, className: string, onClickCb?: () => void) => React.ReactNode;
}) {
   const [opened, { toggle }] = useDisclosure(false);
   return (
      <>
         <UnstyledButton className={classes.link} onClick={toggle} style={{ width: '100%' }}>
            <Group justify="space-between" gap={0}>
               <span className={classes.linkLabel}>{link.label}</span>
               <IconChevronDown size={14} stroke={1.5} style={{ transform: opened ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }} />
            </Group>
         </UnstyledButton>
         <Collapse expanded={opened}>
            {link.links?.map((subLink) => renderLinkHelper(subLink.link, subLink.label, classes.subLink, onLinkClick))}
         </Collapse>
      </>
   );
}
