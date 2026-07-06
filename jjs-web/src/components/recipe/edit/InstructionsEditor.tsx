import { useRef, useState } from 'react';
import { Card, TextInput, Textarea, ActionIcon, Group, Text, Button, Stack, Box, SegmentedControl } from '@mantine/core';
import { IconTrash, IconChevronUp, IconChevronDown, IconPlus } from '@tabler/icons-react';
import MarkdownViewer from '@components/ui/MarkdownViewer';
import type { Instruction } from '@api/recipe/recipe';

interface Props {
  instructions: Instruction[];
  onChange: (instructions: Instruction[]) => void;
}

interface RowProps {
  instruction: Instruction;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (partial: Partial<Instruction>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

function InstructionRow({ instruction, index, isFirst, isLast, onUpdate, onMoveUp, onMoveDown, onRemove }: RowProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  return (
    <Card withBorder padding="md" radius="none">
      <Stack gap="sm">

        {/* Row header: sequence + name + controls */}
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="sm" align="center" style={{ flex: 1, minWidth: 0 }}>
            <Text size="sm" fw={700} c="dimmed" ff="monospace" style={{ flexShrink: 0 }}>
              #{index + 1}
            </Text>
            <TextInput
              size="xs"
              radius="none"
              placeholder="Step name"
              value={instruction.name}
              onChange={e => onUpdate({ name: e.currentTarget.value })}
              style={{ flex: 1 }}
            />
          </Group>
          <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
            <ActionIcon variant="subtle" color="gray" size="sm" disabled={isFirst} onClick={onMoveUp}>
              <IconChevronUp size={14} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="gray" size="sm" disabled={isLast} onClick={onMoveDown}>
              <IconChevronDown size={14} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red" size="sm" onClick={onRemove}>
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Edit / Preview toggle */}
        <Group justify="flex-end">
          <SegmentedControl
            size="xs"
            radius="none"
            value={mode}
            onChange={v => setMode(v as 'edit' | 'preview')}
            data={[{ label: 'Edit', value: 'edit' }, { label: 'Preview', value: 'preview' }]}
          />
        </Group>

        {/* Instruction body */}
        {mode === 'edit' ? (
          <Textarea
            radius="none"
            placeholder="Write step instructions (Markdown supported)…"
            autosize
            minRows={3}
            value={instruction.instruction ?? ''}
            onChange={e => onUpdate({ instruction: e.currentTarget.value })}
          />
        ) : (
          <Box
            p="sm"
            style={{ border: '1px solid var(--mantine-color-gray-3)', minHeight: 72 }}
          >
            {instruction.instruction?.trim()
              ? <MarkdownViewer>{instruction.instruction}</MarkdownViewer>
              : <Text size="sm" c="dimmed">Nothing to preview.</Text>
            }
          </Box>
        )}

      </Stack>
    </Card>
  );
}

export default function InstructionsEditor({ instructions, onChange }: Props) {
  const localId = useRef(-1);

  const add = () => onChange([...instructions, {
    recipeInstructionId: localId.current--,
    name: '',
    instruction: '',
    sequence: 0,
  }]);

  const update = (index: number, partial: Partial<Instruction>) =>
    onChange(instructions.map((ins, i) => i === index ? { ...ins, ...partial } : ins));

  const swap = (a: number, b: number) => {
    const next = [...instructions];
    [next[a], next[b]] = [next[b], next[a]];
    onChange(next);
  };

  const remove = (index: number) => onChange(instructions.filter((_, i) => i !== index));

  return (
    <Stack gap="sm">
      {instructions.length === 0 && (
        <Text size="sm" c="dimmed" ta="center">No steps — click Add Step to begin.</Text>
      )}
      {instructions.map((ins, i) => (
        <InstructionRow
          key={ins.recipeInstructionId}
          instruction={ins}
          index={i}
          isFirst={i === 0}
          isLast={i === instructions.length - 1}
          onUpdate={partial => update(i, partial)}
          onMoveUp={() => swap(i, i - 1)}
          onMoveDown={() => swap(i, i + 1)}
          onRemove={() => remove(i)}
        />
      ))}
      <Button size="xs" variant="default" radius="none" leftSection={<IconPlus size={14} />} onClick={add}>
        Add Step
      </Button>
    </Stack>
  );
}
