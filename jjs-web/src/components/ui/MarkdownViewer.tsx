import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import config from '@lib/config';
import { IMAGE_PREFIX } from '@api/album/album-models';

interface MarkdownViewerProps {
  children: string;
  /** Pass extra react-markdown component overrides (e.g. custom link renderer). Image is always handled internally. */
  components?: Omit<Components, 'img'>;
}

// Prepend the API base URL to attachment paths so they resolve correctly when
// the UI is served from a sub-path (e.g. /ui/) on the same IIS host as the API.
// Also map album image logical paths (IMAGE_PREFIX) to the API host so images
// inserted as `/Image/...` load correctly.
function resolveImageSrc(src?: string): string {
  if (!src) return '';

  // If it's an absolute URL, parse it and decide whether to rewrite to the
  // configured API host (for paths that belong to the album or API).
  try {
    const u = new URL(src);
    const p = u.pathname + (u.search || '') + (u.hash || '');
    if (p.startsWith('/api/') || p.toLowerCase().startsWith(IMAGE_PREFIX.toLowerCase())) {
      return `${config.apiUrl}${p}`;
    }
    // External absolute URL — leave as-is.
    return src;
  } catch (e) {
    // Not an absolute URL — treat as a root-relative or relative path.
    if (src.startsWith('/api/') || src.toLowerCase().startsWith(IMAGE_PREFIX.toLowerCase())) {
      return `${config.apiUrl}${src}`;
    }
    return src;
  }
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
          const cleanAlt = width !== undefined ? (alt ?? '').slice(0, pipeIndex).trim() : (alt ?? '');
          return <img src={resolveImageSrc(src)} alt={cleanAlt} {...rest} style={{ maxWidth: '100%', width }} />;
        },
      }}
    >
      {children}
    </Markdown>
  );
}
