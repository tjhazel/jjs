import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { Alert, Button, Group, NumberInput, Stack, Text, Textarea, TextInput, Title } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useApiContext } from "@api/ApiContext";
import type { CrossCountry } from "@api/crossCountry/crossCountry";
import { saveCrossCountry, useCrossCountryEntry } from "@api/crossCountry/crossCountry-fetcher";

export default function CrossCountryEditorPage() {
   const navigate = useNavigate();
   const { httpGet, httpPost } = useApiContext();
   const { id, isNew } = useLoaderData() as { id: number | null; isNew: boolean };
   const { data, isLoading, error } = useCrossCountryEntry(httpGet, isNew ? null : id);
   if (!isNew && isLoading) return <Text>Loading Cross Country result...</Text>;
   if (!isNew && !data) return <Alert color="red" title="Result not found">{error ?? "The requested result does not exist."}</Alert>;

   return (
      <CrossCountryForm
         key={data?.crossCountryId ?? "new"}
         initialValue={data ?? { runnerName: "", eventDate: "", eventName: "", eventUrl: "", runnersTime: undefined, notes: "" }}
         id={id}
         isNew={isNew}
         onCancel={() => navigate("/admin/crosscountry")}
         onSave={async (model) => {
            await saveCrossCountry(httpPost, model);
            navigate("/admin/crosscountry");
         }}
         loadError={error}
      />
   );
}

interface CrossCountryFormProps {
   initialValue: CrossCountry;
   id: number | null;
   isNew: boolean;
   loadError?: string;
   onCancel: () => void;
   onSave: (model: CrossCountry) => Promise<void>;
}

function CrossCountryForm({ initialValue, id, isNew, loadError, onCancel, onSave }: CrossCountryFormProps) {
   const [form, setForm] = useState<CrossCountry>(initialValue);
   const [runnerMinutes, setRunnerMinutes] = useState(
      initialValue.runnersTime === undefined ? 0 : Math.floor(initialValue.runnersTime / 60)
   );
   const [runnerSeconds, setRunnerSeconds] = useState(
      initialValue.runnersTime === undefined ? 0 : initialValue.runnersTime % 60
   );
   const [saving, setSaving] = useState(false);
   const [saveError, setSaveError] = useState<string | null>(null);

   const update = <K extends keyof CrossCountry>(key: K, value: CrossCountry[K]) => setForm((current) => ({ ...current, [key]: value }));
   const submit = async () => {
      setSaving(true);
      setSaveError(null);
      try {
         const runnersTime = runnerMinutes * 60 + runnerSeconds;
         await onSave({
            ...form,
            crossCountryId: id ?? undefined,
            runnersTime: runnersTime > 0 ? runnersTime : undefined,
         });
      } catch (err) {
         setSaveError(err instanceof Error ? err.message : "Unable to save the result.");
      } finally {
         setSaving(false);
      }
   };

   return (
      <Stack gap="md">
         <Stack gap={2}><Title order={1} size="h2" fw={600}>{isNew ? "New Cross Country Result" : "Edit Cross Country Result"}</Title><Text size="xs" c="dimmed">This information is private and is never exposed through public endpoints.</Text></Stack>
         {(loadError || saveError) && <Alert color="red" icon={<IconAlertCircle size={16} />} radius="none">{saveError ?? loadError}</Alert>}
         <TextInput label="Runner name" required value={form.runnerName} onChange={(event) => update("runnerName", event.currentTarget.value)} />
         <TextInput label="Event date" type="date" required value={form.eventDate.slice(0, 10)} onChange={(event) => update("eventDate", event.currentTarget.value)} />
         <TextInput label="Event name" required value={form.eventName} onChange={(event) => update("eventName", event.currentTarget.value)} />
         <TextInput label="Event URL" value={form.eventUrl ?? ""} onChange={(event) => update("eventUrl", event.currentTarget.value)} />
         <Group grow align="flex-start">
            <NumberInput
               label="Runner time (minutes)"
               min={0}
               allowDecimal={false}
               value={runnerMinutes}
               onChange={(value) => setRunnerMinutes(typeof value === "number" ? value : 0)}
            />
            <NumberInput
               label="Runner time (seconds)"
               min={0}
               max={59}
               allowDecimal={false}
               value={runnerSeconds}
               onChange={(value) => setRunnerSeconds(typeof value === "number" ? value : 0)}
            />
         </Group>
         <Textarea label="Notes" minRows={5} value={form.notes ?? ""} onChange={(event) => update("notes", event.currentTarget.value)} />
         <Group justify="flex-end"><Button variant="default" onClick={onCancel}>Cancel</Button><Button loading={saving} onClick={() => void submit()}>Save</Button></Group>
      </Stack>
   );
}
