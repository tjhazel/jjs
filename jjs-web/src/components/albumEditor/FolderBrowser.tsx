import { Stack, Group, Text, Anchor, Box, Divider, Center, Loader, UnstyledButton, Badge } from '@mantine/core';
import { IconFolder, IconChevronRight } from '@tabler/icons-react';
import { IMAGE_PREFIX } from '@api/album/album-models';
import { useAlbumEditorContext } from './AlbumEditorContext';
import NewFolderForm from './NewFolderForm';

export default function FolderBrowser() {
  const ctx = useAlbumEditorContext();

  const {
    isLoading,
    albumError,
    currentFolder,
    crumbs,
    setCurrentPath,
    displayTarget,
  } = ctx;

  return (
    <Stack gap="sm" h="100%">

      <Text fw={600} size="sm">Upload Destination</Text>

      {/* Breadcrumb */}
      <Group gap={4} wrap="nowrap" style={{ overflowX: 'auto' }}>
        <Anchor
          component="button"
          type="button"
          size="sm"
          onClick={() => setCurrentPath(undefined)}
        >
          Album
        </Anchor>
        {crumbs.map((seg, i) => {
          const path = IMAGE_PREFIX + '/' + crumbs.slice(0, i + 1).join('/');
          const isLast = i === crumbs.length - 1;
          return (
            <Group gap={4} key={i} wrap="nowrap">
              <Text size="sm" c="dimmed">/</Text>
              {isLast
                ? <Text size="sm" fw={500}>{seg}</Text>
                : (
                  <Anchor
                    component="button"
                    type="button"
                    size="sm"
                    onClick={() => setCurrentPath(path)}
                  >
                    {seg}
                  </Anchor>
                )}
            </Group>
          );
        })}
      </Group>

      {/* Current target callout */}
      <Box
        px="sm" py={6}
        style={{
          background: 'var(--mantine-color-blue-0)',
          borderRadius: 4,
          border: '1px solid var(--mantine-color-blue-2)',
        }}
      >
        <Text size="xs" c="blue.7">
          <strong>Uploading to:</strong> {displayTarget}
        </Text>
      </Box>

      <Divider label="Subfolders" labelPosition="left" />

      {/* Folder list */}
      {isLoading && <Center py="md"><Loader size="sm" type="dots" /></Center>}
      {albumError && <Text size="xs" c="red">{albumError}</Text>}

      {!isLoading && !albumError && (
        <Stack gap={2}>
          {(currentFolder?.folders ?? []).length === 0
            ? <Text size="xs" c="dimmed" ta="center" py="xs">No subfolders here</Text>
            : (currentFolder?.folders ?? []).map((folder, i) => (
              <UnstyledButton
                key={i}
                onClick={() => setCurrentPath(folder.relativePath)}
                style={{
                  padding: '6px 8px',
                  borderRadius: 4,
                  width: '100%',
                }}
                styles={{
                  root: {
                    '&:hover': { background: 'var(--mantine-color-gray-0)' },
                  },
                }}
              >
                <Group gap={"xs"} justify="space-between" wrap="nowrap">
                  <Group gap={"xs"} wrap="nowrap" style={{ overflow: 'hidden' }}>
                    <IconFolder size={14} color="var(--mantine-color-yellow-6)" style={{ flexShrink: 0 }} />
                    <Text size="sm" truncate>{folder.name}</Text>
                  </Group>
                  <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                    {(folder.files?.length ?? 0) > 0 && (
                      <Badge size="xs" variant="light" color="gray">
                        {folder.files!.length}
                      </Badge>
                    )}
                    <IconChevronRight size={12} color="var(--mantine-color-gray-5)" />
                  </Group>
                </Group>
              </UnstyledButton>
            ))
          }
        </Stack>
      )}

      <div style={{ flexGrow: 1 }} />

      <Divider label="New Folder" labelPosition="left" />
      <NewFolderForm />

    </Stack>
  );
}
