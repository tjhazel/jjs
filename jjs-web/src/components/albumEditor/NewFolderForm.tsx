import React from 'react';
import { Group, TextInput, Tooltip, ActionIcon, Text } from '@mantine/core';
import { IconFolderPlus } from '@tabler/icons-react';

type Props = {
  newFolderName: string;
  setNewFolderName: (v: string) => void;
  creatingFolder: boolean;
  folderError: string | null;
  folderSuccess: string | null;
  onCreateFolder: () => void;
};

export default function NewFolderForm({ newFolderName, setNewFolderName, creatingFolder, folderError, folderSuccess, onCreateFolder }: Props) {
  return (
    <>
      <Group gap="xs" align="flex-start">
        <TextInput
          flex={1}
          size="xs"
          placeholder="Folder name"
          value={newFolderName}
          onChange={e => setNewFolderName(e.currentTarget.value)}
          onKeyDown={e => e.key === 'Enter' && onCreateFolder()}
          error={folderError}
          disabled={creatingFolder}
        />
        <Tooltip label="Create folder" withArrow fz="xs">
          <ActionIcon
            variant="default"
            size="sm"
            style={{ marginTop: 1 }}
            onClick={onCreateFolder}
            loading={creatingFolder}
            disabled={!newFolderName.trim()}
            aria-label="Create folder"
          >
            <IconFolderPlus size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>
      {folderSuccess && (
        <Text size="xs" c="teal">{folderSuccess}</Text>
      )}
    </>
  );
}
