import { useEffect, useRef, useState } from 'react';
import {
  Stack, Group, Title, Text, Grid, Paper, Anchor, Divider,
  TextInput, ActionIcon, Tooltip, Box, Image, Button, Alert,
  Loader, Center, UnstyledButton, Badge, Progress,
} from '@mantine/core';
import {
  IconUpload, IconFolderPlus, IconFolder, IconChevronRight,
  IconX, IconCheck, IconAlertCircle, IconPhoto,
} from '@tabler/icons-react';
import { useApiContext } from '@api/ApiContext';
import { useAlbum, uploadAlbumImage, createAlbumFolder } from '@api/album/album-fetcher';
import { IMAGE_PREFIX, type Folder } from '@api/album/album-models';
import FolderBrowser from '@components/albumEditor/FolderBrowser';
import NewFolderForm from '@components/albumEditor/NewFolderForm';
import DropZone from '@components/albumEditor/DropZone';
import SelectedFilesList from '@components/albumEditor/SelectedFilesList';

function findFolderByPath(folders: Folder[] | null | undefined, path: string): Folder | undefined {
  if (!folders) return undefined;
  for (const f of folders) {
    if (f.relativePath === path) return f;
    const found = findFolderByPath(f.folders, path);
    if (found) return found;
  }
  return undefined;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type FileState = {
  id: string;
  file: File;
  previewUrl: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress?: number;
  message?: string;
};

export default function ManageAlbumPage() {
  const { httpGet, httpPost, httpPostFormData } = useApiContext();
  const { data, isLoading, error: albumError } = useAlbum(httpGet);

  // Folder browser state
  const [currentPath, setCurrentPath] = useState<string | undefined>(undefined);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);
  const [folderSuccess, setFolderSuccess] = useState<string | null>(null);

  // Upload state (support multiple files with per-file status)
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke preview object URLs on unmount
  useEffect(() => {
    return () => { fileStates.forEach(s => URL.revokeObjectURL(s.previewUrl)); };
  }, [fileStates]);

  const currentFolder: Folder | undefined = currentPath
    ? findFolderByPath(data?.folders ?? [], currentPath)
    : data;

  const crumbs = currentPath
    ? currentPath.replace(IMAGE_PREFIX, '').split('/').filter(Boolean)
    : [];

  const uploadTarget = currentPath ?? IMAGE_PREFIX;
  const displayTarget = uploadTarget === IMAGE_PREFIX ? 'Album root' : uploadTarget;

  // ── File selection ──────────────────────────────────────────────────────────

  const handleFilesSelect = (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (arr.length === 0) return;
    setUploadStatus(null);
    const newStates = arr.map(f => ({
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
      status: 'idle' as const,
      progress: 0,
    }));
    setFileStates(prev => [...prev, ...newStates]);
  };

  const removeFileAt = (index: number) => {
    setFileStates(prev => {
      const toRemove = prev[index];ye
      if (toRemove) URL.revokeObjectURL(toRemove.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearAllFiles = () => {
    fileStates.forEach(s => URL.revokeObjectURL(s.previewUrl));
    setFileStates([]);
  };

  // ── Upload (concurrent, max 5) ──────────────────────────────────────────────

  const handleUpload = async () => {
    if (fileStates.length === 0) return;
    setUploading(true);
    setUploadStatus(null);

    const queue = [...fileStates]; // shallow copy
    const successes: string[] = [];
    const failures: { name: string; msg: string }[] = [];

    // worker that processes items from queue until empty
    const worker = async () => {
      while (true) {
        const item = queue.shift();
        if (!item) return;
        // mark uploading
        setFileStates(prev => prev.map(s => s.id === item.id ? { ...s, status: 'uploading', message: undefined, progress: 0 } : s));
        try {
          await uploadAlbumImage(httpPostFormData, item.file, uploadTarget, (percent: number) => {
                      // avoid showing 100% while server is still processing; show 99% until upload completes
                      const visible = percent === 100 ? 99 : percent;
                      setFileStates(prev => prev.map(s => s.id === item.id ? { ...s, progress: visible } : s));
                    });
          successes.push(item.file.name);
          setFileStates(prev => prev.map(s => s.id === item.id ? { ...s, status: 'success', progress: 100 } : s));
        } catch (e: unknown) {
          const data = (e as { responseData?: unknown })?.responseData;
          const msg = typeof data === 'string' ? data : 'Upload failed.';
          failures.push({ name: item.file.name, msg });
          setFileStates(prev => prev.map(s => s.id === item.id ? { ...s, status: 'error', message: msg } : s));
        }
      }
    };

    // start up to 5 workers in parallel
    const workers: Promise<void>[] = [];
    const concurrency = 5;
    for (let i = 0; i < concurrency; i++) workers.push(worker());
    await Promise.all(workers);

    // After processing, remove successful items from state and keep failures
    if (failures.length === 0) {
      setUploadStatus({ msg: `${successes.length} file(s) uploaded successfully.`, ok: true });
      clearAllFiles();
    } else {
      const failedNames = failures.map(f => f.name);
      setFileStates(prev => prev.filter(s => failedNames.includes(s.file.name)));
      setUploadStatus({ msg: `${successes.length} uploaded, ${failures.length} failed: ${failedNames.join(', ')}`, ok: false });
    }

    setUploading(false);
  };

  // ── Create folder ───────────────────────────────────────────────────────────

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    if (!/^[^/\\:*?"<>|.]{1,60}$/.test(name)) {
      setFolderError('Use letters, numbers, spaces, hyphens or underscores only.');
      return;
    }
    setCreatingFolder(true);
    setFolderError(null);
    setFolderSuccess(null);
    try {
      await createAlbumFolder(httpPost, uploadTarget, name);
      setNewFolderName('');
      setFolderSuccess(`"${name}" created.`);
    } catch (e: unknown) {
      setFolderError(e instanceof Error ? e.message : 'Failed to create folder.');
    } finally {
      setCreatingFolder(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Stack gap="sm">

      {/* Header */}
      <Group justify="space-between" align="center">
        <Stack gap={2}>
          <Title order={1} size="h3" fw={600} lh="sm">Album Upload</Title>
          <Text size="xs" c="dimmed">Browse to a folder, then upload an image from your device.</Text>
        </Stack>
      </Group>

      <Grid gutter="md" align="stretch">

        {/* ── Left: Folder browser ── */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder p="md" h="100%">
            <FolderBrowser
              isLoading={isLoading}
              albumError={albumError}
              currentFolder={currentFolder}
              crumbs={crumbs}
              onRootClick={() => setCurrentPath(undefined)}
              onCrumbClick={(path) => setCurrentPath(path)}
              onFolderClick={(path) => setCurrentPath(path)}
              displayTarget={displayTarget}
            >
              <Divider label="New Folder" labelPosition="left" />
              <NewFolderForm
                newFolderName={newFolderName}
                setNewFolderName={(v) => { setNewFolderName(v); setFolderError(null); setFolderSuccess(null); }}
                creatingFolder={creatingFolder}
                folderError={folderError}
                folderSuccess={folderSuccess}
                onCreateFolder={handleCreateFolder}
              />
            </FolderBrowser>
          </Paper>
        </Grid.Col>

        {/* ── Right: Upload ── */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder p="md" h="100%">
            <Stack gap="md">

              <Text fw={600} size="sm">Image File</Text>

              {/* Drop zone */}
              <DropZone
                fileStates={fileStates}
                dragOver={dragOver}
                onDrop={(files) => { setDragOver(false); handleFilesSelect(files); }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={e => {
                  const files = e.target.files;
                  if (files && files.length) handleFilesSelect(files);
                  e.target.value = '';
                }}
              />

              {/* Selected files info */}
              {fileStates.length > 0 && (
                <SelectedFilesList
                  fileStates={fileStates}
                  removeFileAt={removeFileAt}
                  clearAllFiles={clearAllFiles}
                  uploading={uploading}
                />
              )}

              <Button
                onClick={handleUpload}
                loading={uploading}
                disabled={fileStates.length === 0 || uploading}
                leftSection={<IconUpload size={16} />}
                radius="none"
                variant="default"
              >
                Upload to Album
              </Button>

              {uploadStatus && (
                <Alert
                  variant="light"
                  color={uploadStatus.ok ? 'teal' : 'red'}
                  radius="none"
                  icon={uploadStatus.ok
                    ? <IconCheck size={16} />
                    : <IconAlertCircle size={16} />}
                >
                  {uploadStatus.msg}
                </Alert>
              )}

            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
