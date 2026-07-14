import {
  Container, Title, Text, Stack, SimpleGrid, Card,
  Avatar, Group, Badge, Alert, Divider,
} from '@mantine/core';
import { IconMap } from '@tabler/icons-react';

interface Character {
  name: string;
  race: string;
  role: string;
  backstory: string;
  initials: string;
  avatarColor: string;
}

const CHARACTERS: Character[] = [
  {
    name: 'Frodo Baggins',
    race: 'Hobbit',
    role: 'Ring-bearer',
    initials: 'FB',
    avatarColor: 'green',
    backstory:
      'A quiet hobbit of the Shire who inherited the One Ring from his uncle Bilbo. Chosen by fate to carry it to the fires of Mount Doom, Frodo\'s journey pushes every limit of his courage and will as the Ring\'s corruption slowly tightens its grip.',
  },
  {
    name: 'Samwise Gamgee',
    race: 'Hobbit',
    role: 'Companion & Gardener',
    initials: 'SG',
    avatarColor: 'yellow',
    backstory:
      'Frodo\'s steadfast gardener and closest friend. Sam never sought adventure but refused to let Frodo face the darkness alone. His simple loyalty and indomitable spirit prove to be the true force that carries the quest to its end.',
  },
  {
    name: 'Gandalf',
    race: 'Maia (Wizard)',
    role: 'Guide & Istari',
    initials: 'G',
    avatarColor: 'gray',
    backstory:
      'One of five wizards sent to Middle-earth to aid its peoples against Sauron. Ancient, wise, and seemingly cryptic, Gandalf orchestrates events from the shadows before falling in Moria — only to return as Gandalf the White, more powerful than before.',
  },
  {
    name: 'Aragorn',
    race: 'Man',
    role: 'Heir of Isildur',
    initials: 'AR',
    avatarColor: 'blue',
    backstory:
      'A Ranger of the North who conceals his true identity as Isildur\'s heir and rightful King of Gondor. Long burdened by his ancestor\'s failure with the Ring, Aragorn must decide whether he is strong enough to claim his birthright and lead Men against Sauron.',
  },
  {
    name: 'Legolas',
    race: 'Elf',
    role: 'Prince of Mirkwood',
    initials: 'LE',
    avatarColor: 'teal',
    backstory:
      'Son of the Elvenking Thranduil of Mirkwood. Legolas brings his people\'s millennia of skill to the Fellowship — an almost supernatural archer whose keen elven senses repeatedly warn the company of danger before it strikes.',
  },
  {
    name: 'Gimli',
    race: 'Dwarf',
    role: 'Son of Glóin',
    initials: 'GI',
    avatarColor: 'orange',
    backstory:
      'A proud dwarf warrior whose father Glóin had travelled with Bilbo. Initially suspicious of elves and deeply wary of Moria\'s fate, Gimli\'s courage and fierce loyalty win him an unlikely bond with Legolas — a friendship unheard of between their peoples.',
  },
  {
    name: 'Boromir',
    race: 'Man',
    role: 'Captain of Gondor',
    initials: 'BO',
    avatarColor: 'red',
    backstory:
      'Son of Denethor, Steward of Gondor, and a warrior of legendary valor. Boromir joins the Fellowship hoping to bring the Ring\'s power back to Gondor\'s defence — a desire the Ring exploits until it leads to tragedy and, finally, a moment of hard-won redemption.',
  },
  {
    name: 'Meriadoc Brandybuck',
    race: 'Hobbit',
    role: 'Esquire of Rohan',
    initials: 'MB',
    avatarColor: 'lime',
    backstory:
      'The more levelheaded of the two younger hobbits, Merry has an appetite for maps, lore, and plans. Separated from the Fellowship, he ends up in Rohan where he rides to war alongside Éowyn and strikes the blow that helps bring down the Witch-king of Angmar.',
  },
  {
    name: 'Peregrin Took',
    race: 'Hobbit',
    role: 'Guard of the Citadel',
    initials: 'PT',
    avatarColor: 'grape',
    backstory:
      'The youngest and most impulsive of the hobbits, Pippin stumbles into danger with reckless enthusiasm. An accidental glance into the palantír brings him face to face with Sauron himself — and ultimately leads him to pledge service to the Steward of Gondor.',
  },
  {
    name: 'Gollum',
    race: 'Stoor Hobbit (corrupted)',
    role: 'Former Ring-bearer',
    initials: 'SM',
    avatarColor: 'dark',
    backstory:
      'Born Sméagol, a hobbit-like Stoor who murdered his cousin Déagol to possess the Ring he found in the River Anduin. Six centuries of the Ring\'s influence twisted him into the wretched creature who guides Frodo to Mordor — pulled between his obsession and a faint echo of his former self.',
  },
  {
    name: 'Arwen Undómiel',
    race: 'Half-elven',
    role: 'Princess of Rivendell',
    initials: 'AU',
    avatarColor: 'violet',
    backstory:
      'Daughter of Elrond and bearer of the title Evenstar of her people. Arwen forsakes her immortality to remain in Middle-earth with Aragorn — a choice that binds her fate irreversibly to the outcome of the War of the Ring.',
  },
  {
    name: 'Galadriel',
    race: 'Elf (Noldor)',
    role: 'Lady of Lothlórien',
    initials: 'GL',
    avatarColor: 'cyan',
    backstory:
      'One of the oldest and most powerful Elves remaining in Middle-earth, who has resisted Sauron since the First Age. She bears Nenya, one of the three Elven Rings, and tests each member of the Fellowship — including herself — against the temptation of the One Ring.',
  },
  {
    name: 'Saruman',
    race: 'Maia (Wizard)',
    role: 'Corrupted White Wizard',
    initials: 'SA',
    avatarColor: 'pink',
    backstory:
      'Once the greatest of the Istari and head of the White Council. Long obsessed with the Ring\'s lore, Saruman\'s search for power led him to secretly serve his own ambition. From Isengard he breeds an army of Uruk-hai and schemes to claim the Ring for himself.',
  },
];

