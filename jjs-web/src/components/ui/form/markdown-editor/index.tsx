import { Box, Group, InputWrapper, Text } from '@mantine/core';
import { MarkdownEditorContext } from './MarkdownEditorContext';
import { useMarkdownEditor } from './useMarkdownEditor';
import { MarkdownEditorContent } from './MarkdownEditorContent';
import { MarkdownEditorUploads } from './MarkdownEditorUploads';
import type { MarkdownEditorProps } from './types';
import classes from './MarkdownEditor.module.css';

export type { MarkdownEditorProps } from './types';

export default function MarkdownEditor({
  value,
  defaultValue,
  onChange,
  placeholder,
  minRows,
  maxHeight,
  disabled,
  uploadEndpoint,
  fileNameHint,
  onImageUploaded,
  ...wrapperProps
}: MarkdownEditorProps) {
  const editor = useMarkdownEditor({
    value, defaultValue, onChange, placeholder, minRows, maxHeight,
    disabled, uploadEndpoint, fileNameHint, onImageUploaded, ...wrapperProps,
  });

  return (
    <MarkdownEditorContext.Provider value={editor}>
      <InputWrapper {...wrapperProps}>
        <Box
          mt={wrapperProps.label ? 4 : 0}
          className={classes.container}
          onDrop={editor.uploadEndpoint ? event => {
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            if (file) void editor.handleImageFile(file);
          } : undefined}
          onDragOver={editor.uploadEndpoint ? event => event.preventDefault() : undefined}
        >
          <MarkdownEditorContent />
          <Group justify="flex-end" px="xs" py={4} className={classes.footer}>
            <Text size="xs" c="dimmed">Markdown supported</Text>
          </Group>
        </Box>
        <MarkdownEditorUploads />
      </InputWrapper>
    </MarkdownEditorContext.Provider>
  );
}
