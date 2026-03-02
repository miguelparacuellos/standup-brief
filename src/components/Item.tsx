import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import type { Status } from '../store.js';

const ACCENT = '#4ade80';
const TEXT_COLOR = '#e8e6e1';
const MUTED = '#8a8a9a';
const DANGER = '#f87171';

const STATUS_ICONS: Record<Status, string> = {
  todo: '○',
  progress: '◐',
  done: '●',
};

interface ItemProps {
  text: string;
  focused: boolean;
  sectionType: 'yesterday' | 'today' | 'blockers';
  isNew?: boolean;
  deleteConfirm?: boolean;
  resolved?: boolean;
  status?: Status;
}

export default function Item({
  text,
  focused,
  sectionType,
  isNew = false,
  deleteConfirm = false,
  resolved = false,
  status,
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

  const effectiveStatus = status ?? 'todo';
  const statusIcon = <Text color={MUTED}>{STATUS_ICONS[effectiveStatus]} </Text>;

  const dimText = sectionType === 'yesterday';
  const textColor = highlight ? ACCENT : resolved ? MUTED : dimText ? MUTED : TEXT_COLOR;

  if (deleteConfirm) {
    return (
      <Box paddingLeft={2}>
        {cursor}
        {statusIcon}
        <Text color={DANGER}>{text}  </Text>
        <Text color={DANGER} dimColor>[d again to confirm, esc to cancel]</Text>
      </Box>
    );
  }

  if (resolved) {
    return (
      <Box paddingLeft={2}>
        {cursor}
        {statusIcon}
        <Text color={MUTED} strikethrough>{text}</Text>
      </Box>
    );
  }

  return (
    <Box paddingLeft={2}>
      {cursor}
      {statusIcon}
      <Text color={textColor}>{text}</Text>
    </Box>
  );
}
