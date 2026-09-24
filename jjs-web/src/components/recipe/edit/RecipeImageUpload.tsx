import { useEffect, useState } from 'react';
import { FileInput, Button, Group, Image, Stack, Text, Alert, Box } from '@mantine/core';
import { IconUpload, IconAlertCircle, IconTrash } from '@tabler/icons-react';
import { uploadAttachment } from '@api/attachment/attachment-fetcher';
import type { AttachmentViewModel } from '@api/attachment/attachment-models';
import type { TPostFormData } from '@lib/httpClient';

interface RecipeImageUploadProps {
  currentPicture: AttachmentViewModel | null | undefined;
  currentPictureId: number | undefined;
  onUploadSuccess: (attachmentId: number, picture: AttachmentViewModel) => void;
  onClear: () => void;
  httpPostFormData: TPostFormData;
}

export default function RecipeImageUpload({
  currentPicture,
  currentPictureId,
  onUploadSuccess,
  onClear,
  httpPostFormData,
}: RecipeImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setUploadError(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setSelectedFile(null);
      setUploadError('Please select a valid image file (JPEG, PNG, GIF, etc.)');
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);
    setUploadError(null);
    setIsUploading(true);

    try {
      const result = await uploadAttachment(httpPostFormData, file);
      const newPicture: AttachmentViewModel = {
        name: file.name.replace(/\.[^/.]+$/, ''),
        fileName: result.fileName,
        fileSize: file.size,
        contentType: file.type,
        downloadCount: 0,
        contentBase64: null,
      };

      onUploadSuccess(result.attachmentId, newPicture);
      setSelectedFile(null);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const existingPictureUrl = currentPicture?.contentBase64
    ? `data:${currentPicture.contentType};base64,${currentPicture.contentBase64}`
    : currentPictureId
      ? `/api/attachment/${currentPictureId}/content`
      : null;
  const displayPicture = previewUrl || existingPictureUrl;
  const hasPicture = !!currentPicture || !!previewUrl;
  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    onClear();
  };

  return (
    <Stack gap="md">
      {uploadError && (
        <Alert
          variant="light"
          color="red"
          icon={<IconAlertCircle size={16} />}
          title="Upload Error"
          radius="none"
        >
          {uploadError}
        </Alert>
      )}

      {displayPicture && (
        <Box>
          <Text size="sm" fw={500} mb="xs">
            {previewUrl ? 'Preview' : 'Current Picture'}
          </Text>
          <Image
            src={displayPicture}
            alt="Recipe picture preview"
            h={300}
            fit="cover"
            radius="none"
          />
        </Box>
      )}

      <Stack gap="sm">
        <FileInput
          label="Recipe Picture"
          description="Upload an image to use as the recipe display picture"
          placeholder="Choose image file"
          leftSection={<IconUpload size={14} />}
          accept="image/*"
          value={selectedFile}
          onChange={handleFileSelect}
          clearable
          radius="none"
          disabled={isUploading}
        />

        <Group gap="sm">
          {hasPicture && !isUploading && (
            <Button
              variant="subtle"
              color="red"
              leftSection={<IconTrash size={14} />}
              radius="none"
              onClick={handleClear}
            >
              Remove Picture
            </Button>
          )}
        </Group>
      </Stack>
    </Stack>
  );
}
