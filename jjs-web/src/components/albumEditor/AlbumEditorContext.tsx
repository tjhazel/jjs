import React, { createContext, useContext } from 'react';
import type { Folder } from '@api/album/album-models';

export type FileState = {
  id: string;
  file: File;
  previewUrl: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress?: number;
  message?: string;
};

export type AlbumData = {
  data?: any;
  isLoading: boolean;
  albumError?: string | null;
};

export type AlbumEditorContextValue = {
  // api/album data
  data?: any;
  isLoading: boolean;
  albumError?: string | null;
  currentFolder?: Folder | undefined;
  crumbs: string[];
  displayTarget: string;
  uploadTarget: string;

  // folder state
  currentPath?: string | undefined;
  setCurrentPath: (p?: string) => void;
  newFolderName: string;
  setNewFolderName: (v: string) => void;
  creatingFolder: boolean;
  folderError: string | null;
  folderSuccess: string | null;

  // upload state
  fileStates: FileState[];
  setFileStates: (s: FileState[] | ((prev: FileState[]) => FileState[])) => void;
  dragOver: boolean;
  setDragOver: (b: boolean) => void;
  uploading: boolean;
  uploadStatus: { msg: string; ok: boolean } | null;

  // refs
  fileInputRef: React.RefObject<HTMLInputElement>;

  // actions
  handleFilesSelect: (files: FileList | File[]) => void;
  removeFileAt: (index: number) => void;
  clearAllFiles: () => void;
  handleUpload: () => Promise<void>;
  handleCreateFolder: () => Promise<void>;

  // utilities
  formatBytes: (n: number) => string;
};

const AlbumEditorContext = createContext<AlbumEditorContextValue | undefined>(undefined);

export function useAlbumEditorContext() {
  const ctx = useContext(AlbumEditorContext);
  if (!ctx) throw new Error('useAlbumEditorContext must be used within AlbumEditorProvider');
  return ctx;
}

export default AlbumEditorContext;
