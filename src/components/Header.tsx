import React from 'react';
import { Box, Text } from 'ink';

const ACCENT = '#4ade80';
const MUTED = '#8a8a9a';
const DIM = '#4a4a58';

export default function Header({ width }: { width: number }) {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const divider = '─'.repeat(Math.max(width - 4, 40));

  return (
    <Box flexDirection="column" paddingX={2}>
      <Box justifyContent="space-between">
        <Text bold color={ACCENT}>
          STANDUP
        </Text>
        <Text color={MUTED}>
          {dayName}, {monthDay}
        </Text>
      </Box>
      <Text color={DIM}>{divider}</Text>
    </Box>
  );
}
