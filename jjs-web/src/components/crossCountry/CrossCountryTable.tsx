import { Button, Card, Center, Group, Loader, Stack, Table, Text } from "@mantine/core";
import { useNavigate } from "react-router";
import type { CrossCountry } from "@api/crossCountry/crossCountry";

interface CrossCountryTableProps {
   events: CrossCountry[] | undefined;
   isLoading: boolean;
}

function formatRunnerTime(totalSeconds: number | undefined): string {
   if (totalSeconds === undefined || totalSeconds === null) return "—";

   const minutes = Math.floor(totalSeconds / 60);
   const seconds = totalSeconds % 60;
   return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function CrossCountryTable({ events, isLoading }: CrossCountryTableProps) {
   const navigate = useNavigate();

   if (isLoading) {
      return <Center py="xl"><Group gap="sm"><Loader size="sm" type="dots" /><Text c="dimmed">Loading Cross Country events...</Text></Group></Center>;
   }

   if (!events?.length) {
      return <Center py="xl"><Text c="dimmed">No Cross Country events found.</Text></Center>;
   }

   return (
      <>
         <Table.ScrollContainer minWidth={760} visibleFrom="sm">
            <Table withTableBorder highlightOnHover>
               <Table.Thead>
                  <Table.Tr>
                     <Table.Th>Runner</Table.Th>
                     <Table.Th>Date</Table.Th>
                     <Table.Th>Event</Table.Th>
                     <Table.Th>Time</Table.Th>
                     <Table.Th>Event URL</Table.Th>
                     <Table.Th />
                  </Table.Tr>
               </Table.Thead>
               <Table.Tbody>
                  {events.map((event) => (
                     <Table.Tr key={event.crossCountryId} onClick={() => event.crossCountryId && navigate(`/admin/crosscountry/${event.crossCountryId}`)} style={{ cursor: "pointer" }}>
                        <Table.Td>{event.runnerName}</Table.Td>
                        <Table.Td>{new Date(event.eventDate).toLocaleDateString()}</Table.Td>
                        <Table.Td>{event.eventName}</Table.Td>
                        <Table.Td>{formatRunnerTime(event.runnersTime)}</Table.Td>
                        <Table.Td>
                           {event.eventUrl ? <a href={event.eventUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>Open</a> : "—"}
                        </Table.Td>
                        <Table.Td onClick={(e) => e.stopPropagation()}>
                           <Button variant="default" size="xs" radius="none" onClick={() => event.crossCountryId && navigate(`/admin/crosscountry/${event.crossCountryId}`)}>Edit</Button>
                        </Table.Td>
                     </Table.Tr>
                  ))}
               </Table.Tbody>
            </Table>
         </Table.ScrollContainer>
         <Stack gap="sm" hiddenFrom="sm">
            {events.map((event) => (
               <Card key={event.crossCountryId} withBorder radius="none" onClick={() => event.crossCountryId && navigate(`/admin/crosscountry/${event.crossCountryId}`)}>
                  <Text fw={600}>{event.runnerName}</Text>
                  <Text size="sm" c="dimmed">{event.eventName} · {new Date(event.eventDate).toLocaleDateString()}</Text>
                  <Text size="sm" c="dimmed">Time: {formatRunnerTime(event.runnersTime)}</Text>
               </Card>
            ))}
         </Stack>
      </>
   );
}
