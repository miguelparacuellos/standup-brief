import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Text, useStdout } from 'ink';
import { nanoid } from 'nanoid';
import { load, save, type StandupData, type Task, type Blocker, type Status } from './store.js';
import Header from './components/Header.js';
import Section from './components/Section.js';
import StatusBar from './components/StatusBar.js';
import { useKeymap } from './hooks/useKeymap.js';

type SectionName = 'yesterday' | 'today' | 'blockers';
const SECTIONS: SectionName[] = ['yesterday', 'today', 'blockers'];

export default function App() {
  const { stdout } = useStdout();
  const width = stdout?.columns ?? 80;

  const [data, setData] = useState<StandupData>(() => {
    const loaded = load();
    save(loaded);
    return loaded;
  });

  const [activeSection, setActiveSection] = useState<SectionName>('today');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [mode, setMode] = useState<'navigation' | 'input' | 'delete-confirm'>('navigation');
  const [inputMode, setInputMode] = useState<'add' | 'edit' | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [newItemId, setNewItemId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Stagger-in animation
  const [visibleSections, setVisibleSections] = useState<Record<SectionName, boolean>>({
    yesterday: false,
    today: false,
    blockers: false,
  });

  useEffect(() => {
    SECTIONS.forEach((section, i) => {
      setTimeout(() => {
        setVisibleSections(prev => ({ ...prev, [section]: true }));
      }, i * 60);
    });
  }, []);

  // Clear new item highlight after delay
  useEffect(() => {
    if (newItemId) {
      const timer = setTimeout(() => setNewItemId(null), 400);
      return () => clearTimeout(timer);
    }
  }, [newItemId]);

  const currentItems = data[activeSection];

  const persist = useCallback((newData: StandupData) => {
    setData(newData);
    save(newData);
  }, []);

  const sectionLengths: Record<SectionName, number> = {
    yesterday: data.yesterday.length,
    today: data.today.length,
    blockers: data.blockers.length,
  };

  useKeymap({
    mode,
    activeSection,
    focusedIndex,
    sectionLengths,

    onMoveUp: () => {
      setFocusedIndex(i => Math.max(0, i - 1));
    },

    onMoveDown: () => {
      const maxIndex = currentItems.length - 1;
      setFocusedIndex(i => Math.min(maxIndex, i + 1));
    },

    onNextSection: () => {
      const idx = SECTIONS.indexOf(activeSection);
      const next = SECTIONS[(idx + 1) % SECTIONS.length]!;
      setActiveSection(next);
      setFocusedIndex(0);
    },

    onPrevSection: () => {
      const idx = SECTIONS.indexOf(activeSection);
      const prev = SECTIONS[(idx - 1 + SECTIONS.length) % SECTIONS.length]!;
      setActiveSection(prev);
      setFocusedIndex(0);
    },

    onAdd: () => {
      setMode('input');
      setInputMode('add');
      setInputValue('');
    },

    onEdit: () => {
      if (currentItems.length === 0) return;
      const item = currentItems[focusedIndex];
      if (!item) return;
      setMode('input');
      setInputMode('edit');
      setInputValue(item.text);
    },

    onDelete: () => {
      if (currentItems.length === 0) return;
      setMode('delete-confirm');
      setDeleteConfirmIndex(focusedIndex);
    },

    onDeleteConfirm: () => {
      const items = [...data[activeSection]];
      items.splice(focusedIndex, 1);
      const newData = { ...data, [activeSection]: items };
      persist(newData);
      setFocusedIndex(Math.max(0, focusedIndex - 1));
      setMode('navigation');
      setDeleteConfirmIndex(null);
    },

    onResolve: () => {
      if (activeSection !== 'blockers') return;
      const blocker = data.blockers[focusedIndex] as Blocker | undefined;
      if (!blocker || blocker.resolvedAt) return;

      setResolvingId(blocker.id);
      setTimeout(() => {
        const newBlockers = data.blockers.map((b, i) =>
          i === focusedIndex ? { ...b, resolvedAt: new Date().toISOString() } : b
        );
        persist({ ...data, blockers: newBlockers });
        setResolvingId(null);
      }, 500);
    },

    onInputChar: (ch: string) => {
      setInputValue(prev => prev + ch);
    },

    onInputBackspace: () => {
      setInputValue(prev => prev.slice(0, -1));
    },

    onInputSubmit: () => {
      const text = inputValue.trim();
      if (!text) {
        setMode('navigation');
        setInputMode(null);
        setInputValue('');
        return;
      }

      if (inputMode === 'add') {
        const newItem: Task | Blocker = {
          id: nanoid(),
          text,
          createdAt: new Date().toISOString(),
        };
        const items = [...data[activeSection], newItem];
        const newData = { ...data, [activeSection]: items };
        persist(newData);
        setNewItemId(newItem.id);
        setFocusedIndex(items.length - 1);
      } else if (inputMode === 'edit') {
        const items = data[activeSection].map((item, i) =>
          i === focusedIndex ? { ...item, text } : item
        );
        const newData = { ...data, [activeSection]: items };
        persist(newData);
      }

      setMode('navigation');
      setInputMode(null);
      setInputValue('');
    },

    onCancel: () => {
      setMode('navigation');
      setInputMode(null);
      setInputValue('');
      setDeleteConfirmIndex(null);
    },

    onCycleStatus: () => {
      if (currentItems.length === 0) return;
      const item = currentItems[focusedIndex];
      if (!item) return;
      const cycle: Status[] = ['todo', 'progress', 'done'];
      const current: Status = item.status ?? 'todo';
      const nextStatus = cycle[(cycle.indexOf(current) + 1) % cycle.length]!;
      const items = data[activeSection].map((it, i) =>
        i === focusedIndex ? { ...it, status: nextStatus } : it
      );
      persist({ ...data, [activeSection]: items });
    },
  });

  const statusMode = mode === 'delete-confirm' ? 'delete-confirm' :
    mode === 'input' ? 'input' : 'navigation';

  return (
    <Box flexDirection="column" width={width}>
      <Header width={width} />
      <Box height={1} />

      <Section
        title="Yesterday"
        type="yesterday"
        items={data.yesterday}
        active={activeSection === 'yesterday'}
        focusedIndex={focusedIndex}
        visible={visibleSections.yesterday}
        inputMode={activeSection === 'yesterday' ? inputMode : null}
        inputValue={inputValue}
        deleteConfirmIndex={activeSection === 'yesterday' ? deleteConfirmIndex : null}
        newItemId={newItemId}
        resolvingId={null}
      />
      <Box height={1} />

      <Section
        title="Today"
        type="today"
        items={data.today}
        active={activeSection === 'today'}
        focusedIndex={focusedIndex}
        visible={visibleSections.today}
        inputMode={activeSection === 'today' ? inputMode : null}
        inputValue={inputValue}
        deleteConfirmIndex={activeSection === 'today' ? deleteConfirmIndex : null}
        newItemId={newItemId}
        resolvingId={null}
      />
      <Box height={1} />

      <Section
        title="Blockers"
        type="blockers"
        items={data.blockers}
        active={activeSection === 'blockers'}
        focusedIndex={focusedIndex}
        visible={visibleSections.blockers}
        inputMode={activeSection === 'blockers' ? inputMode : null}
        inputValue={inputValue}
        deleteConfirmIndex={activeSection === 'blockers' ? deleteConfirmIndex : null}
        newItemId={newItemId}
        resolvingId={resolvingId}
      />
      <Box height={1} />

      <StatusBar mode={statusMode} activeSection={activeSection} width={width} />
    </Box>
  );
}
