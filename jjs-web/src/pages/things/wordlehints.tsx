import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  Title, Text, Box, Button, Group, Stack,
  Container, Badge, ScrollArea, Paper, Center, Divider,
} from '@mantine/core';
import { WORDLE_WORDS } from './wordle-words';

type LetterState = 'default' | 'miss' | 'close' | 'hit';

interface LetterCell {
  letter: string;
  state: LetterState;
}

const ROWS = 6;
const COLS = 5;
// Filled cells cycle through the three meaningful states; 'default' is only for empty cells.
const STATE_ORDER: LetterState[] = ['miss', 'close', 'hit'];

const STATE_STYLE: Record<LetterState, { background: string; color: string; border: string }> = {
  default: { background: 'var(--mantine-color-body)', color: 'var(--mantine-color-text)', border: 'var(--mantine-color-gray-4)' },
  miss:    { background: '#121213', color: '#ffffff', border: '#121213' },
  close:   { background: '#b59f3b', color: '#ffffff', border: '#b59f3b' },
  hit:     { background: '#538d4e', color: '#ffffff', border: '#538d4e' },
};

const LEGEND: { state: LetterState; letter: string; label: string }[] = [
  { state: 'miss',  letter: 'X', label: 'Not in word' },
  { state: 'close', letter: 'Y', label: 'Right letter, wrong spot' },
  { state: 'hit',   letter: 'Z', label: 'Correct spot' },
];

function makeEmptyGrid(): LetterCell[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ letter: '', state: 'default' as LetterState }))
  );
}

function filterWords(grid: LetterCell[][]): string[] {
  const hits = new Map<number, string>();
  const closeMap = new Map<string, Set<number>>();
  const missSet = new Set<string>();

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const { letter, state } = grid[r][c];
      if (!letter) continue;
      const l = letter.toLowerCase();
      if (state === 'hit') {
        hits.set(c, l);
      } else if (state === 'close') {
        if (!closeMap.has(l)) closeMap.set(l, new Set());
        closeMap.get(l)!.add(c);
      } else if (state === 'miss') {
        missSet.add(l);
      }
    }
  }

  if (hits.size === 0 && closeMap.size === 0 && missSet.size === 0) return [];

  return WORDLE_WORDS.filter(word => {
    const w = word.toLowerCase();

    for (const [pos, l] of hits) {
      if (w[pos] !== l) return false;
    }

    for (const [l, badPositions] of closeMap) {
      if (!w.includes(l)) return false;
      for (const pos of badPositions) {
        if (w[pos] === l) return false;
      }
    }

    for (const l of missSet) {
      // Skip if this letter is also marked hit/close elsewhere (duplicate letter case)
      if (closeMap.has(l) || [...hits.values()].includes(l)) continue;
      if (w.includes(l)) return false;
    }

    return true;
  });
}

