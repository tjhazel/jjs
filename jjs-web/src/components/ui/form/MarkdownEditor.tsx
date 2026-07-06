import { useEffect, useRef, useState } from 'react';
import {
  Box, Group, ActionIcon, Tooltip, Text, Tabs, Textarea,
  InputWrapper, Divider,
  type InputWrapperProps,
} from '@mantine/core';
import Markdown from 'react-markdown';
import {
  IconBold, IconItalic, IconStrikethrough,
  IconH1, IconH2, IconBlockquote, IconCode, IconLink,
  IconList, IconListNumbers, IconMinus, IconPhoto,
} from '@tabler/icons-react';
import { useApiContext } from '@api/ApiContext';
import classes from './MarkdownEditor.module.css';

export interface MarkdownEditorProps extends Omit<InputWrapperProps, 'children'> {
  /** Controlled value. Use with `onChange`. */
  value?: string;
  /** Uncontrolled initial value. Works with Mantine form's key + getInputProps pattern. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  disabled?: boolean;
  /** Pass the upload route (e.g. `'api/attachment'`) to enable image paste / drop / pick. */
  uploadEndpoint?: string;
}

const UPLOAD_PLACEHOLDER = '![Uploading…]()';

export default function MarkdownEditor({
  value,
  defaultValue = '',
  onChange,
  placeholder = 'Write using Markdown…',
  minRows = 8,
  disabled = false,
  uploadEndpoint = 'api/attachment',
  ...wrapperProps
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [uploading, setUploading] = useState(false);
  // Internal text state: initialized from value (controlled) or defaultValue (uncontrolled).
  const [text, setText] = useState(value ?? defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { httpPostFormData } = useApiContext();

  // Sync when controlled value changes from outside.
  useEffect(() => {
    if (value !== undefined) setText(value);
  }, [value]);

  const handleChange = (next: string) => {
    setText(next);
    onChange?.(next);
  };

  // ── Toolbar mutation helpers ─────────────────────────────────────────────

  const mutate = (fn: (t: string, sel: [number, number]) => { next: string; cursor: [number, number] }) => {
    const el = textareaRef.current;
    if (!el) return;
    const { next, cursor } = fn(text, [el.selectionStart, el.selectionEnd]);
    handleChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor[0], cursor[1]);
    });
  };

  const wrap = (before: string, after: string, ph: string) =>
    mutate((t, [s, e]) => {
      const sel = t.slice(s, e) || ph;
      const next = t.slice(0, s) + before + sel + after + t.slice(e);
      return { next, cursor: [s + before.length, s + before.length + sel.length] };
    });

  const prependLines = (prefix: string) =>
    mutate((t, [s, e]) => {
      const lineStart = t.lastIndexOf('\n', s - 1) + 1;
      const lineEnd = (() => { const i = t.indexOf('\n', e); return i === -1 ? t.length : i; })();
      const block = t.slice(lineStart, lineEnd).split('\n').map(l => prefix + l).join('\n');
      const next = t.slice(0, lineStart) + block + t.slice(lineEnd);
      return { next, cursor: [lineStart, lineStart + block.length] };
    });

  const insert = (snippet: string) =>
    mutate((t, [s]) => ({
      next: t.slice(0, s) + snippet + t.slice(s),
      cursor: [s + snippet.length, s + snippet.length],
    }));

  // ── Image upload ─────────────────────────────────────────────────────────

  const handleImageFile = async (file: File) => {
    if (!uploadEndpoint || !file.type.startsWith('image/')) return;

    const el = textareaRef.current;
    const insertPos = el ? el.selectionStart : text.length;
    const withPlaceholder = text.slice(0, insertPos) + UPLOAD_PLACEHOLDER + text.slice(insertPos);
    handleChange(withPlaceholder);
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const result = await httpPostFormData<{ attachmentId: number; fileName: string }>(uploadEndpoint, fd);
      handleChange(withPlaceholder.replace(UPLOAD_PLACEHOLDER, `![${file.name}](/api/attachment/${result.attachmentId}/content)`));
    } catch {
      handleChange(withPlaceholder.replace(UPLOAD_PLACEHOLDER, ''));
    } finally {
      setUploading(false);
    }
  };

  // ── Toolbar definition ───────────────────────────────────────────────────

  type ToolItem = { icon: React.ReactNode; label: string; action: () => void; loading?: boolean } | null;

  const tools: ToolItem[] = [
    { icon: <IconH1 size={14} />, label: 'Heading 1', action: () => prependLines('# ') },
    { icon: <IconH2 size={14} />, label: 'Heading 2', action: () => prependLines('## ') },
    null,
    { icon: <IconBold size={14} />, label: 'Bold', action: () => wrap('**', '**', 'bold text') },
    { icon: <IconItalic size={14} />, label: 'Italic', action: () => wrap('*', '*', 'italic text') },
    { icon: <IconStrikethrough size={14} />, label: 'Strikethrough', action: () => wrap('~~', '~~', 'struck text') },
    null,
    { icon: <IconBlockquote size={14} />, label: 'Quote', action: () => prependLines('> ') },
    { icon: <IconCode size={14} />, label: 'Inline code', action: () => wrap('`', '`', 'code') },
    { icon: <IconLink size={14} />, label: 'Link', action: () => wrap('[', '](url)', 'link text') },
    null,
    { icon: <IconList size={14} />, label: 'Unordered list', action: () => prependLines('- ') },
    { icon: <IconListNumbers size={14} />, label: 'Ordered list', action: () => prependLines('1. ') },
    null,
    { icon: <IconMinus size={14} />, label: 'Horizontal rule', action: () => insert('\n\n---\n\n') },
    ...(uploadEndpoint ? [
      null as ToolItem,
      { icon: <IconPhoto size={14} />, label: 'Insert image', loading: uploading, action: () => fileInputRef.current?.click() },
    ] : []),
  ];

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <InputWrapper {...wrapperProps}>
      <Box
        mt={wrapperProps.label ? 4 : 0}
        className={classes.container}
        onDrop={uploadEndpoint ? e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImageFile(f); } : undefined}
        onDragOver={uploadEndpoint ? e => e.preventDefault() : undefined}
      >
        <Tabs value={tab} onChange={v => setTab((v ?? 'write') as 'write' | 'preview')} variant="default">
          <Box px="xs" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
            <Tabs.List classNames={{ list: classes.tabList }}>
              <Tabs.Tab value="write" fz="sm">Write</Tabs.Tab>
              <Tabs.Tab value="preview" fz="sm">Preview</Tabs.Tab>
            </Tabs.List>
          </Box>

          {tab === 'write' && (
            <Group gap={2} px="xs" py={4} wrap="wrap" className={classes.toolbar}>
              {tools.map((t, i) =>
                t === null ? (
                  <Divider key={i} orientation="vertical" h={16} mx={2} style={{ alignSelf: 'center' }} />
                ) : (
                  <Tooltip key={i} label={t.label} withArrow fz="xs" openDelay={400}>
                    <ActionIcon
                      variant="subtle" color="gray" size="sm"
                      onMouseDown={e => { e.preventDefault(); t.action(); }}
                      disabled={disabled || uploading}
                      loading={t.loading}
                      aria-label={t.label}
                    >
                      {t.icon}
                    </ActionIcon>
                  </Tooltip>
                )
              )}
            </Group>
          )}

          <Tabs.Panel value="write">
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={e => handleChange(e.currentTarget.value)}
              placeholder={placeholder}
              minRows={minRows}
              autosize
              disabled={disabled || uploading}
              classNames={{ input: classes.textareaInput }}
              onPaste={uploadEndpoint ? e => {
                const imageItem = Array.from(e.clipboardData.items)
                  .find(item => item.kind === 'file' && item.type.startsWith('image/'));
                if (imageItem) {
                  e.preventDefault();
                  const file = imageItem.getAsFile();
                  if (file) handleImageFile(file);
                }
              } : undefined}
            />
          </Tabs.Panel>

          <Tabs.Panel value="preview">
            <Box p="md" style={{ minHeight: `calc(${minRows} * 1.625rem + 1rem)` }}>
              {text.trim()
                ? <Markdown>{text}</Markdown>
                : <Text size="sm" c="dimmed" fs="italic">Nothing to preview.</Text>
              }
            </Box>
          </Tabs.Panel>
        </Tabs>

        <Group justify="flex-end" px="xs" py={4} className={classes.footer}>
          <Text size="xs" c="dimmed">Markdown supported</Text>
        </Group>

        {uploadEndpoint && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleImageFile(file);
              e.target.value = '';
            }}
          />
        )}
      </Box>
    </InputWrapper>
  );
}
