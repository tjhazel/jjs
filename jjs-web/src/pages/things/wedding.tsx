import { Text, Stack } from '@mantine/core';

const WEDDING_URL = 'http://www.johnandjeri.com/wedding/arrangements/default.htm';

export default function WeddingPage() {
  return (
    <Stack gap={0} style={{ height: 'calc(100vh - 130px)' }}>
      <iframe
        src={WEDDING_URL}
        title="Wedding Arrangements"
        style={{ flex: 1, width: '100%', border: 'none' }}
      />
      <Text size="xs" c="dimmed" ta="center" py={4}>
        Loaded from {WEDDING_URL}
      </Text>
    </Stack>
  );
}
