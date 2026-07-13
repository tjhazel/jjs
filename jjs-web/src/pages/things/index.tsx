import { Container, Title, Text, SimpleGrid, Card, Stack, Group } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { Link } from 'react-router';

interface ThingItem {
  title: string;
  description: React.ReactNode;
  icon: string;
  link: string;
  external: boolean;
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
    external: false,
  },
  {
    title: 'Original Wordle Hints',
    description: 'The original Wordle hints tool on GitHub Pages.',
    icon: '🔗',
    link: 'https://tjhazel.github.io/wordlehints/',
    external: true,
  },
  {
    title: 'Globle',
    description: <>Guess the mystery country each day. Use the {mapLink} to help plan your guesses.</>,
    icon: '🌍',
    link: 'https://globle-game.com',
    external: true,
  },
  {
    title: 'Wedding',
    description: 'Wedding arrangements and information.',
    icon: '💍',
    link: '/wedding/arrangements/default.htm',
    external: false,
  },
];

export default function ThingsPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1}>Things</Title>
          <Text c="dimmed">A collection of tools and resources.</Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {THINGS.map(item =>
            item.external ? (
              <Card
                key={item.title}
                withBorder
                padding="lg"
                radius="md"
                shadow="sm"
                component="a"
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', cursor: 'pointer' }}
              >
                <CardBody item={item} />
              </Card>
            ) : (
              <Card
                key={item.title}
                withBorder
                padding="lg"
                radius="md"
                shadow="sm"
                component={Link}
                to={item.link}
                style={{ textDecoration: 'none', cursor: 'pointer' }}
              >
                <CardBody item={item} />
              </Card>
            )
          )}
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
        {item.external && <IconExternalLink size={16} color="gray" />}
      </Group>
      <Text size="sm" c="dimmed">{item.description}</Text>
    </Stack>
  );
}
