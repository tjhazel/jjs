import type { InputWrapperProps } from '@mantine/core';
import type { ReactNode, RefObject } from 'react';
import type { CameraCaptureHandle } from '../CameraCapture';
import type { ImageUploadHandle } from '../ImageUpload';
import type { AlbumImagePickerHandle } from '../AlbumImagePicker';

export type MarkdownEditorTab = 'write' | 'preview';

export interface MarkdownEditorProps extends Omit<InputWrapperProps, 'children' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  maxHeight?: string | number;
  disabled?: boolean;
  uploadEndpoint?: string;
  fileNameHint?: () => string;
  onImageUploaded?: (result: { url: string; fileName: string }) => void;
}

export interface MarkdownTool {
  icon: ReactNode;
  label: string;
  action: () => void;
  loading?: boolean;
}

export interface MarkdownEditorContextValue {
  text: string;
  tab: MarkdownEditorTab;
  uploading: boolean;
  disabled: boolean;
  placeholder: string;
  minRows: number;
  maxHeight?: string | number;
  uploadEndpoint?: string;
  visibleTools: (MarkdownTool | null)[];
  overflowTools: (MarkdownTool | null)[];
  hasOverflow: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  toolbarRef: RefObject<HTMLDivElement | null>;
  dotsWrapperRef: RefObject<HTMLDivElement | null>;
  imageUploadRef: RefObject<ImageUploadHandle | null>;
  cameraRef: RefObject<CameraCaptureHandle | null>;
  albumPickerRef: RefObject<AlbumImagePickerHandle | null>;
  setTab: (tab: MarkdownEditorTab) => void;
  handleChange: (value: string) => void;
  mutate: (fn: (text: string, selection: [number, number]) => { next: string; cursor: [number, number] }) => void;
  handleImageFile: (file: File, isPaste?: boolean) => Promise<void>;
  insert: (snippet: string) => void;
  safeAlt: (name: string) => string;
  normalizeAlbumPath: (path: string) => string;
}
