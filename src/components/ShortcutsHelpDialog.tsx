import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { SHORTCUT_DEFINITIONS } from '../hooks/useKeyboardShortcuts';

interface ShortcutsHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryLabels: Record<string, { title: string; icon: string }> = {
  navigation: { title: 'Navigation', icon: '🧭' },
  views: { title: 'Views', icon: '👁️' },
  actions: { title: 'Actions', icon: '⚡' },
  dialogs: { title: 'Dialogs', icon: '💬' },
};

export function ShortcutsHelpDialog({ open, onOpenChange }: ShortcutsHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>⌨️</span>
            <span>Keyboard Shortcuts</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          {Object.entries(SHORTCUT_DEFINITIONS).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <span>{categoryLabels[category]?.icon}</span>
                <span>{categoryLabels[category]?.title || category}</span>
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.description}
                    className="flex justify-between items-center py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{item.description}</span>
                    <div className="flex gap-1">
                      {item.keys.map((key) => (
                        <kbd
                          key={key}
                          className="min-w-[28px] px-2 py-1 text-xs font-mono bg-muted text-muted-foreground rounded border border-border text-center"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">?</kbd> anytime to show this help
        </div>
      </DialogContent>
    </Dialog>
  );
}
