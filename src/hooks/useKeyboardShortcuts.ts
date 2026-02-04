import { useEffect, useCallback, useState } from 'react';

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  category: 'navigation' | 'actions' | 'dialogs';
  enabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: Shortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Skip if shortcuts are disabled
      if (!enabled) return;

      // Skip if typing in input/textarea (unless modifier key is held)
      const target = event.target as HTMLElement;
      const isTyping =
        ['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable;

      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !!shortcut.ctrl === (event.ctrlKey || event.metaKey);
        const shiftMatch = !!shortcut.shift === event.shiftKey;
        const altMatch = !!shortcut.alt === event.altKey;

        // For letter/number keys without modifiers, skip if typing
        if (keyMatch && !shortcut.ctrl && !shortcut.alt && isTyping) continue;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Hook to track if any dialog is open (for disabling shortcuts)
export function useDialogOpen() {
  const [dialogCount, setDialogCount] = useState(0);

  const setDialogOpen = useCallback((isOpen: boolean) => {
    setDialogCount((prev) => (isOpen ? prev + 1 : Math.max(0, prev - 1)));
  }, []);

  return {
    isAnyDialogOpen: dialogCount > 0,
    setDialogOpen,
  };
}

// Shortcut definitions for help dialog
export const SHORTCUT_DEFINITIONS = {
  navigation: [
    { keys: ['←', '→'], description: 'Switch between boards' },
    { keys: ['1-9'], description: 'Quick access to board (1-9)' },
    { keys: ['/'], description: 'Focus search' },
  ],
  actions: [
    { keys: ['N'], description: 'New task' },
    { keys: ['B'], description: 'New board' },
    { keys: ['D'], description: 'Toggle dark/light mode' },
  ],
  dialogs: [
    { keys: ['?'], description: 'Show keyboard shortcuts' },
    { keys: ['Escape'], description: 'Close dialog' },
  ],
};
