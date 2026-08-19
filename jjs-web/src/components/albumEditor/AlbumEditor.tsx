import { useEffect, useRef, useState } from 'react';
import {
  Stack, Group, Title, Text, Grid, Paper,
  Button, Alert
} from '@mantine/core';
import { IconUpload, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import AlbumEditorContext from './AlbumEditorContext';
import type { FileState } from './AlbumEditorContext';
import { useApiContext } from '@api/ApiContext';
import { useAlbum, uploadAlbumImage, createAlbumFolder } from '@api/album/album-fetcher';
import { IMAGE_PREFIX, type Folder } from '@api/album/album-models';
import FolderBrowser from './FolderBrowser';
import DropZone from './DropZone';
import SelectedFilesList from './SelectedFilesList';

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

export default function AlbumEditor(): JSX.Element {
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
      const toRemove = prev[index];
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

  const ctxValue = {
    data,
    isLoading,
    albumError,
    currentFolder,
    crumbs,
    displayTarget,
    uploadTarget,

    currentPath,
    setCurrentPath: (p?: string) => setCurrentPath(p),
    newFolderName,
    setNewFolderName: (v: string) => setNewFolderName(v),
    creatingFolder,
    folderError,
    folderSuccess,

    fileStates,
    setFileStates,
    dragOver,
    setDragOver,
    uploading,
    uploadStatus,

    fileInputRef,

    handleFilesSelect,
    removeFileAt,
    clearAllFiles,
    handleUpload,
    handleCreateFolder,

    formatBytes,
  } as const;

  return (
    <AlbumEditorContext.Provider value={ctxValue}>
      <Stack gap="sm">

        {/* Header */}
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Title order={1} size="h3" fw={600} lh="sm">Album Upload</Title>
            <Text size="xs" c="dimmed">Browse to a folder, then upload an image from your device.</Text>
          </Stack>
        </Group>

        <Grid gutter="md" align="stretch">

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper withBorder p="md" h="100%">
              <FolderBrowser />
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <Paper withBorder p="md" h="100%">
              <Stack gap="md">
                <Text fw={600} size="sm">Image File</Text>

                <DropZone />

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

                {fileStates.length > 0 && (
                  <SelectedFilesList />
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
    </AlbumEditorContext.Provider>
  );
}
