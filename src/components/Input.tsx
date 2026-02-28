import React from 'react';
import { Box, Text } from 'ink';

const ACCENT = '#4ade80';
const MUTED = '#5a5a6a';

interface InputProps {
  value: string;
  placeholder?: string;
  focused?: boolean;
}

export default function Input({ value, placeholder = 'add item...', focused = true }: InputProps) {
  const displayText = value || '';
  const showPlaceholder = !value && focused;

  return (
    <Box paddingLeft={2}>
      <Text color={ACCENT}>→ </Text>
      <Text color={ACCENT}>＋ </Text>
      {showPlaceholder ? (
        <Text color={MUTED}>{placeholder}</Text>
      ) : (
        <Text color={ACCENT}>{displayText}</Text>
      )}
      {focused && <Text color={ACCENT}>█</Text>}
    </Box>
  );
}
