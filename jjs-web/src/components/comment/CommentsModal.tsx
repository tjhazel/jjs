import React, { useState, useMemo } from 'react';
import { Modal, Table, Text, Group, Stack, Badge, ActionIcon, Tooltip, Box, Center, Loader, Divider, Popover, TextInput, Button } from '@mantine/core';
import { IconEye, IconEyeOff, IconUserX, IconBan, IconChevronUp, IconChevronDown } from '@tabler/icons-react';
import { useAllComments, hideComment, unhideComment } from '@api/comment/comment-fetcher';
import { blockUser, unblockUser } from '@api/user/user-fetcher';
import { mutateKeysLike } from '@lib/swr.functions';
import { useApiContext } from '@api/ApiContext';
import { formatDate } from '@lib/time.functions';
import type { CommentSummary } from '@api/comment/comment';
import InlineAlert from '@components/ui/InlineAlert';

interface PostGroup {
   postFk: number;
   postTitle: string;
   comments: CommentSummary[];
}

interface CommentsModalProps {
   opened: boolean;
   onClose: () => void;
   title?: string;
   email?: string;
   postId?: number;
}

export default function CommentsModal({ opened, onClose, title = 'Comments', email, postId }: CommentsModalProps) {
   const { httpGet, httpPatch } = useApiContext();
   const { data: comments, isLoading, error } = useAllComments(httpGet, { email, postId });
   const [expandedPostIds, setExpandedPostIds] = useState<Set<number>>(new Set());
   const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
   const [rowErrors, setRowErrors] = useState<Record<number, string | null>>({});
   const [hidePopoverOpenId, setHidePopoverOpenId] = useState<number | null>(null);
   const [pendingScreenResult, setPendingScreenResult] = useState('');

   const groups = useMemo<PostGroup[]>(() => {
      if (!comments) return [];
      const map = new Map<number, PostGroup>();
      for (const c of comments) {
         if (!map.has(c.postFk)) {
            map.set(c.postFk, { postFk: c.postFk, postTitle: c.postTitle, comments: [] });
         }
         map.get(c.postFk)!.comments.push(c);
      }
      return Array.from(map.values());
   }, [comments]);

   const togglePost = (postFk: number) =>
      setExpandedPostIds(prev => {
         const s = new Set(prev);
         s.has(postFk) ? s.delete(postFk) : s.add(postFk);
         return s;
      });

   const setLoading = (id: number, on: boolean) =>
      setLoadingIds(prev => { const s = new Set(prev); on ? s.add(id) : s.delete(id); return s; });

   const clearError = (id: number) => setRowErrors(prev => ({ ...prev, [id]: null }));

   const withLoading = async (id: number, fn: () => Promise<void>) => {
      clearError(id);
      setLoading(id, true);
      try {
         await fn();
      } catch (e) {
         setRowErrors(prev => ({ ...prev, [id]: (e as Error).message || 'Action failed.' }));
      } finally {
         setLoading(id, false);
      }
   };

   const handleHide = (c: CommentSummary, screenResult?: string) =>
      withLoading(c.commentId, () => hideComment(httpPatch, c.commentId, screenResult));

   const handleUnhide = (c: CommentSummary) =>
      withLoading(c.commentId, () => unhideComment(httpPatch, c.commentId));

   const handleBan = (c: CommentSummary) =>
      withLoading(c.commentId, async () => {
         await blockUser(httpPatch, c.authorEmail!, `comment on post ${c.postFk}`);
         mutateKeysLike('api/comment/getall');
      });

   const handleUnban = (c: CommentSummary) =>
      withLoading(c.commentId, async () => {
         await unblockUser(httpPatch, c.authorEmail!);
         mutateKeysLike('api/comment/getall');
      });

   const renderCommentActions = (c: CommentSummary) => (
      <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
         {c.adminHidden ? (
            <Tooltip label="Unhide comment" withArrow>
               <ActionIcon
                  variant="subtle"
                  color="blue"
                  size="sm"
                  loading={loadingIds.has(c.commentId)}
                  onClick={() => handleUnhide(c)}
               >
                  <IconEye size={15} />
               </ActionIcon>
            </Tooltip>
         ) : (
            <Popover
               opened={hidePopoverOpenId === c.commentId}
               onClose={() => setHidePopoverOpenId(null)}
               withArrow
               position="bottom-end"
            >
               <Popover.Target>
                  <ActionIcon
                     variant="subtle"
                     color="orange"
                     size="sm"
                     loading={loadingIds.has(c.commentId)}
                     onClick={() => { setPendingScreenResult(''); setHidePopoverOpenId(c.commentId); }}
                  >
                     <IconEyeOff size={15} />
                  </ActionIcon>
               </Popover.Target>
               <Popover.Dropdown>
                  <Stack gap="xs">
                     <TextInput
                        label="Hide reason"
                        placeholder="Optional..."
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
                        <Button size="compact-xs" color="orange" onClick={() => { handleHide(c, pendingScreenResult || undefined); setHidePopoverOpenId(null); }}>
                           Hide
                        </Button>
                     </Group>
                  </Stack>
               </Popover.Dropdown>
            </Popover>
         )}
         {c.authorEmail && (
            <Tooltip label={c.authorBlocked ? 'Unban user' : 'Ban user'} withArrow>
               <ActionIcon
                  variant="subtle"
                  color={c.authorBlocked ? 'orange' : 'red'}
                  size="sm"
                  loading={loadingIds.has(c.commentId)}
                  onClick={() => c.authorBlocked ? handleUnban(c) : handleBan(c)}
               >
                  {c.authorBlocked ? <IconBan size={15} /> : <IconUserX size={15} />}
               </ActionIcon>
            </Tooltip>
         )}
      </Group>
   );

   const renderCommentList = (group: PostGroup) => (
      <Box
         style={{
            backgroundColor: 'var(--mantine-color-gray-0)',
            borderTop: '1px solid var(--mantine-color-gray-2)',
         }}
      >
         {group.comments.map((c, idx) => (
            <React.Fragment key={c.commentId}>
               {idx > 0 && <Divider color="gray.2" />}
               <Box px="md" py="sm" pos="relative" style={{ opacity: c.adminHidden ? 0.6 : 1 }}>
                  <Group justify="space-between" align="flex-start" gap="md" wrap="nowrap">
                     <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
                        <Group gap="xs" wrap="nowrap">
                           {c.adminHidden && (
                              <Badge color="orange" size="xs" radius="none" variant="light" style={{ flexShrink: 0 }}>Hidden</Badge>
                           )}
                           {c.authorBlocked && (
                              <Badge color="red" size="xs" radius="none" variant="light" style={{ flexShrink: 0 }}>Blocked</Badge>
                           )}
                           <Text size="sm" fw={500} truncate>{c.title}</Text>
                        </Group>
                        <Text size="xs" c="dimmed">
                           {c.authorName}
                           {c.authorEmail && <> · {c.authorEmail}</>}
                           {' · '}{formatDate(c.createdDate)}
                        </Text>
                        <Text size="sm" mt={2} style={{ whiteSpace: 'pre-wrap' }}>{c.entryText}</Text>
                        {c.adminHidden && c.screenedBy && (
                           <Text size="xs" c="orange.6">
                              Screened by {c.screenedBy}{c.hiddenDate ? ` on ${formatDate(c.hiddenDate)}` : ''}{c.screenResult ? ` · ${c.screenResult}` : ''}
                           </Text>
                        )}
                        {rowErrors[c.commentId] && (
                           <InlineAlert message={rowErrors[c.commentId]} onClose={() => clearError(c.commentId)} />
                        )}
                     </Stack>
                     {renderCommentActions(c)}
                  </Group>
               </Box>
            </React.Fragment>
         ))}
      </Box>
   );

   return (
      <Modal
         opened={opened}
         onClose={onClose}
         title={<Text fw={600} size="md">{title}</Text>}
         size="90%"
         radius="none"
         styles={{
            header: {
               borderBottom: '1px solid var(--mantine-color-gray-3)',
               marginBottom: 0,
               paddingBottom: 'var(--mantine-spacing-sm)',
            },
            body: { padding: 0 },
         }}
      >
         {isLoading && (
            <Center py="xl">
               <Group gap="sm">
                  <Loader size="sm" type="dots" />
                  <Text c="dimmed" size="sm">Loading comments…</Text>
               </Group>
            </Center>
         )}

         {error && (
            <Box p="md">
               <Text c="red" size="sm">{error}</Text>
            </Box>
         )}

         {!isLoading && !error && groups.length === 0 && (
            <Center py="xl">
               <Text c="dimmed" size="sm">No comments found.</Text>
            </Center>
         )}

         {!isLoading && !error && groups.length > 0 && (
            <Table.ScrollContainer minWidth={500}>
               <Table variant="simple" withTableBorder>
                  <Table.Thead>
                     <Table.Tr>
                        <Table.Th><Text size="sm" fw={600} c="dark.9">Post</Text></Table.Th>
                        <Table.Th style={{ width: 110 }}><Text size="sm" fw={600} c="dark.9">Comments</Text></Table.Th>
                        <Table.Th style={{ width: 40 }} />
                     </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                     {groups.map((group) => {
                        const isExpanded = expandedPostIds.has(group.postFk);
                        return (
                           <React.Fragment key={group.postFk}>
                              <Table.Tr
                                 style={{ cursor: 'pointer' }}
                                 onClick={() => togglePost(group.postFk)}
                              >
                                 <Table.Td>
                                    <Text size="sm" fw={500}>{group.postTitle}</Text>
                                 </Table.Td>
                                 <Table.Td>
                                    <Text size="sm" c="dimmed">
                                       {group.comments.length} {group.comments.length === 1 ? 'comment' : 'comments'}
                                    </Text>
                                 </Table.Td>
                                 <Table.Td>
                                    <ActionIcon variant="subtle" color="gray" size="sm">
                                       {isExpanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                                    </ActionIcon>
                                 </Table.Td>
                              </Table.Tr>

                              {isExpanded && (
                                 <Table.Tr>
                                    <Table.Td colSpan={3} style={{ padding: 0 }}>
                                       {renderCommentList(group)}
                                    </Table.Td>
                                 </Table.Tr>
                              )}
                           </React.Fragment>
                        );
                     })}
                  </Table.Tbody>
               </Table>
            </Table.ScrollContainer>
         )}
      </Modal>
   );
}
