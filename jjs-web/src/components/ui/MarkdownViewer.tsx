import Markdown, { type Components } from 'react-markdown';
import config from '@lib/config';

interface MarkdownViewerProps {
  children: string;
  /** Pass extra react-markdown component overrides (e.g. custom link renderer). Image is always handled internally. */
  components?: Omit<Components, 'img'>;
}

// Prepend the API base URL to attachment paths so they resolve correctly when
// the UI is served from a sub-path (e.g. /ui/) on the same IIS host as the API.
function resolveImageSrc(src?: string): string {
  if (!src) return '';
  if (src.startsWith('/api/')) return `${config.apiUrl}${src}`;
  return src;
}

export default function MarkdownViewer({ children, components }: MarkdownViewerProps) {
  return (
    <Markdown
      components={{
        ...components,
        img({ src, alt, ...rest }) {
          return <img src={resolveImageSrc(src)} alt={alt ?? ''} {...rest} style={{ maxWidth: '100%' }} />;
        },
      }}
    >
      {children}
    </Markdown>
  );
}
