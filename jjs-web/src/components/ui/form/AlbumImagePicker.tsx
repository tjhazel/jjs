import { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Modal, Box, Group, Text, Anchor, SimpleGrid, Image,
  Loader, Center, Stack,
} from '@mantine/core';
import { useApiContext } from '@api/ApiContext';
import { useAlbum } from '@api/album/album-fetcher';
import { IMAGE_PREFIX, type File as AlbumFile, type Folder } from '@api/album/album-models';

export interface AlbumImagePickerHandle {
  open: () => void;
}

interface AlbumImagePickerProps {
  onSelect: (httpPath: string, name: string) => void;
}

const AlbumImagePicker = forwardRef<AlbumImagePickerHandle, AlbumImagePickerProps>(
  ({ onSelect }, ref) => {
    const [opened, setOpened] = useState(false);
    const [folderPath, setFolderPath] = useState<string | undefined>(undefined);
    const { httpGet } = useApiContext();
    const { data, isLoading, error } = useAlbum(httpGet);

    useImperativeHandle(ref, () => ({
      open: () => { setFolderPath(undefined); setOpened(true); },
    }));

    const currentFolder: Folder | undefined = folderPath
      ? findFolderByPath(data?.folders ?? [], folderPath)
      : data;

    const crumbs = folderPath
      ? folderPath.replace(IMAGE_PREFIX, '').split('/').filter(Boolean)
      : [];

    const handleSelect = (file: AlbumFile) => {
      onSelect(file.httpPath, file.title || file.name);
      setOpened(false);
    };

    return (
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Insert image from album"
        size="xl"
        scrollAreaComponent={undefined}
      >
        <Group gap={4} mb="sm" wrap="nowrap" style={{ overflowX: 'auto' }}>
          <Anchor component="button" type="button" size="sm" onClick={() => setFolderPath(undefined)}>
            Album
          </Anchor>
          {crumbs.map((seg, i) => {
            const path = IMAGE_PREFIX + '/' + crumbs.slice(0, i + 1).join('/');
            return (
              <Group gap={4} key={i} wrap="nowrap">
                <Text size="sm" c="dimmed">/</Text>
                <Anchor component="button" type="button" size="sm" onClick={() => setFolderPath(path)}>
                  {seg}
                </Anchor>
              </Group>
            );
          })}
        </Group>

        {isLoading && (
          <Center py="xl">
            <Loader size="md" type="dots" />
          </Center>
        )}

        {error && <Text c="red" size="sm">Failed to load album.</Text>}

        {!isLoading && !error && currentFolder && (
          <Stack gap="md">
            {currentFolder.folders.length > 0 && (
              <SimpleGrid cols={{ base: 3, sm: 4, md: 5 }} spacing="xs">
                {currentFolder.folders.map((folder, i) => (
                  <Box
                    key={i}
                    style={{
                      cursor: 'pointer',
                      textAlign: 'center',
                      padding: 8,
                      borderRadius: 4,
                    }}
                    onClick={() => setFolderPath(folder.relativePath)}
                  >
                    <Text size="xl">📁</Text>
                    <Text size="xs" truncate>{folder.name}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            )}

            {currentFolder.files.length > 0 && (
              <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
                {currentFolder.files.map((file, i) => (
                  <Box
                    key={i}
                    style={{ cursor: 'pointer' }}
                    title={file.title || file.name}
                    onClick={() => handleSelect(file)}
                  >
                    <Box
                      style={{
                        aspectRatio: '1 / 1',
                        overflow: 'hidden',
                        borderRadius: 4,
                        border: '2px solid transparent',
                        transition: 'border-color 120ms ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--mantine-color-blue-5)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                    >
                      <Image
                        src={file.thumbHttpPath}
                        alt={file.title || file.name}
                        fit="cover"
                        w="100%"
                        h="100%"
                        loading="lazy"
                      />
                    </Box>
                    <Text size="xs" truncate mt={4}>{file.title || file.name}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            )}

            {currentFolder.folders.length === 0 && currentFolder.files.length === 0 && (
              <Center py="xl">
                <Text c="dimmed" size="sm">This folder is empty.</Text>
              </Center>
            )}
          </Stack>
        )}
      </Modal>
    );
  }
);

AlbumImagePicker.displayName = 'AlbumImagePicker';
export default AlbumImagePicker;

function findFolderByPath(folders: Folder[], path: string): Folder | undefined {
  for (const f of folders) {
    if (f.relativePath === path) return f;
    const found = findFolderByPath(f.folders, path);
    if (found) return found;
  }
  return undefined;
}
