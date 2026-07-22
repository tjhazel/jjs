import { useEffect, useRef, useState } from 'react';
import {
  Stack, Group, Title, Text, Grid, Paper, Anchor, Divider,
  TextInput, ActionIcon, Tooltip, Box, Image, Button, Alert,
  Loader, Center, UnstyledButton, Badge,
} from '@mantine/core';
import {
  IconUpload, IconFolderPlus, IconFolder, IconChevronRight,
  IconX, IconCheck, IconAlertCircle, IconPhoto,
} from '@tabler/icons-react';
import { useApiContext } from '@api/ApiContext';
import { useAlbum, uploadAlbumImage, createAlbumFolder } from '@api/album/album-fetcher';
import { IMAGE_PREFIX, type Folder } from '@api/album/album-models';

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

export default function ManageAlbumPage() {
  const { httpGet, httpPost, httpPostFormData } = useApiContext();
  const { data, isLoading, error: albumError } = useAlbum(httpGet);

  // Folder browser state
  const [currentPath, setCurrentPath] = useState<string | undefined>(undefined);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);
  const [folderSuccess, setFolderSuccess] = useState<string | null>(null);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke preview object URL on unmount
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const currentFolder: Folder | undefined = currentPath
    ? findFolderByPath(data?.folders ?? [], currentPath)
    : data;

  const crumbs = currentPath
    ? currentPath.replace(IMAGE_PREFIX, '').split('/').filter(Boolean)
    : [];

  const uploadTarget = currentPath ?? IMAGE_PREFIX;
  const displayTarget = uploadTarget === IMAGE_PREFIX ? 'Album root' : uploadTarget;

  // ── File selection ──────────────────────────────────────────────────────────

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setSelectedFile(file);
    setUploadStatus(null);
    const next = URL.createObjectURL(file);
    setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return next; });
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
  };

  // ── Upload ──────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadStatus(null);
    try {
      await uploadAlbumImage(httpPostFormData, selectedFile, uploadTarget);
      setUploadStatus({ msg: `"${selectedFile.name}" uploaded successfully.`, ok: true });
      clearFile();
    } catch (e: unknown) {
      const data = (e as { responseData?: unknown })?.responseData;
      const msg = typeof data === 'string' ? data : 'Upload failed. Please try again.';
      setUploadStatus({ msg, ok: false });
    } finally {
      setUploading(false);
    }
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
            <Stack gap="sm" h="100%">

              <Text fw={600} size="sm">Upload Destination</Text>

              {/* Breadcrumb */}
              <Group gap={4} wrap="nowrap" style={{ overflowX: 'auto' }}>
                <Anchor
                  component="button" type="button" size="sm"
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
                            component="button" type="button" size="sm"
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
                        <Group gap="xs" justify="space-between" wrap="nowrap">
                          <Group gap="xs" wrap="nowrap" style={{ overflow: 'hidden' }}>
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

              {/* New folder */}
              <Divider label="New Folder" labelPosition="left" />
              <Group gap="xs" align="flex-start">
                <TextInput
                  flex={1}
                  size="xs"
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={e => { setNewFolderName(e.currentTarget.value); setFolderError(null); setFolderSuccess(null); }}
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

            </Stack>
          </Paper>
        </Grid.Col>

        {/* ── Right: Upload ── */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder p="md" h="100%">
            <Stack gap="md">

              <Text fw={600} size="sm">Image File</Text>

              {/* Drop zone */}
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
                  const f = e.dataTransfer.files[0];
                  if (f) handleFileSelect(f);
                }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl
                  ? (
                    <Image
                      src={previewUrl}
                      fit="contain"
                      mah={320}
                      w="100%"
                      alt="Selected image preview"
                    />
                  )
                  : (
                    <Stack align="center" gap="xs" p="xl">
                      <IconPhoto size={40} color="var(--mantine-color-gray-4)" />
                      <Text size="sm" c="dimmed" ta="center">
                        Drop an image here, or click to browse
                      </Text>
                      <Text size="xs" c="dimmed">JPEG, PNG, GIF</Text>
                    </Stack>
                  )
                }
              </Box>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                  e.target.value = '';
                }}
              />

              {/* Selected file info */}
              {selectedFile && (
                <Group justify="space-between" align="center">
                  <Stack gap={0}>
                    <Text size="sm" fw={500} truncate maw={400}>{selectedFile.name}</Text>
                    <Text size="xs" c="dimmed">{formatBytes(selectedFile.size)}</Text>
                  </Stack>
                  <ActionIcon
                    variant="subtle" color="red" size="sm"
                    onClick={clearFile}
                    aria-label="Remove selected file"
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Group>
              )}

              <Button
                onClick={handleUpload}
                loading={uploading}
                disabled={!selectedFile}
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
