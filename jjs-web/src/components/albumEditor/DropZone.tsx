import { Box, Group, Stack, Text } from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';
import { Image } from '@mantine/core';
import { useAlbumEditorContext } from './AlbumEditorContext';

export default function DropZone() {
  const ctx = useAlbumEditorContext();
  const { fileStates, dragOver, handleFilesSelect, setDragOver, fileInputRef } = ctx;

  return (
    <Box
      style={{
        border: `2px dashed ${dragOver ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-gray-4)'}`,
        borderRadius: 8,
        background: dragOver ? 'var(--mantine-color-blue-0)' : undefined,
        cursor: 'pointer',
        minHeight: 220,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'border-color 120ms ease, background 120ms ease',
      }}
      onDrop={e => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) handleFilesSelect(files);
      }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => fileInputRef.current?.click()}
    >
      {fileStates.length > 0
        ? (
          <Group style={{ gap: 8, padding: 8, overflowX: 'auto' }} wrap="nowrap">
            {fileStates.map((s, i) => (
              <Image key={s.id} src={s.previewUrl} fit="cover" mah={160} w={160} alt={`Preview ${i + 1}`} />
            ))}
          </Group>
        )
        : (
          <Stack align="center" gap="xs" p="xl">
            <IconPhoto size={40} color="var(--mantine-color-gray-4)" />
            <Text size="sm" c="dimmed" ta="center">
              Drop images here, or click to browse
            </Text>
            <Text size="xs" c="dimmed">JPEG, PNG, GIF</Text>
          </Stack>
        )
      }
    </Box>
  );
}
