import { Box, Tabs, Text, Textarea } from '@mantine/core';
import MarkdownViewer from '@components/ui/MarkdownViewer';
import { useMarkdownEditorContext } from './MarkdownEditorContext';
import { MarkdownEditorToolbar } from './MarkdownEditorToolbar';
import classes from './MarkdownEditor.module.css';

export function MarkdownEditorContent() {
  const {
    text, tab, setTab, textareaRef, placeholder, minRows, maxHeight,
    disabled, uploading, uploadEndpoint, handleChange, handleImageFile,
  } = useMarkdownEditorContext();

  return (
    <Tabs value={tab} onChange={value => setTab((value ?? 'write') as 'write' | 'preview')} variant="default">
      <Box px="xs" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <Tabs.List classNames={{ list: classes.tabList }}>
          <Tabs.Tab value="write" fz="sm">Write</Tabs.Tab>
          <Tabs.Tab value="preview" fz="sm">Preview</Tabs.Tab>
        </Tabs.List>
      </Box>
      <MarkdownEditorToolbar />
      <Tabs.Panel value="write">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={event => handleChange(event.currentTarget.value)}
          placeholder={placeholder}
          minRows={minRows}
          autosize
          spellCheck
          disabled={disabled || uploading}
          classNames={{ input: classes.textareaInput }}
          styles={maxHeight ? { input: { maxHeight, overflowY: 'auto' } } : undefined}
          onPaste={uploadEndpoint ? event => {
            const imageItem = Array.from(event.clipboardData.items)
              .find(item => item.kind === 'file' && item.type.startsWith('image/'));
            if (imageItem) {
              event.preventDefault();
              const file = imageItem.getAsFile();
              if (file) void handleImageFile(file, true);
            }
          } : undefined}
        />
      </Tabs.Panel>
      <Tabs.Panel value="preview">
        <Box p="md" style={{ minHeight: `calc(${minRows} * 1.625rem + 1rem)` }}>
          {text.trim()
            ? <MarkdownViewer>{text}</MarkdownViewer>
            : <Text size="sm" c="dimmed" fs="italic">Nothing to preview.</Text>}
        </Box>
      </Tabs.Panel>
    </Tabs>
  );
}
