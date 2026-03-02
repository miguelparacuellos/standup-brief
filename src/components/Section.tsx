import React from 'react';
import { Box, Text } from 'ink';
import type { Task, Blocker } from '../store.js';
import Item from './Item.js';
import Input from './Input.js';

const ACCENT = '#4ade80';
const DIM = '#7a7a8a';
const MUTED = '#8a8a9a';

type SectionType = 'yesterday' | 'today' | 'blockers';

interface SectionProps {
  title: string;
  type: SectionType;
  items: (Task | Blocker)[];
  active: boolean;
  focusedIndex: number;
  visible: boolean;
  inputMode: 'add' | 'edit' | null;
  inputValue: string;
  cursorPos: number;
  deleteConfirmIndex: number | null;
  newItemId: string | null;
  resolvingId: string | null;
}

export default function Section({
  title,
  type,
  items,
  active,
  focusedIndex,
  visible,
  inputMode,
  inputValue,
  cursorPos,
  deleteConfirmIndex,
  newItemId,
  resolvingId,
}: SectionProps) {
  if (!visible) return null;

  const headerColor = active ? ACCENT : DIM;
  const placeholder = type === 'blockers' ? 'describe the blocker...' : 'add item...';

  return (
    <Box flexDirection="column">
      <Box paddingLeft={2}>
        <Text bold color={headerColor}>
          ▸ {title.toUpperCase()}
        </Text>
      </Box>
      {items.map((item, i) => {
        const isFocused = active && focusedIndex === i && inputMode !== 'add';
        const isEditing = active && focusedIndex === i && inputMode === 'edit';
        const isDeleting = active && deleteConfirmIndex === i;
        const isNew = item.id === newItemId;
        const isResolving = item.id === resolvingId;

        if (isEditing) {
          const before = inputValue.slice(0, cursorPos);
          const atCursor = inputValue[cursorPos] ?? ' ';
          const after = inputValue.slice(cursorPos + 1);
          return (
            <Box key={item.id} paddingLeft={2}>
              <Text color={ACCENT}>→ </Text>
              <Text color={ACCENT}>{before}</Text>
              <Text color={ACCENT} inverse>{atCursor}</Text>
              <Text color={ACCENT}>{after}</Text>
            </Box>
          );
        }

        return (
          <Item
            key={item.id}
            text={item.text}
            focused={isFocused}
            sectionType={type}
            isNew={isNew}
            deleteConfirm={isDeleting}
            resolved={isResolving}
            status={item.status}
          />
        );
      })}
      {inputMode === 'add' && active ? (
        <Input value={inputValue} placeholder={placeholder} cursorPos={cursorPos} />
      ) : (
        <Box paddingLeft={4}>
          <Text color={MUTED}>＋ {placeholder}</Text>
        </Box>
      )}
    </Box>
  );
}