export default function WordleHintsPage() {
  const [grid, setGrid] = useState<LetterCell[][]>(makeEmptyGrid());
  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array.from({ length: ROWS }, () => Array<HTMLInputElement | null>(COLS).fill(null))
  );

  const focusCell = useCallback((row: number, col: number) => {
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      inputRefs.current[row]?.[col]?.focus();
    }
  }, []);

  const handleChange = (row: number, col: number, value: string) => {
    const letter = value.replace(/[^a-zA-Z]/g, '').slice(-1).toUpperCase();
    setGrid(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })));
      next[row][col].letter = letter;
      // New letters default to miss (black = not in word); clearing resets to neutral.
      if (!letter) next[row][col].state = 'default';
      else if (next[row][col].state === 'default') next[row][col].state = 'miss';
      return next;
    });
    if (letter && col < COLS - 1) focusCell(row, col + 1);
  };

  const handleKeyDown = (row: number, col: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (grid[row][col].letter) {
        setGrid(prev => {
          const next = prev.map(r => r.map(c => ({ ...c })));
          next[row][col].letter = '';
          next[row][col].state = 'default';
          return next;
        });
      } else if (col > 0) {
        setGrid(prev => {
          const next = prev.map(r => r.map(c => ({ ...c })));
          next[row][col - 1].letter = '';
          next[row][col - 1].state = 'default';
          return next;
        });
        focusCell(row, col - 1);
      }
    } else if (e.key === 'ArrowLeft')  { e.preventDefault(); focusCell(row, col - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); focusCell(row, col + 1); }
      else if (e.key === 'ArrowUp')    { e.preventDefault(); focusCell(row - 1, col); }
      else if (e.key === 'ArrowDown')  { e.preventDefault(); focusCell(row + 1, col); }
      else if (e.key === 'Enter')      { e.preventDefault(); focusCell(row + 1, 0); }
  };

  const handleCellClick = (row: number, col: number) => {
    if (!grid[row][col].letter) return;
    setGrid(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })));
      const cell = next[row][col];
      const idx = STATE_ORDER.indexOf(cell.state);
      cell.state = STATE_ORDER[(idx + 1) % STATE_ORDER.length];
      return next;
    });
  };

  useEffect(() => { focusCell(0, 0); }, [focusCell]);

  const matchingWords = useMemo(() => filterWords(grid).sort(), [grid]);

  const reset = () => {
    setGrid(makeEmptyGrid());
    focusCell(0, 0);
  };

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1}>Wordle Hints</Title>
          <Text c="dimmed" size="sm">For navigating mental blocks</Text>
        </Stack>

        {/* Legend — full on desktop, compact single line on mobile */}
        <Paper withBorder p="md" radius="sm">
          {/* Desktop */}
          <Box visibleFrom="sm">
            <Text size="sm" fw={500} mb="sm">Mark letters as:</Text>
            <Group gap="xl" wrap="wrap">
              {LEGEND.map(({ state, letter, label }) => {
                const s = STATE_STYLE[state];
                return (
                  <Group key={state} gap="xs" align="center">
                    <Box style={{
                      width: 36, height: 36,
                      background: s.background, border: `2px solid ${s.border}`, borderRadius: 4,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: s.color, fontWeight: 700, fontSize: 16, userSelect: 'none',
                    }}>
                      {letter}
                    </Box>
                    <Text size="sm">{label}</Text>
                  </Group>
                );
              })}
            </Group>
            <Text size="xs" c="dimmed" mt="xs">Type a letter, then click it to cycle its state.</Text>
          </Box>

          {/* Mobile — single line: coloured swatch + short label */}
          <Group hiddenFrom="sm" gap="lg" justify="center" wrap="nowrap">
            {LEGEND.map(({ state }) => {
              const s = STATE_STYLE[state];
              return (
                <Group key={state} gap={6} align="center" wrap="nowrap">
                  <Box style={{
                    width: 18, height: 18, flexShrink: 0,
                    background: s.background, border: `2px solid ${s.border}`, borderRadius: 3,
                  }} />
                  <Text size="sm" tt="capitalize">{state}</Text>
                </Group>
              );
            })}
          </Group>
        </Paper>

        {/* 6×5 grid — rows are fluid: cells shrink on narrow screens, capped at 58 px on wide */}
        <Box style={{ width: '100%' }}>
          {grid.map((row, rowIdx) => (
            <div
              key={rowIdx}
              style={{
                display: 'flex',
                gap: 6,
                maxWidth: 314, /* 5 × 58 px + 4 × 6 px gap */
                margin: '0 auto 6px',
              }}
            >
              {row.map((cell, colIdx) => {
                const s = STATE_STYLE[cell.state];
                return (
                  <div
                    key={colIdx}
                    onClick={() => handleCellClick(rowIdx, colIdx)}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      aspectRatio: '1 / 1',
                      border: `2px solid ${s.border}`,
                      borderRadius: 4,
                      background: s.background,
                      cursor: cell.letter ? 'pointer' : 'default',
                      position: 'relative',
                    }}
                  >
                    <input
                      ref={el => { inputRefs.current[rowIdx][colIdx] = el; }}
                      type="text"
                      maxLength={2}
                      value={cell.letter}
                      onChange={e => handleChange(rowIdx, colIdx, e.target.value)}
                      onKeyDown={e => handleKeyDown(rowIdx, colIdx, e)}
                      style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        border: 'none', background: 'transparent',
                        textAlign: 'center',
                        fontSize: 'min(5.5vw, 22px)',
                        fontWeight: 700,
                        color: s.color, outline: 'none',
                        cursor: 'text', textTransform: 'uppercase', padding: 0,
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </Box>

        <Group justify="center">
          <Button onClick={reset} variant="outline" color="gray" size="sm">Reset</Button>
        </Group>

        <Divider />

        {matchingWords.length > 0 ? (
          <Stack gap="sm">
            <Text fw={600} size="sm">
              {matchingWords.length} matching {matchingWords.length === 1 ? 'word' : 'words'}
            </Text>
            <Paper withBorder p="md" radius="sm">
              <ScrollArea h={260}>
                <Group gap={6} wrap="wrap">
                  {matchingWords.map(word => (
                    <Badge
                      key={word}
                      size="lg"
                      variant="outline"
                      color="dark"
                      style={{ fontFamily: 'monospace', fontSize: 13, letterSpacing: '0.1em' }}
                    >
                      {word}
                    </Badge>
                  ))}
                </Group>
              </ScrollArea>
            </Paper>
          </Stack>
        ) : (
          <Center py="md">
            <Text c="dimmed" size="sm">
              Enter letters and click to set their states to find matching words.
            </Text>
          </Center>
        )}
      </Stack>
    </Container>
  );
}
