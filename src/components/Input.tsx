import React from 'react';
import { Box, Text } from 'ink';

const ACCENT = '#4ade80';
const MUTED = '#8a8a9a';

interface InputProps {
  value: string;
  placeholder?: string;
  focused?: boolean;
  cursorPos?: number;
}

export default function Input({ value, placeholder = 'add item...', focused = true, cursorPos }: InputProps) {
  const displayText = value || '';
  const showPlaceholder = !value && focused;
  const pos = cursorPos ?? displayText.length;

  if (showPlaceholder) {
    return (
      <Box paddingLeft={2}>
        <Text color={ACCENT}>→ </Text>
        <Text color={ACCENT}>＋ </Text>
        <Text color={MUTED}>{placeholder}</Text>
      </Box>
    );
  }

  const before = displayText.slice(0, pos);
  const atCursor = displayText[pos] ?? ' ';
  const after = displayText.slice(pos + 1);

  return (
    <Box paddingLeft={2}>
      <Text color={ACCENT}>→ </Text>
      <Text color={ACCENT}>＋ </Text>
      <Text color={ACCENT}>{before}</Text>
      {focused && <Text color={ACCENT} inverse>{atCursor}</Text>}
      {!focused && <Text color={ACCENT}>{atCursor}</Text>}
      <Text color={ACCENT}>{after}</Text>
    </Box>
  );
}
