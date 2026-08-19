import React from 'react';
import { Box, Group, Stack, Text } from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';
import { Image } from '@mantine/core';

type FileState = {
  id: string;
  file: File;
  previewUrl: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress?: number;
  message?: string;
};

type Props = {
  fileStates: FileState[];
  dragOver: boolean;
  onDrop: (files: File[]) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onClick: () => void;
};

export default function DropZone({ fileStates, dragOver, onDrop, onDragOver, onDragLeave, onClick }: Props) {
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
        const files = Array.from(e.dataTransfer.files);
        if (files.length) onDrop(files);
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onClick}
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
