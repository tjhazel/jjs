import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  IconBold, IconItalic, IconStrikethrough, IconH1, IconH2, IconBlockquote,
  IconCode, IconLink, IconList, IconListNumbers, IconMinus, IconPhoto,
  IconCamera, IconFolderOpen,
} from '@tabler/icons-react';
import { useApiContext } from '@api/ApiContext';
import { IMAGE_PREFIX } from '@api/album/album-models';
import type { CameraCaptureHandle } from '../CameraCapture';
import type { ImageUploadHandle } from '../ImageUpload';
import type { AlbumImagePickerHandle } from '../AlbumImagePicker';
import type { MarkdownEditorProps, MarkdownEditorTab, MarkdownTool } from './types';

const UPLOAD_PLACEHOLDER = '![Uploading…]()';

export function useMarkdownEditor({
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
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<MarkdownEditorTab>('write');
  const [uploading, setUploading] = useState(false);
  const [text, setText] = useState(value ?? defaultValue);
  const [visibleCount, setVisibleCount] = useState(Number.MAX_SAFE_INTEGER);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageUploadRef = useRef<ImageUploadHandle>(null);
  const albumPickerRef = useRef<AlbumImagePickerHandle>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const dotsWrapperRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<CameraCaptureHandle>(null);
  const itemRightsRef = useRef<number[]>([]);
  const { httpPostFormData } = useApiContext();

  useEffect(() => {
    // Controlled values may change independently of editor input.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (value !== undefined) setText(value);
  }, [value]);

  const handleChange = (next: string) => {
    setText(next);
    onChange?.(next);
  };

  const mutate = (fn: (text: string, selection: [number, number]) => { next: string; cursor: [number, number] }) => {
    const element = textareaRef.current;
    if (!element) return;
    const { next, cursor } = fn(text, [element.selectionStart, element.selectionEnd]);
    handleChange(next);
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(cursor[0], cursor[1]);
    });
  };

  const wrap = (before: string, after: string, fallback: string) =>
    mutate((current, [start, end]) => {
      const selection = current.slice(start, end) || fallback;
      const next = current.slice(0, start) + before + selection + after + current.slice(end);
      return { next, cursor: [start + before.length, start + before.length + selection.length] };
    });

  const prependLines = (prefix: string) =>
    mutate((current, [start, end]) => {
      const lineStart = current.lastIndexOf('\n', start - 1) + 1;
      const lineEndIndex = current.indexOf('\n', end);
      const lineEnd = lineEndIndex === -1 ? current.length : lineEndIndex;
      const block = current.slice(lineStart, lineEnd).split('\n').map(line => prefix + line).join('\n');
      return {
        next: current.slice(0, lineStart) + block + current.slice(lineEnd),
        cursor: [lineStart, lineStart + block.length],
      };
    });

  const insert = (snippet: string) =>
    mutate((current, [start]) => ({
      next: current.slice(0, start) + snippet + current.slice(start),
      cursor: [start + snippet.length, start + snippet.length],
    }));

  const resolveUploadFile = (file: File, isPaste: boolean): File => {
    if (!isPaste) return file;
    const hint = fileNameHint?.().trim() ?? '';
    if (!hint) return file;
    // eslint-disable-next-line no-control-regex, no-useless-escape
    const safeName = hint.replace(/[<>:"/\\|?*\x00-\x1f\[\]()!]/g, '').slice(0, 30).trimEnd().replace(/\.+$/, '');
    if (!safeName) return file;
    const extension = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '';
    return new File([file], `${safeName}${extension}`, { type: file.type });
  };

  // eslint-disable-next-line no-useless-escape
  const safeAlt = (name: string) => name.replace(/[\[\]()!\\]/g, '');

  const handleImageFile = async (file: File, isPaste = false) => {
    if (!uploadEndpoint || !file.type.startsWith('image/')) return;
    const uploadFile = resolveUploadFile(file, isPaste);
    const element = textareaRef.current;
    const insertPos = element ? element.selectionStart : text.length;
    const withPlaceholder = text.slice(0, insertPos) + UPLOAD_PLACEHOLDER + text.slice(insertPos);
    handleChange(withPlaceholder);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      const result = await httpPostFormData<{ url: string; fileName: string }>(uploadEndpoint, formData);
      handleChange(withPlaceholder.replace(UPLOAD_PLACEHOLDER, `![${safeAlt(uploadFile.name)} | 500](${result.url})`));
      onImageUploaded?.(result);
    } catch (error) {
      console.error('[MarkdownEditor] Image upload failed:', error);
      handleChange(withPlaceholder.replace(UPLOAD_PLACEHOLDER, ''));
    } finally {
      setUploading(false);
    }
  };

  useLayoutEffect(() => {
    const toolbar = toolbarRef.current;
    const dotsWrapper = dotsWrapperRef.current;
    if (!toolbar || !dotsWrapper) return;
    const measure = () => {
      const toolbarRect = toolbar.getBoundingClientRect();
      if (toolbarRect.width === 0) return;
      const available = toolbarRect.width - dotsWrapper.getBoundingClientRect().width;
      if (itemRightsRef.current.length === 0) {
        itemRightsRef.current = (Array.from(toolbar.children) as HTMLElement[])
          .filter(element => element !== dotsWrapper)
          .map(element => element.getBoundingClientRect().right - toolbarRect.left);
      }
      let count = itemRightsRef.current.length;
      for (let index = 0; index < itemRightsRef.current.length; index++) {
        if (itemRightsRef.current[index] > available) {
          count = index;
          break;
        }
      }
      setVisibleCount(count);
    };
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(toolbar);
    measure();
    return () => resizeObserver.disconnect();
  }, []);

  const allTools: (MarkdownTool | null)[] = [
    { icon: <IconH1 size={14} />, label: 'Heading 1', action: () => prependLines('# ') },
    { icon: <IconH2 size={14} />, label: 'Heading 2', action: () => prependLines('## ') },
    null,
    { icon: <IconBold size={14} />, label: 'Bold', action: () => wrap('**', '**', 'bold text') },
    { icon: <IconItalic size={14} />, label: 'Italic', action: () => wrap('*', '*', 'italic text') },
    null,
    { icon: <IconCode size={14} />, label: 'Inline code', action: () => wrap('`', '`', 'code') },
    { icon: <IconLink size={14} />, label: 'Link', action: () => wrap('[', '](url)', 'link text') },
    null,
    { icon: <IconList size={14} />, label: 'Unordered list', action: () => prependLines('- ') },
    { icon: <IconListNumbers size={14} />, label: 'Ordered list', action: () => prependLines('1. ') },
    null,
    { icon: <IconStrikethrough size={14} />, label: 'Strikethrough', action: () => wrap('~~', '~~', 'struck text') },
    { icon: <IconBlockquote size={14} />, label: 'Quote', action: () => prependLines('> ') },
    null,
    { icon: <IconMinus size={14} />, label: 'Horizontal rule', action: () => insert('\n\n---\n\n') },
    ...(uploadEndpoint ? [
      null,
      { icon: <IconPhoto size={14} />, label: 'Insert image', loading: uploading, action: () => imageUploadRef.current?.open() },
      { icon: <IconCamera size={14} />, label: 'Capture image', loading: uploading, action: () => cameraRef.current?.open() },
      { icon: <IconFolderOpen size={14} />, label: 'Insert from album', action: () => albumPickerRef.current?.open() },
    ] as (MarkdownTool | null)[] : []),
  ];
  // The ref-backed actions are intentionally retained in the tool definitions.
  // eslint-disable-next-line react-hooks/refs
  const allVisible = allTools.slice(0, visibleCount);
  // eslint-disable-next-line react-hooks/refs
  const allOverflow = allTools.slice(visibleCount);
  let visibleEnd = allVisible.length - 1;
  while (visibleEnd >= 0 && allVisible[visibleEnd] === null) visibleEnd--;
  let overflowStart = 0;
  while (overflowStart < allOverflow.length && allOverflow[overflowStart] === null) overflowStart++;

  const normalizeAlbumPath = (path: string) => {
    try {
      const url = new URL(path);
      return url.pathname.startsWith(IMAGE_PREFIX) ? url.pathname + url.search + url.hash : path;
    } catch {
      return path;
    }
  };

  return {
    text, tab, uploading, disabled, placeholder, minRows, maxHeight, uploadEndpoint,
    visibleTools: allVisible.slice(0, visibleEnd + 1),
    overflowTools: allOverflow.slice(overflowStart),
    hasOverflow: allOverflow.slice(overflowStart).some(tool => tool !== null),
    textareaRef, toolbarRef, dotsWrapperRef, imageUploadRef, cameraRef, albumPickerRef,
    setTab, handleChange, mutate, handleImageFile, insert, safeAlt, normalizeAlbumPath,
  };
}
