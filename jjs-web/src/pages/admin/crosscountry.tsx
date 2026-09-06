import { useNavigate } from "react-router";
import { Alert, Button, Group, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle, IconPlus } from "@tabler/icons-react";
import { useApiContext } from "@api/ApiContext";
import { useCrossCountry } from "@api/crossCountry/crossCountry-fetcher";
import CrossCountryTable from "@components/crossCountry/CrossCountryTable";

export default function ManageCrossCountryPage() {
   const navigate = useNavigate();
   const { httpGet } = useApiContext();
   const { data, isLoading, error } = useCrossCountry(httpGet);

   return (
      <Stack gap="sm">
         <Group justify="space-between" align="center">
            <Stack gap={2}>
               <Title order={1} size="h2" fw={600}>Cross Country</Title>
               <Text size="xs" c="dimmed">Manage private runner scores and event results.</Text>
            </Stack>
            <Button variant="default" radius="none" size="sm" leftSection={<IconPlus size={16} />} onClick={() => navigate("/admin/crosscountry/new")}>New Result</Button>
         </Group>
         {error && <Alert color="red" title="Unable to load Cross Country results" icon={<IconAlertCircle size={16} />} radius="none">{error}</Alert>}
         <CrossCountryTable events={data} isLoading={isLoading} />
      </Stack>
   );
}
