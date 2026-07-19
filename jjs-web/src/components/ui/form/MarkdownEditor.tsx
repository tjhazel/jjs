import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Box, Group, ActionIcon, Tooltip, Text, Tabs, Textarea,
  InputWrapper, Divider, Menu,
  type InputWrapperProps,
} from '@mantine/core';
import MarkdownViewer from '@components/ui/MarkdownViewer';
import {
  IconBold, IconItalic, IconStrikethrough,
  IconH1, IconH2, IconBlockquote, IconCode, IconLink,
  IconList, IconListNumbers, IconMinus, IconPhoto, IconDots,
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
  maxHeight?: string | number;
  disabled?: boolean;
  /** Pass the upload route (e.g. `'api/post-image'`) to enable image paste / drop / pick. */
  uploadEndpoint?: string;
  /** Called at upload time to get a preferred base filename (e.g. the post title). */
  fileNameHint?: () => string;
  /** Called after a successful image upload with the server's response. */
  onImageUploaded?: (result: { url: string; fileName: string }) => void;
}

const UPLOAD_PLACEHOLDER = '![Uploading…]()';

export default function MarkdownEditor({
  value,
  defaultValue = '',
  onChange,
  placeholder = 'Write using Markdown…',
  minRows = 8,
  maxHeight,
  disabled = false,
  uploadEndpoint = 'api/post-image',
  fileNameHint,
  onImageUploaded,
  ...wrapperProps
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [uploading, setUploading] = useState(false);
  // Internal text state: initialized from value (controlled) or defaultValue (uncontrolled).
  const [text, setText] = useState(value ?? defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const dotsWrapperRef = useRef<HTMLDivElement>(null);
  // Stores each item's right-edge position relative to the toolbar's left edge,
  // measured on first render when all items are in the DOM. Reused on every
  // subsequent resize so removed items can still be "seen" by the calculator.
  const itemRightsRef = useRef<number[]>([]);
  const [visibleCount, setVisibleCount] = useState(Number.MAX_SAFE_INTEGER);
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

  const resolveUploadFile = (file: File, isPaste: boolean): File => {
    if (!isPaste) return file;
    const hint = fileNameHint?.().trim() ?? '';
    if (!hint) return file;
    // Strip filesystem-invalid chars plus markdown-special chars that would break ![alt](url) syntax
    const safeName = hint
      .replace(/[<>:"/\\|?*\x00-\x1f\[\]()!]/g, '')
      .slice(0, 30)
      .trimEnd()
      .replace(/\.+$/, '');
    if (!safeName) return file;
    const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '';
    return new File([file], `${safeName}${ext}`, { type: file.type });
  };

  // Strip characters that break markdown image syntax from the alt text
  const safeAlt = (name: string) => name.replace(/[\[\]()!\\]/g, '');

  const handleImageFile = async (file: File, isPaste = false) => {
    if (!uploadEndpoint || !file.type.startsWith('image/')) return;

    const uploadFile = resolveUploadFile(file, isPaste);
    const el = textareaRef.current;
    const insertPos = el ? el.selectionStart : text.length;
    const withPlaceholder = text.slice(0, insertPos) + UPLOAD_PLACEHOLDER + text.slice(insertPos);
    handleChange(withPlaceholder);
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      const result = await httpPostFormData<{ url: string; fileName: string }>(uploadEndpoint, fd);
      handleChange(withPlaceholder.replace(UPLOAD_PLACEHOLDER, `![${safeAlt(uploadFile.name)}](${result.url})`));
      onImageUploaded?.(result);
    } catch (e) {
      console.error('[MarkdownEditor] Image upload failed:', e);
      handleChange(withPlaceholder.replace(UPLOAD_PLACEHOLDER, ''));
    } finally {
      setUploading(false);
    }
  };

  // ── Toolbar definition (ordered most- to least-common; rightmost overflow first) ──

  type ToolItem = { icon: React.ReactNode; label: string; action: () => void; loading?: boolean };

  const allTools: (ToolItem | null)[] = [
    { icon: <IconH1 size={14} />,            label: 'Heading 1',       action: () => prependLines('# ') },
    { icon: <IconH2 size={14} />,            label: 'Heading 2',       action: () => prependLines('## ') },
    null,
    { icon: <IconBold size={14} />,          label: 'Bold',            action: () => wrap('**', '**', 'bold text') },
    { icon: <IconItalic size={14} />,        label: 'Italic',          action: () => wrap('*', '*', 'italic text') },
    null,
    { icon: <IconCode size={14} />,          label: 'Inline code',     action: () => wrap('`', '`', 'code') },
    { icon: <IconLink size={14} />,          label: 'Link',            action: () => wrap('[', '](url)', 'link text') },
    null,
    { icon: <IconList size={14} />,          label: 'Unordered list',  action: () => prependLines('- ') },
    { icon: <IconListNumbers size={14} />,   label: 'Ordered list',    action: () => prependLines('1. ') },
    null,
    { icon: <IconStrikethrough size={14} />, label: 'Strikethrough',   action: () => wrap('~~', '~~', 'struck text') },
    { icon: <IconBlockquote size={14} />,    label: 'Quote',           action: () => prependLines('> ') },
    null,
    { icon: <IconMinus size={14} />,         label: 'Horizontal rule', action: () => insert('\n\n---\n\n') },
    ...(uploadEndpoint ? [
      null as null,
      { icon: <IconPhoto size={14} />, label: 'Insert image', loading: uploading, action: () => fileInputRef.current?.click() } as ToolItem,
    ] : []),
  ];

  // ── Overflow measurement via ResizeObserver ──────────────────────────────
  //
  // The dots wrapper is always rendered (visibility: hidden when unused) so its
  // width is always reserved in the calculation, preventing layout oscillation.
  // Item widths are captured on first render (all items visible) and reused on
  // subsequent resize events so we can restore items even after they leave the DOM.

  useLayoutEffect(() => {
    const toolbar = toolbarRef.current;
    const dotsWrapper = dotsWrapperRef.current;
    if (!toolbar || !dotsWrapper) return;

    const measure = () => {
      const toolbarRect = toolbar.getBoundingClientRect();
      // dotsWrapper is always in the DOM (visibility:hidden when unused), so its
      // bounding width — which includes children's flex-layout margins — is stable.
      const dotsWidth = dotsWrapper.getBoundingClientRect().width;
      const available = toolbarRect.width - dotsWidth;

      // Capture right-edge positions on the first call (all items still in DOM).
      // getBoundingClientRect().right accounts for the element's actual viewport
      // position, so it implicitly includes every preceding item's width, margin,
      // and the flex gap — unlike offsetWidth which would miss margins entirely.
      if (itemRightsRef.current.length === 0) {
        const items = (Array.from(toolbar.children) as HTMLElement[]).filter(
          el => el !== dotsWrapper,
        );
        itemRightsRef.current = items.map(
          el => el.getBoundingClientRect().right - toolbarRect.left,
        );
      }

      const rights = itemRightsRef.current;
      let newCount = rights.length;

      for (let i = 0; i < rights.length; i++) {
        if (rights[i] > available) {
          newCount = i;
          break;
        }
      }

      setVisibleCount(newCount);
    };

    const ro = new ResizeObserver(measure);
    ro.observe(toolbar);
    measure();
    return () => ro.disconnect();
  }, []);

  // ── Split tools into visible (inline) vs overflow (menu) ─────────────────

  const allVisible = allTools.slice(0, visibleCount);
  const allOverflow = allTools.slice(visibleCount);

  // Drop trailing dividers from inline section and leading dividers from menu section
  let visEnd = allVisible.length - 1;
  while (visEnd >= 0 && allVisible[visEnd] === null) visEnd--;
  const visibleTools = allVisible.slice(0, visEnd + 1);

  let ovStart = 0;
  while (ovStart < allOverflow.length && allOverflow[ovStart] === null) ovStart++;
  const overflowTools = allOverflow.slice(ovStart);

  const hasOverflow = overflowTools.some(t => t !== null);

  // ── Render helpers ───────────────────────────────────────────────────────

  const renderInlineButton = (t: ToolItem, i: number) => (
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
  );

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
            <Group ref={toolbarRef} gap={2} px="xs" py={4} wrap="nowrap" className={classes.toolbar}>
              {visibleTools.map((t, i) =>
                t === null
                  ? <Divider key={i} orientation="vertical" h={16} mx={2} style={{ alignSelf: 'center' }} />
                  : renderInlineButton(t, i)
              )}

              <div
                ref={dotsWrapperRef}
                style={{ display: 'flex', alignItems: 'center', visibility: hasOverflow ? 'visible' : 'hidden' }}
              >
                <Divider orientation="vertical" h={16} mx={2} style={{ alignSelf: 'center' }} />
                <Menu shadow="md" position="bottom-end" withinPortal>
                  <Menu.Target>
                    <Tooltip label="More" withArrow fz="xs" openDelay={400}>
                      <ActionIcon
                        variant="subtle" color="gray" size="sm"
                        disabled={disabled || uploading}
                        aria-label="More formatting options"
                      >
                        <IconDots size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {overflowTools.map((t, i) =>
                      t === null
                        ? <Menu.Divider key={i} />
                        : (
                          <Menu.Item
                            key={i}
                            leftSection={t.icon}
                            fz="sm"
                            onClick={() => t.action()}
                          >
                            {t.label}
                          </Menu.Item>
                        )
                    )}
                  </Menu.Dropdown>
                </Menu>
              </div>
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
              spellCheck={true}
              disabled={disabled || uploading}
              classNames={{ input: classes.textareaInput }}
              styles={maxHeight ? { input: { maxHeight, overflowY: 'auto' } } : undefined}
              onPaste={uploadEndpoint ? e => {
                const imageItem = Array.from(e.clipboardData.items)
                  .find(item => item.kind === 'file' && item.type.startsWith('image/'));
                if (imageItem) {
                  e.preventDefault();
                  const file = imageItem.getAsFile();
                  if (file) handleImageFile(file, true);
                }
              } : undefined}
            />
          </Tabs.Panel>

          <Tabs.Panel value="preview">
            <Box p="md" style={{ minHeight: `calc(${minRows} * 1.625rem + 1rem)` }}>
              {text.trim()
                ? <MarkdownViewer>{text}</MarkdownViewer>
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
