import React from 'react';
import { Box, Text } from 'ink';

const MUTED = '#5a5a6a';
const DIM = '#3a3a48';

interface StatusBarProps {
  mode: 'navigation' | 'input' | 'delete-confirm';
  activeSection: string;
  width: number;
}

export default function StatusBar({ mode, activeSection, width }: StatusBarProps) {
  const divider = '─'.repeat(Math.max(width - 4, 40));

  if (mode === 'input') {
    return (
      <Box flexDirection="column" paddingX={2}>
        <Text color={DIM}>{divider}</Text>
        <Text color={MUTED}>
          Enter confirm · Esc cancel
        </Text>
      </Box>
    );
  }

  if (mode === 'delete-confirm') {
    return (
      <Box flexDirection="column" paddingX={2}>
        <Text color={DIM}>{divider}</Text>
        <Text color={MUTED}>
          d confirm delete · Esc cancel
        </Text>
      </Box>
    );
  }

  const resolveHint = activeSection === 'blockers' ? ' · r resolve blocker' : '';

  return (
    <Box flexDirection="column" paddingX={2}>
      <Text color={DIM}>{divider}</Text>
      <Text color={MUTED}>
        ↑↓ navigate · Tab section · a add · e edit · d delete{resolveHint} · q quit
      </Text>
    </Box>
  );
}
