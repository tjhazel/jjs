import React, { useMemo, useState } from 'react';
import {
  Table, Text, Group, Stack, Badge, ActionIcon, Tooltip, Center,
  Loader, Popover, TextInput, Button, Select, UnstyledButton,
} from '@mantine/core';
import { Link } from 'react-router';
import {
  IconEye, IconEyeOff, IconUserX, IconBan,
  IconChevronUp, IconChevronDown, IconSelector,
} from '@tabler/icons-react';
import { formatDate } from '@lib/time.functions';
import InlineAlert from '@components/ui/InlineAlert';
import type { CommentSummary } from '@api/comment/comment';

type SortKey = 'postTitle' | 'authorName' | 'createdDate' | 'adminHidden';

interface ManageCommentsProps {
  data?: CommentSummary[];
  isLoading: boolean;
  error?: string;
  onHide: (c: CommentSummary, screenResult?: string) => Promise<void>;
  onUnhide: (c: CommentSummary) => Promise<void>;
  onBan: (c: CommentSummary) => Promise<void>;
  onUnban: (c: CommentSummary) => Promise<void>;
}

export default function ManageComments({
  data, isLoading, error, onHide, onUnhide, onBan, onUnban,
}: ManageCommentsProps) {
  const [sortBy, setSortBy] = useState<SortKey>('createdDate');
  const [reverseSortDirection, setReverseSortDirection] = useState(true); // newest first
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState('20');
  const [hidePopoverOpenId, setHidePopoverOpenId] = useState<number | null>(null);
  const [pendingScreenResult, setPendingScreenResult] = useState('');
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [rowErrors, setRowErrors] = useState<Record<number, string | null>>({});

  const setSorting = (field: SortKey) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setPage(1);
  };

  const setLoading = (id: number, on: boolean) =>
    setLoadingIds(prev => { const s = new Set(prev); on ? s.add(id) : s.delete(id); return s; });

  const clearError = (id: number) =>
    setRowErrors(prev => ({ ...prev, [id]: null }));

  const withLoading = async (id: number, fn: () => Promise<void>) => {
    clearError(id);
    setLoading(id, true);
    try {
      await fn();
    } catch (e) {
      setRowErrors(prev => ({ ...prev, [id]: (e as { message?: string }).message ?? 'Action failed.' }));
    } finally {
      setLoading(id, false);
    }
  };

  // ── Sort ───────────────────────────────────────────────────────────────────

  const sorted = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'postTitle':   cmp = a.postTitle.localeCompare(b.postTitle); break;
        case 'authorName':  cmp = a.authorName.localeCompare(b.authorName); break;
        case 'adminHidden': cmp = Number(a.adminHidden) - Number(b.adminHidden); break;
        case 'createdDate':
          cmp = new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
          break;
      }
      return reverseSortDirection ? -cmp : cmp;
    });
  }, [data, sortBy, reverseSortDirection]);

  // ── Pagination ─────────────────────────────────────────────────────────────

  const perPageNum = parseInt(perPage, 10);
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPageNum));
  const paginated = sorted.slice((page - 1) * perPageNum, page * perPageNum);

  // ── Sortable header ────────────────────────────────────────────────────────

  const renderTh = (field: SortKey, label: string, width?: number) => {
    const active = sortBy === field;
    const Icon = !active ? IconSelector : reverseSortDirection ? IconChevronDown : IconChevronUp;
    return (
      <Table.Th style={width ? { width } : undefined}>
        <UnstyledButton onClick={() => setSorting(field)}>
          <Group gap={4} wrap="nowrap">
            <Text size="sm" fw={600} c="dark.9">{label}</Text>
            <Icon size={14} color="var(--mantine-color-gray-6)" />
          </Group>
        </UnstyledButton>
      </Table.Th>
    );
  };

  // ── Actions cell ───────────────────────────────────────────────────────────

  const renderActions = (c: CommentSummary) => (
    <Group gap={4} wrap="nowrap">
      {c.adminHidden ? (
        <Tooltip label="Unhide" withArrow fz="xs">
          <ActionIcon
            variant="subtle" color="blue" size="sm"
            loading={loadingIds.has(c.commentId)}
            onClick={() => withLoading(c.commentId, () => onUnhide(c))}
          >
            <IconEye size={14} />
          </ActionIcon>
        </Tooltip>
      ) : (
        <Popover
          opened={hidePopoverOpenId === c.commentId}
          onClose={() => setHidePopoverOpenId(null)}
          withArrow position="bottom-end"
        >
          <Popover.Target>
            <ActionIcon
              variant="subtle" color="orange" size="sm"
              loading={loadingIds.has(c.commentId)}
              onClick={() => { setPendingScreenResult(''); setHidePopoverOpenId(c.commentId); }}
              aria-label="Hide comment"
            >
              <IconEyeOff size={14} />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack gap="xs">
              <TextInput
                label="Hide reason"
                placeholder="Optional…"
                size="xs"
                value={pendingScreenResult}
                onChange={e => setPendingScreenResult(e.currentTarget.value)}
                style={{ minWidth: 200 }}
                autoFocus
              />
              <Group gap="xs" justify="flex-end">
                <Button size="compact-xs" variant="subtle" onClick={() => setHidePopoverOpenId(null)}>
                  Cancel
                </Button>
                <Button
                  size="compact-xs" color="orange"
                  onClick={() => {
                    withLoading(c.commentId, () => onHide(c, pendingScreenResult || undefined));
                    setHidePopoverOpenId(null);
                  }}
                >
                  Hide
                </Button>
              </Group>
            </Stack>
          </Popover.Dropdown>
        </Popover>
      )}

      {c.authorEmail && (
        <Tooltip label={c.authorBlocked ? 'Unban user' : 'Ban user'} withArrow fz="xs">
          <ActionIcon
            variant="subtle"
            color={c.authorBlocked ? 'orange' : 'red'}
            size="sm"
            loading={loadingIds.has(c.commentId)}
            onClick={() =>
              c.authorBlocked
                ? withLoading(c.commentId, () => onUnban(c))
                : withLoading(c.commentId, () => onBan(c))
            }
          >
            {c.authorBlocked ? <IconBan size={14} /> : <IconUserX size={14} />}
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );

  // ── States ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Center py="xl">
        <Group gap="sm">
          <Loader size="sm" type="dots" />
          <Text size="sm" c="dimmed">Loading comments…</Text>
        </Group>
      </Center>
    );
  }

  if (error) {
    return <Text c="red" size="sm" py="md">{error}</Text>;
  }

  // ── Table ──────────────────────────────────────────────────────────────────

  return (
    <Stack gap="xs">
      <Text size="xs" c="dimmed">{sorted.length} comment{sorted.length !== 1 ? 's' : ''}</Text>

      <Table.ScrollContainer minWidth={860}>
        <Table variant="simple" layout="fixed" highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              {renderTh('postTitle',   'Post',    180)}
              {renderTh('authorName',  'Author',  150)}
              <Table.Th><Text size="sm" fw={600} c="dark.9">Comment</Text></Table.Th>
              {renderTh('createdDate', 'Date',    110)}
              {renderTh('adminHidden', 'Status',  120)}
              <Table.Th style={{ width: 68 }} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginated.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Center py="xl">
                    <Text c="dimmed" size="sm">No comments found.</Text>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : paginated.map(c => (
              <React.Fragment key={c.commentId}>
                <Table.Tr style={{ opacity: c.adminHidden ? 0.7 : 1 }}>

                  {/* Post */}
                  <Table.Td>
                    <Text
                      component={Link}
                      to={`/post/${c.postFk}`}
                      size="xs"
                      c="blue"
                      truncate
                      style={{ display: 'block' }}
                    >
                      {c.postTitle}
                    </Text>
                  </Table.Td>

                  {/* Author */}
                  <Table.Td>
                    <Stack gap={0}>
                      <Text size="xs" fw={500} truncate>{c.authorName}</Text>
                      {c.authorEmail && (
                        <Text size="xs" c="dimmed" truncate>{c.authorEmail}</Text>
                      )}
                    </Stack>
                  </Table.Td>

                  {/* Comment */}
                  <Table.Td>
                    <Stack gap={2}>
                      {c.title && <Text size="xs" fw={500} truncate>{c.title}</Text>}
                      <Text size="xs" lineClamp={2} style={{ wordBreak: 'break-word' }}>
                        {c.entryText}
                      </Text>
                      {rowErrors[c.commentId] && (
                        <InlineAlert
                          message={rowErrors[c.commentId]}
                          onClose={() => clearError(c.commentId)}
                        />
                      )}
                    </Stack>
                  </Table.Td>

                  {/* Date */}
                  <Table.Td>
                    <Text size="xs" c="dimmed">{formatDate(c.createdDate)}</Text>
                  </Table.Td>

                  {/* Status */}
                  <Table.Td>
                    <Group gap={4} wrap="wrap">
                      {c.adminHidden && (
                        <Badge color="orange" size="xs" radius="none" variant="light">Hidden</Badge>
                      )}
                      {c.screenedBy === 'Gemini AI' && (
                        <Badge color="blue" size="xs" radius="none" variant="light">AI</Badge>
                      )}
                      {c.authorBlocked && (
                        <Badge color="red" size="xs" radius="none" variant="light">Banned</Badge>
                      )}
                      {!c.adminHidden && !c.authorBlocked && (
                        <Badge color="teal" size="xs" radius="none" variant="light">Visible</Badge>
                      )}
                    </Group>
                  </Table.Td>

                  {/* Actions */}
                  <Table.Td>{renderActions(c)}</Table.Td>

                </Table.Tr>

                {/* Screening detail row — only shown when hidden */}
                {c.adminHidden && (
                  <Table.Tr>
                    <Table.Td
                      colSpan={6}
                      style={{
                        paddingTop: 0,
                        paddingBottom: 6,
                        background: 'var(--mantine-color-orange-0)',
                        borderTop: 'none',
                      }}
                    >
                      <Group gap="xl" px="xs">
                        <Group gap={4}>
                          <Text size="xs" c="dimmed" fw={500}>Screened by</Text>
                          <Text size="xs">{c.screenedBy ?? '—'}</Text>
                        </Group>
                        <Group gap={4}>
                          <Text size="xs" c="dimmed" fw={500}>Hidden</Text>
                          <Text size="xs">{c.hiddenDate ? formatDate(c.hiddenDate) : '—'}</Text>
                        </Group>
                        <Group gap={4}>
                          <Text size="xs" c="dimmed" fw={500}>Reason</Text>
                          <Text size="xs">{c.screenResult || '—'}</Text>
                        </Group>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                )}
              </React.Fragment>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {/* Pagination footer */}
      <Group justify="space-between" align="center" px={2}>
        <Text size="xs" c="dimmed">
          {sorted.length === 0
            ? 'No comments'
            : `${(page - 1) * perPageNum + 1}–${Math.min(page * perPageNum, sorted.length)} of ${sorted.length}`}
        </Text>
        <Group gap="xs" align="center">
          <Select
            size="xs" w={70}
            value={perPage}
            onChange={v => { setPerPage(v ?? '20'); setPage(1); }}
            data={['10', '20', '30', '50']}
            allowDeselect={false}
          />
          <Button size="xs" variant="default" radius="none"
            disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Prev
          </Button>
          <Text size="xs" c="dimmed">{page} / {totalPages}</Text>
          <Button size="xs" variant="default" radius="none"
            disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            Next
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
