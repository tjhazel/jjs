import React from 'react';
import { Stack, Group, Text, Progress, ActionIcon, Button } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useAlbumEditorContext } from './AlbumEditorContext';

export default function SelectedFilesList() {
  const ctx = useAlbumEditorContext();
  const { fileStates, removeFileAt, clearAllFiles, uploading, formatBytes } = ctx;

  return (
    <Stack gap="xs">
      {fileStates.map((s, i) => (
        <Group key={s.id} justify="space-between" align="center">
          <Group align="center" spacing="sm" style={{ minWidth: 0 }}>
            <Stack gap={0} style={{ minWidth: 0 }}>
              <Text size="sm" fw={500} truncate maw={400}>{s.file.name}</Text>
              <Text size="xs" c="dimmed">{formatBytes(s.file.size)}</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, minWidth: 200 }}>
                <Progress value={s.progress ?? (s.status === 'success' ? 100 : 0)} size="xs" style={{ flex: 1 }} />
                <Text size="xs" c="dimmed" style={{ width: 40, textAlign: 'right' }}>{(s.progress ?? (s.status === 'success' ? 100 : 0))}%</Text>
              </div>
            </Stack>
          </Group>
          <Group spacing="xs">
            {s.status === 'error' && s.message && <Text size="xs" c="red">{s.message}</Text>}
            <ActionIcon
              variant="subtle" color="red" size="sm"
              onClick={() => removeFileAt(i)}
              aria-label={`Remove ${s.file.name}`}
              disabled={s.status === 'uploading'}
            >
              <IconX size={14} />
            </ActionIcon>
          </Group>
        </Group>
      ))}
      <Group spacing="xs">
        <Button variant="subtle" size="xs" onClick={clearAllFiles} disabled={uploading}>Clear</Button>
        <Text size="xs" c="dimmed">{fileStates.length} file(s) selected</Text>
      </Group>
    </Stack>
  );
}
