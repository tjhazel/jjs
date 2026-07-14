import { Container, Title, Text, SimpleGrid, Card, Stack, Group } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { Link } from 'react-router';
import type { UserRole } from '@/api/user/user';
import { useAuth } from '@/lib/auth/authContext';
import { ROLE_ADMIN, ROLE_CIRCLE_OF_TRUST } from '@/lib/auth/roles';

type LinkBehavior =
  | 'router'       // React Router <Link> — stays in SPA
  | 'browser-new'  // plain <a> opening in a new tab
  | 'browser-same' // plain <a> opening in same tab (for server-served files)

interface ThingItem {
  title: string;
  description: React.ReactNode;
  icon: string;
  link: string;
  linkBehavior: LinkBehavior;
  requiredRoles?: UserRole[];
}

const mapLink = (
  <span
    role="link"
    tabIndex={0}
    onClick={e => {
      e.stopPropagation();
      window.open('https://www.globe.gov/globe-community/community-map', '_blank', 'noopener,noreferrer');
    }}
    onKeyDown={e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.stopPropagation();
        window.open('https://www.globe.gov/globe-community/community-map', '_blank', 'noopener,noreferrer');
      }
    }}
    style={{ color: 'var(--mantine-color-blue-6)', textDecoration: 'underline', cursor: 'pointer' }}
  >
    community map
  </span>
);

const THINGS: ThingItem[] = [
  {
    title: 'Wordle Hints',
    description: 'Find matching Wordle words by entering your guesses and marking letter states.',
    icon: '🟩',
    link: '/things/wordlehints',
    linkBehavior: 'router',
  },
  {
    title: 'Original Wordle Hints',
    description: 'The original Wordle hints tool on GitHub Pages.',
    icon: '🔗',
    link: 'https://tjhazel.github.io/wordlehints/',
    linkBehavior: 'browser-new',
  },
  {
    title: 'Globle',
    description: <>Guess the mystery country each day. Use the {mapLink} to help plan your guesses.</>,
    icon: '🌍',
    link: 'https://globle-game.com',
    linkBehavior: 'browser-new',
  },
  {
    title: 'LOTR Character Map',
    description: 'An interactive relationship map of Middle-earth\'s key characters — coming soon. Browse the cast in the meantime.',
    icon: '🗺️',
    link: '/things/placeholder',
    linkBehavior: 'router',
  },
  {
    title: 'Wedding',
    description: 'Wedding arrangements and information.',
    icon: '💍',
    link: '/things/wedding',
    linkBehavior: 'router',
    requiredRoles: [ROLE_CIRCLE_OF_TRUST, ROLE_ADMIN],
  },
];

export default function ThingsPage() {
  const { hasRole, isLoading } = useAuth();

  const visibleThings = THINGS.filter(item =>
    !item.requiredRoles || (!isLoading && hasRole(item.requiredRoles))
  );

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1}>Things</Title>
          <Text c="dimmed">A collection of tools and resources.</Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {visibleThings.map(item => {
            const cardStyle = { textDecoration: 'none', cursor: 'pointer' } as const;
            const sharedProps = { key: item.title, withBorder: true, padding: 'lg' as const, radius: 'md' as const, shadow: 'sm' as const, style: cardStyle };

            if (item.linkBehavior === 'browser-new') {
              return (
                <Card {...sharedProps} component="a" href={item.link} target="_blank" rel="noopener noreferrer">
                  <CardBody item={item} />
                </Card>
              );
            }
            if (item.linkBehavior === 'browser-same') {
              return (
                <Card {...sharedProps} component="a" href={item.link}>
                  <CardBody item={item} />
                </Card>
              );
            }
            return (
              <Card {...sharedProps} component={Link} to={item.link}>
                <CardBody item={item} />
              </Card>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

function CardBody({ item }: { item: ThingItem }) {
  return (
    <Stack gap="sm">
      <Text size="xl">{item.icon}</Text>
      <Group gap="xs" align="center">
        <Text fw={600} size="lg">{item.title}</Text>
        {item.linkBehavior !== 'router' && <IconExternalLink size={16} color="gray" />}
      </Group>
      <Text size="sm" c="dimmed">{item.description}</Text>
    </Stack>
  );
}
