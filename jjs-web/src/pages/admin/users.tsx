import { Stack, Group, Title, Text, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useUsers, blockUser, unblockUser, setUserRole } from '@api/user/user-fetcher';
import { useApiContext } from '@api/ApiContext';
import type { UserSummary } from '@api/user/user';
import ManageUsers from '@components/user/ManageUsers';

export default function ManageUsersPage() {
   const { httpGet, httpPatch } = useApiContext();
   const { data: users, error, isLoading } = useUsers(httpGet);

   const handleToggleBlock = async (user: UserSummary) => {
      if (user.blocked) {
         await unblockUser(httpPatch, user.email);
      } else {
         await blockUser(httpPatch, user.email, 'Admin blocked user');
      }
   };

   const handleSetRole = async (user: UserSummary, role: string) => {
      await setUserRole(httpPatch, user.email, role);
   };

   return (
      <Stack gap="sm">

         <Group justify="space-between" align="center">
            <Stack gap={2}>
               <Title order={1} size="h3" fw={600} lh="sm">
                  Users
               </Title>
               <Text size="xs" c="dimmed">
                  View registered users, comment activity, and account status.
               </Text>
            </Stack>
         </Group>

         {error && (
            <Alert
               variant="light"
               color="red"
               title="Data Fetching Alert"
               icon={<IconAlertCircle size={16} />}
               radius="none"
            >
               {typeof error === 'string' ? error : 'An unexpected failure occurred while loading users.'}
            </Alert>
         )}

         <ManageUsers users={users} isLoading={isLoading} onToggleBlock={handleToggleBlock} onSetRole={handleSetRole} />

      </Stack>
   );
}
