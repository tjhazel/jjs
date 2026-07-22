import { Container, Breadcrumbs, Anchor, Text } from '@mantine/core';
import { Outlet, Link, useLocation, useSearchParams } from 'react-router';

interface Crumb { label: string; href?: string; }

function getBreadcrumbs(pathname: string, searchParams: URLSearchParams): Crumb[] {
  if (pathname === '/admin') return [];

  if (pathname === '/admin/posts') return [
    { label: 'Administration', href: '/admin' },
    { label: 'Posts' },
  ];

  if (pathname.startsWith('/admin/post/')) {
    const id = pathname.split('/')[3];
    const bp = new URLSearchParams();
    const cat = searchParams.get('category');
    const status = searchParams.get('status');
    if (cat) bp.set('category', cat);
    if (status) bp.set('status', status);
    const qs = bp.toString();
    return [
      { label: 'Administration', href: '/admin' },
      { label: 'Posts', href: qs ? `/admin/posts?${qs}` : '/admin/posts' },
      { label: id === 'new' ? 'New Post' : 'Edit Post' },
    ];
  }

  if (pathname === '/admin/recipes') return [
    { label: 'Administration', href: '/admin' },
    { label: 'Recipes' },
  ];

  if (pathname.startsWith('/admin/recipe/')) {
    const id = pathname.split('/')[3];
    return [
      { label: 'Administration', href: '/admin' },
      { label: 'Recipes', href: '/admin/recipes' },
      { label: id === 'new' ? 'New Recipe' : 'Edit Recipe' },
    ];
  }

  if (pathname === '/admin/users') return [
    { label: 'Administration', href: '/admin' },
    { label: 'Users' },
  ];

  if (pathname === '/admin/album') return [
    { label: 'Administration', href: '/admin' },
    { label: 'Album' },
  ];

  if (pathname === '/admin/comments') return [
    { label: 'Administration', href: '/admin' },
    { label: 'Comments' },
  ];

  return [];
}

export function AdminPageLayout() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const crumbs = getBreadcrumbs(pathname, searchParams);

  return (
     <Container size="xl" py="sm" px={0}>
      {crumbs.length > 0 && (
        <Breadcrumbs fz="xs" mb="xs">
          {crumbs.map((item, i) => {
            const isLast = i === crumbs.length - 1;
            return isLast || !item.href
              ? <Text key={i} size="xs" c="dimmed">{item.label}</Text>
              : <Anchor key={i} component={Link} to={item.href} size="xs" c="dimmed">{item.label}</Anchor>;
          })}
        </Breadcrumbs>
      )}
      <Outlet />
    </Container>
  );
}