export default function PlaceholderPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Stack gap="xs">
          <Group gap="sm" align="center">
            <IconMap size={32} stroke={1.5} />
            <Title order={1}>LOTR Character Map</Title>
          </Group>
          <Text c="dimmed">
            An interactive map of the relationships, allegiances, and journeys of Middle-earth's key characters — coming soon.
          </Text>
        </Stack>

        <Alert
          icon={<IconMap size={18} />}
          title="In progress"
          color="blue"
          variant="light"
          radius="sm"
        >
          This page will become an interactive relationship map showing how the characters of The Lord of the Rings
          connect to one another — by fellowship, blood, race, allegiance, and conflict. For now, meet the cast.
        </Alert>

        <Divider />

        <Stack gap="xs">
          <Title order={2} size="h3">The Cast</Title>
          <Text size="sm" c="dimmed">
            {CHARACTERS.length} major characters across the Fellowship, Rohan, Gondor, and beyond.
          </Text>
        </Stack>

        <Text size="xs" c="dimmed" fs="italic">
          The Lord of the Rings characters and Middle-earth are the intellectual property of the Tolkien Estate and Middle-earth Enterprises.
          Character descriptions on this page are original fan summaries written for personal, non-commercial reference only and are not derived from or quoting the original text.
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {CHARACTERS.map(char => (
            <Card key={char.name} withBorder padding="lg" radius="md" shadow="sm">
              <Stack gap="sm">
                <Group gap="md" align="flex-start" wrap="nowrap">
                  <Avatar
                    size={56}
                    radius="xl"
                    color={char.avatarColor}
                    variant="filled"
                    style={{ flexShrink: 0 }}
                  >
                    {char.initials}
                  </Avatar>
                  <Stack gap={4} style={{ minWidth: 0 }}>
                    <Text fw={600} size="md" style={{ lineHeight: 1.2 }}>{char.name}</Text>
                    <Group gap={4} wrap="wrap">
                      <Badge size="xs" variant="light" color="gray" radius="sm">{char.race}</Badge>
                      <Badge size="xs" variant="light" color="blue" radius="sm">{char.role}</Badge>
                    </Group>
                  </Stack>
                </Group>
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
                  {char.backstory}
                </Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
