import { createContext, useContext } from 'react';
import type { MarkdownEditorContextValue } from './types';

export const MarkdownEditorContext = createContext<MarkdownEditorContextValue | null>(null);

export function useMarkdownEditorContext(): MarkdownEditorContextValue {
  const context = useContext(MarkdownEditorContext);
  if (!context) {
    throw new Error('Markdown editor components must be rendered inside MarkdownEditor.');
  }
  return context;
}
