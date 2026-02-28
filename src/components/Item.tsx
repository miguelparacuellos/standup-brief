import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

const ACCENT = '#4ade80';
const TEXT_COLOR = '#e8e6e1';
const MUTED = '#5a5a6a';
const WARNING = '#f59e0b';
const DANGER = '#f87171';

interface ItemProps {
  text: string;
  focused: boolean;
  sectionType: 'yesterday' | 'today' | 'blockers';
  isNew?: boolean;
  deleteConfirm?: boolean;
  resolved?: boolean;
}

export default function Item({
  text,
  focused,
  sectionType,
  isNew = false,
  deleteConfirm = false,
  resolved = false,
}: ItemProps) {
  const [highlight, setHighlight] = useState(isNew);

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setHighlight(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  const cursor = focused ? (
    <Text color={ACCENT}>→ </Text>
  ) : (
    <Text>  </Text>
  );

  const icon = sectionType === 'blockers' ? (
    <Text color={WARNING}>⚠ </Text>
  ) : (
    <Text color={MUTED}>✓ </Text>
  );

  const dimText = sectionType === 'yesterday';
  const textColor = highlight ? ACCENT : resolved ? MUTED : dimText ? MUTED : TEXT_COLOR;

  if (deleteConfirm) {
    return (
      <Box paddingLeft={2}>
        {cursor}
        {icon}
        <Text color={DANGER}>{text}  </Text>
        <Text color={DANGER} dimColor>[d again to confirm, esc to cancel]</Text>
      </Box>
    );
  }

  if (resolved) {
    return (
      <Box paddingLeft={2}>
        {cursor}
        {icon}
        <Text color={MUTED} strikethrough>{text}</Text>
      </Box>
    );
  }

  return (
    <Box paddingLeft={2}>
      {cursor}
      {icon}
      <Text color={textColor}>{text}</Text>
    </Box>
  );
}
