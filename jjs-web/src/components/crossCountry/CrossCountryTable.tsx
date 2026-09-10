import { useState } from "react";
import { Button, Card, Center, Group, Loader, Stack, Table, Text } from "@mantine/core";
import { useNavigate } from "react-router";
import { IconChevronDown, IconChevronUp, IconSelector } from "@tabler/icons-react";
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

type SortKey = "runnerName" | "eventDate" | "eventName" | "runnersTime";

export default function CrossCountryTable({ events, isLoading }: CrossCountryTableProps) {
   const navigate = useNavigate();
   const [sortBy, setSortBy] = useState<SortKey | null>(null);
   const [reverseSortDirection, setReverseSortDirection] = useState(false);

   if (isLoading) {
      return <Center py="xl"><Group gap="sm"><Loader size="sm" type="dots" /><Text c="dimmed">Loading Cross Country events...</Text></Group></Center>;
   }

   if (!events?.length) {
      return <Center py="xl"><Text c="dimmed">No Cross Country events found.</Text></Center>;
   }

   const handleSort = (field: SortKey) => {
      if (sortBy === field) {
         setReverseSortDirection((current) => !current);
      } else {
         setSortBy(field);
         setReverseSortDirection(false);
      }
   };

   const sortedEvents = [...events].sort((a, b) => {
      if (!sortBy) return 0;

      if (sortBy === "eventDate") {
         const dateA = new Date(a.eventDate).getTime();
         const dateB = new Date(b.eventDate).getTime();
         return reverseSortDirection ? dateB - dateA : dateA - dateB;
      }

      if (sortBy === "runnersTime") {
         const timeA = a.runnersTime ?? Number.POSITIVE_INFINITY;
         const timeB = b.runnersTime ?? Number.POSITIVE_INFINITY;
         return reverseSortDirection ? timeB - timeA : timeA - timeB;
      }

      const valueA = a[sortBy];
      const valueB = b[sortBy];
      return reverseSortDirection
         ? valueB.localeCompare(valueA)
         : valueA.localeCompare(valueB);
   });

   const renderSortHeader = (field: SortKey, label: string) => {
      const isCurrent = sortBy === field;
      return (
         <Table.Th
            onClick={() => handleSort(field)}
            aria-sort={isCurrent ? (reverseSortDirection ? "descending" : "ascending") : "none"}
            style={{ cursor: "pointer" }}
         >
            <Group justify="space-between" wrap="nowrap">
               <Text size="sm" fw={600}>{label}</Text>
               {!isCurrent && <IconSelector size={16} stroke={1.5} color="var(--mantine-color-gray-4)" />}
               {isCurrent && (reverseSortDirection
                  ? <IconChevronDown size={16} stroke={1.5} />
                  : <IconChevronUp size={16} stroke={1.5} />)}
            </Group>
         </Table.Th>
      );
   };

   return (
      <>
         <Table.ScrollContainer minWidth={760} visibleFrom="sm">
            <Table withTableBorder highlightOnHover>
               <Table.Thead>
                  <Table.Tr>
                     {renderSortHeader("runnerName", "Runner")}
                     {renderSortHeader("eventDate", "Date")}
                     {renderSortHeader("eventName", "Event")}
                     {renderSortHeader("runnersTime", "Time")}
                     <Table.Th>Event URL</Table.Th>
                     <Table.Th />
                  </Table.Tr>
               </Table.Thead>
               <Table.Tbody>
                  {sortedEvents.map((event) => (
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
            {sortedEvents.map((event) => (
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
