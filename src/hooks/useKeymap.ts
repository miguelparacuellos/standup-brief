import { useInput, useApp } from 'ink';

type SectionName = 'yesterday' | 'today' | 'blockers';

interface KeymapCallbacks {
  mode: 'navigation' | 'input' | 'delete-confirm';
  activeSection: SectionName;
  focusedIndex: number;
  sectionLengths: Record<SectionName, number>;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onNextSection: () => void;
  onPrevSection: () => void;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDeleteConfirm: () => void;
  onResolve: () => void;
  onInputChar: (ch: string) => void;
  onInputBackspace: () => void;
  onInputSubmit: () => void;
  onCancel: () => void;
}

export function useKeymap(callbacks: KeymapCallbacks) {
  const { exit } = useApp();

  useInput((input, key) => {
    const { mode } = callbacks;

    if (mode === 'input') {
      if (key.return) {
        callbacks.onInputSubmit();
        return;
      }
      if (key.escape) {
        callbacks.onCancel();
        return;
      }
      if (key.backspace || key.delete) {
        callbacks.onInputBackspace();
        return;
      }
      if (input && !key.ctrl && !key.meta) {
        callbacks.onInputChar(input);
        return;
      }
      return;
    }

    if (mode === 'delete-confirm') {
      if (input === 'd') {
        callbacks.onDeleteConfirm();
        return;
      }
      if (key.escape) {
        callbacks.onCancel();
        return;
      }
      return;
    }

    // Navigation mode
    if (input === 'q' || (input === 'c' && key.ctrl)) {
      exit();
      return;
    }

    if (key.upArrow || input === 'k') {
      callbacks.onMoveUp();
      return;
    }
    if (key.downArrow || input === 'j') {
      callbacks.onMoveDown();
      return;
    }
    if (key.tab && !key.shift) {
      callbacks.onNextSection();
      return;
    }
    if (key.tab && key.shift) {
      callbacks.onPrevSection();
      return;
    }
    if (input === 'a') {
      callbacks.onAdd();
      return;
    }
    if (input === 'e') {
      callbacks.onEdit();
      return;
    }
    if (input === 'd') {
      callbacks.onDelete();
      return;
    }
    if (input === 'r' && callbacks.activeSection === 'blockers') {
      callbacks.onResolve();
      return;
    }
  });
}
