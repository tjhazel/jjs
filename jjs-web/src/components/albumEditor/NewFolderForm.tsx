import { Group, TextInput, Tooltip, ActionIcon, Text } from '@mantine/core';
import { IconFolderPlus } from '@tabler/icons-react';
import { useAlbumEditorContext } from './AlbumEditorContext';

export default function NewFolderForm() {
  const ctx = useAlbumEditorContext();
  const { newFolderName, setNewFolderName, creatingFolder, folderError, folderSuccess, handleCreateFolder } = ctx;

  return (
    <>
      <Group gap="xs" align="flex-start">
        <TextInput
          flex={1}
          size="xs"
          placeholder="Folder name"
          value={newFolderName}
          onChange={e => setNewFolderName(e.currentTarget.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
          error={folderError}
          disabled={creatingFolder}
        />
        <Tooltip label="Create folder" withArrow fz="xs">
          <ActionIcon
            variant="default"
            size="sm"
            style={{ marginTop: 1 }}
            onClick={handleCreateFolder}
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
