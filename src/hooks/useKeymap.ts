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
  onCycleStatus: () => void;
  onInputChar: (ch: string) => void;
  onInputBackspace: () => void;
  onInputDelete: () => void;
  onInputDeleteWordBack: () => void;
  onInputDeleteToHome: () => void;
  onInputDeleteToEnd: () => void;
  onInputSubmit: () => void;
  onCancel: () => void;
  onCursorLeft: () => void;
  onCursorRight: () => void;
  onCursorWordLeft: () => void;
  onCursorWordRight: () => void;
  onCursorHome: () => void;
  onCursorEnd: () => void;
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

      // Backspace (key.backspace = \x08, key.delete = \x7f — both are backspace in Ink)
      if (key.backspace || key.delete) {
        callbacks.onInputBackspace();
        return;
      }

      // ctrl+w — delete word backwards (option+backspace)
      if (input === '\x17' || (input === 'w' && key.ctrl)) {
        callbacks.onInputDeleteWordBack();
        return;
      }

      // ctrl+u — delete to beginning of line (cmd+backspace)
      if (input === '\x15' || (input === 'u' && key.ctrl)) {
        callbacks.onInputDeleteToHome();
        return;
      }

      // ctrl+k — delete to end of line
      if (input === '\x0b' || (input === 'k' && key.ctrl)) {
        callbacks.onInputDeleteToEnd();
        return;
      }

      // ctrl+a — move to home (cmd+← in Terminal.app)
      if (input === '\x01' || (input === 'a' && key.ctrl)) {
        callbacks.onCursorHome();
        return;
      }

      // ctrl+e — move to end (cmd+→ in Terminal.app)
      if (input === '\x05' || (input === 'e' && key.ctrl)) {
        callbacks.onCursorEnd();
        return;
      }

      // Arrow key navigation
      if (key.leftArrow) {
        if (key.ctrl) {
          callbacks.onCursorHome();
        } else if (key.meta) {
          callbacks.onCursorWordLeft();
        } else {
          callbacks.onCursorLeft();
        }
        return;
      }
      if (key.rightArrow) {
        if (key.ctrl) {
          callbacks.onCursorEnd();
        } else if (key.meta) {
          callbacks.onCursorWordRight();
        } else {
          callbacks.onCursorRight();
        }
        return;
      }

      // option+b / meta+b — word left (readline)
      if (input === 'b' && key.meta) {
        callbacks.onCursorWordLeft();
        return;
      }

      // option+f / meta+f — word right (readline)
      if (input === 'f' && key.meta) {
        callbacks.onCursorWordRight();
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
    if (input === 's') {
      callbacks.onCycleStatus();
      return;
    }
  });
}
