import { useState } from 'react';
import { Link } from 'react-router';
import { Table, Group, Text, Button, Select, Stack, Center, Loader, Card, Badge, Anchor, ActionIcon, Tooltip } from '@mantine/core';
import { IconChevronUp, IconChevronDown, IconSelector, IconExternalLink, IconUserX, IconBan } from '@tabler/icons-react';
import { formatDate } from '@lib/time.functions';
import type { UserSummary } from '@api/user/user';
import InlineAlert from '@components/ui/InlineAlert';

interface ManageUsersProps {
   users: UserSummary[] | undefined;
   isLoading: boolean;
   onToggleBlock: (user: UserSummary) => Promise<void>;
}

type SortKey = 'displayName' | 'email' | 'role' | 'commentCount' | 'lastCommentDate' | 'lastActivityDate' | 'blocked';

function getUserStatus(user: UserSummary) {
   if (user.blocked) return { label: 'Blocked', color: 'red' };
   if (user.isDisabled) return { label: 'Disabled', color: 'gray' };
   return { label: 'Active', color: 'green' };
}

export default function ManageUsers({ users, isLoading, onToggleBlock }: ManageUsersProps) {
   const [sortBy, setSortBy] = useState<SortKey | null>(null);
   const [reverseSortDirection, setReverseSortDirection] = useState(false);
   const [activePage, setActivePage] = useState(1);
   const [pageSize, setPageSize] = useState(10);
   const [loadingEmails, setLoadingEmails] = useState<Set<string>>(new Set());
   const [rowErrors, setRowErrors] = useState<Record<string, string | null>>({});

   if (isLoading) {
      return (
         <Center py="xl">
            <Group gap="sm"><Loader size="sm" type="dots" /><Text c="dimmed">Loading users...</Text></Group>
         </Center>
      );
   }

   if (!users || users.length === 0) {
      return <Center py="xl"><Text c="dimmed">No users found.</Text></Center>;
   }

   const handleToggleBlock = async (user: UserSummary) => {
      setLoadingEmails((prev) => new Set(prev).add(user.email));
      setRowErrors((prev) => ({ ...prev, [user.email]: null }));
      try {
         await onToggleBlock(user);
      } catch (e) {
         setRowErrors((prev) => ({ ...prev, [user.email]: (e as Error).message || 'Action failed.' }));
      } finally {
         setLoadingEmails((prev) => { const next = new Set(prev); next.delete(user.email); return next; });
      }
   };

   const handleSort = (field: SortKey) => {
      if (sortBy === field) {
         setReverseSortDirection((current) => !current);
      } else {
         setSortBy(field);
         setReverseSortDirection(false);
      }
      setActivePage(1);
   };

   const sortedData = [...users].sort((a, b) => {
      if (!sortBy) return 0;

      if (sortBy === 'commentCount') {
         return reverseSortDirection ? b.commentCount - a.commentCount : a.commentCount - b.commentCount;
      }
      if (sortBy === 'lastCommentDate') {
         const valA = a.lastCommentDate ? new Date(a.lastCommentDate).getTime() : 0;
         const valB = b.lastCommentDate ? new Date(b.lastCommentDate).getTime() : 0;
         return reverseSortDirection ? valB - valA : valA - valB;
      }
      if (sortBy === 'lastActivityDate') {
         return reverseSortDirection
            ? new Date(b.lastActivityDate).getTime() - new Date(a.lastActivityDate).getTime()
            : new Date(a.lastActivityDate).getTime() - new Date(b.lastActivityDate).getTime();
      }
      if (sortBy === 'blocked') {
         return reverseSortDirection ? Number(b.blocked) - Number(a.blocked) : Number(a.blocked) - Number(b.blocked);
      }

      const valA = String(a[sortBy] ?? '');
      const valB = String(b[sortBy] ?? '');
      return reverseSortDirection ? valB.localeCompare(valA) : valA.localeCompare(valB);
   });

   const totalPages = Math.ceil(sortedData.length / pageSize);
   const paginatedData = sortedData.slice((activePage - 1) * pageSize, activePage * pageSize);

   const renderTh = (field: SortKey, label: string) => {
      const isCurrent = sortBy === field;
      return (
         <Table.Th onClick={() => handleSort(field)} style={{ cursor: 'pointer' }}>
            <Group justify="space-between" wrap="nowrap">
               <Text size="sm" fw={600} c="dark.9">{label}</Text>
               <Center>
                  {!isCurrent && <IconSelector size={16} stroke={1.5} color="var(--mantine-color-gray-4)" />}
                  {isCurrent && (reverseSortDirection ? <IconChevronDown size={16} stroke={1.5} /> : <IconChevronUp size={16} stroke={1.5} />)}
               </Center>
            </Group>
         </Table.Th>
      );
   };

   const renderLastCommentLink = (user: UserSummary) => {
      if (!user.lastCommentId || !user.lastCommentPostId) return <Text size="sm" c="dimmed">—</Text>;
      return (
         <Group gap={4} wrap="nowrap">
            <Text size="sm">{formatDate(user.lastCommentDate!)}</Text>
            <Anchor
               component={Link}
               to={`/post/${user.lastCommentPostId}#comment-${user.lastCommentId}`}
               onClick={(e) => e.stopPropagation()}
               title={user.lastCommentPostTitle ?? 'View comment'}
               style={{ display: 'flex', alignItems: 'center' }}
            >
               <IconExternalLink size={13} />
            </Anchor>
         </Group>
      );
   };

   const renderBlockToggle = (user: UserSummary) => {
      const isAdmin = user.role === 'Admin';
      const isLoading = loadingEmails.has(user.email);

      if (isAdmin) {
         return (
            <Tooltip label="Admin users must be manually blocked" withArrow>
               <ActionIcon variant="subtle" color="gray" size="sm" disabled>
                  <IconBan size={15} />
               </ActionIcon>
            </Tooltip>
         );
      }

      return (
         <Tooltip label={user.blocked ? 'Unblock user' : 'Block user'} withArrow>
            <ActionIcon
               variant="subtle"
               color={user.blocked ? 'orange' : 'red'}
               size="sm"
               loading={isLoading}
               onClick={(e) => { e.stopPropagation(); handleToggleBlock(user); }}
            >
               {user.blocked ? <IconBan size={15} /> : <IconUserX size={15} />}
            </ActionIcon>
         </Tooltip>
      );
   };

   return (
      <Stack gap="xl" w="100%">
         <Table.ScrollContainer minWidth={820} visibleFrom="sm">
            <Table variant="simple" layout="fixed" highlightOnHover withTableBorder>
               <Table.Thead>
                  <Table.Tr>
                     {renderTh('displayName', 'Name')}
                     {renderTh('email', 'Email')}
                     {renderTh('role', 'Role')}
                     {renderTh('blocked', 'Status')}
                     {renderTh('commentCount', 'Comments')}
                     {renderTh('lastCommentDate', 'Last Comment')}
                     {renderTh('lastActivityDate', 'Last Active')}
                     <Table.Th style={{ width: 48 }} />
                  </Table.Tr>
               </Table.Thead>
               <Table.Tbody>
                  {paginatedData.map((user) => {
                     const status = getUserStatus(user);
                     return (
                        <Table.Tr key={user.email}>
                           <Table.Td>
                              <Stack gap={2}>
                                 <Text size="sm" truncate fw={500}>{user.displayName}</Text>
                                 {rowErrors[user.email] && (
                                    <InlineAlert message={rowErrors[user.email]} onClose={() => setRowErrors((prev) => ({ ...prev, [user.email]: null }))} />
                                 )}
                              </Stack>
                           </Table.Td>
                           <Table.Td><Text size="sm" truncate c="gray.6">{user.email}</Text></Table.Td>
                           <Table.Td>
                              <Badge color={user.role === 'Admin' ? 'blue' : 'gray'} radius="none" variant="light" size="sm">
                                 {user.role}
                              </Badge>
                           </Table.Td>
                           <Table.Td>
                              <Badge color={status.color} radius="none" variant="light" size="sm">
                                 {status.label}
                              </Badge>
                           </Table.Td>
                           <Table.Td><Text size="sm">{user.commentCount.toLocaleString()}</Text></Table.Td>
                           <Table.Td>{renderLastCommentLink(user)}</Table.Td>
                           <Table.Td><Text size="sm">{formatDate(user.lastActivityDate)}</Text></Table.Td>
                           <Table.Td onClick={(e) => e.stopPropagation()}>
                              {renderBlockToggle(user)}
                           </Table.Td>
                        </Table.Tr>
                     );
                  })}
               </Table.Tbody>
            </Table>
         </Table.ScrollContainer>

         {/* Mobile Stack View */}
         <Stack gap="sm" hiddenFrom="sm">
            {paginatedData.map((user) => {
               const status = getUserStatus(user);
               return (
                  <Card key={user.email} withBorder padding="md" radius="none">
                     <Group justify="space-between" align="flex-start" mb="xs">
                        <Text fw={600} size="md" c="dark.9">{user.displayName}</Text>
                        {renderBlockToggle(user)}
                     </Group>
                     {rowErrors[user.email] && (
                        <InlineAlert message={rowErrors[user.email]} onClose={() => setRowErrors((prev) => ({ ...prev, [user.email]: null }))} />
                     )}
                     <Stack gap={4}>
                        <Text size="sm" c="gray.7"><strong>Email:</strong> {user.email}</Text>
                        <Group gap="xs">
                           <Text size="sm" c="gray.7"><strong>Role:</strong></Text>
                           <Badge color={user.role === 'Admin' ? 'blue' : 'gray'} radius="none" size="xs" variant="light">{user.role}</Badge>
                        </Group>
                        <Group gap="xs">
                           <Text size="sm" c="gray.7"><strong>Status:</strong></Text>
                           <Badge color={status.color} radius="none" size="xs" variant="light">{status.label}</Badge>
                        </Group>
                        <Text size="sm" c="gray.7"><strong>Comments:</strong> {user.commentCount.toLocaleString()}</Text>
                        {user.lastCommentId && user.lastCommentPostId ? (
                           <Group gap={4}>
                              <Text size="sm" c="gray.7"><strong>Last Comment:</strong> {formatDate(user.lastCommentDate!)}</Text>
                              <Anchor
                                 component={Link}
                                 to={`/post/${user.lastCommentPostId}#comment-${user.lastCommentId}`}
                                 title={user.lastCommentPostTitle ?? 'View comment'}
                              >
                                 <IconExternalLink size={13} />
                              </Anchor>
                           </Group>
                        ) : (
                           <Text size="sm" c="gray.7"><strong>Last Comment:</strong> —</Text>
                        )}
                        <Text size="sm" c="gray.7"><strong>Last Active:</strong> {formatDate(user.lastActivityDate)}</Text>
                     </Stack>
                  </Card>
               );
            })}
         </Stack>

         {/* Pagination Footer */}
         <Group justify="space-between" align="center" wrap="wrap" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
            <Text size="sm" c="dimmed">Page {activePage} of {totalPages || 1}</Text>
            <Group gap="xs">
               <Button variant="default" size="xs" radius="none" disabled={activePage === 1} onClick={() => setActivePage((prev) => Math.max(prev - 1, 1))}>Previous</Button>
               <Button variant="default" size="xs" radius="none" disabled={activePage >= totalPages} onClick={() => setActivePage((prev) => Math.min(prev + 1, totalPages))}>Next</Button>
            </Group>
            <Group gap="xs">
               <Text size="sm" c="dimmed">Per page:</Text>
               <Select size="xs" w={80} radius="none" value={String(pageSize)} onChange={(val) => { setPageSize(Number(val)); setActivePage(1); }} data={['5', '10', '20', '30', '40', '50']} allowDeselect={false} />
            </Group>
         </Group>
      </Stack>
   );
}
