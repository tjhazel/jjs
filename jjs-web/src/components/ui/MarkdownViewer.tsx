import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
      remarkPlugins={[remarkGfm]}
      components={{
        ...components,
        img({ src, alt, ...rest }) {
          const pipeIndex = (alt ?? '').lastIndexOf('|');
          const sizeHint = pipeIndex !== -1 ? Number((alt ?? '').slice(pipeIndex + 1)) : NaN;
          const width = !isNaN(sizeHint) && sizeHint > 0 ? sizeHint : undefined;
          const cleanAlt = width !== undefined ? (alt ?? '').slice(0, pipeIndex) : (alt ?? '');
          return <img src={resolveImageSrc(src)} alt={cleanAlt} {...rest} style={{ maxWidth: '100%', width }} />;
        },
      }}
    >
      {children}
    </Markdown>
  );
}
