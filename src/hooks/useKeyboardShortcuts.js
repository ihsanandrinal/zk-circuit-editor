'use client';

import { useEffect, useCallback } from 'react';

const useKeyboardShortcuts = (shortcuts) => {
  const handleKeyDown = useCallback((event) => {
    // Check if any input element is focused to avoid conflicts
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    );

    shortcuts.forEach(({ keys, callback, allowInInputs = false }) => {
      const matches = keys.some(keyCombo => {
        const combo = keyCombo.toLowerCase().split('+');
        const ctrlPressed = event.ctrlKey || event.metaKey;
        const shiftPressed = event.shiftKey;
        const altPressed = event.altKey;
        const key = event.key.toLowerCase();

        return combo.every(part => {
          switch (part) {
            case 'ctrl':
            case 'cmd':
              return ctrlPressed;
            case 'shift':
              return shiftPressed;
            case 'alt':
              return altPressed;
            default:
              return key === part;
          }
        });
      });

      if (matches && (allowInInputs || !isInputFocused)) {
        event.preventDefault();
        callback(event);
      }
    });
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

export const useZKPlaygroundShortcuts = (callbacks) => {
  const shortcuts = [
    {
      keys: ['ctrl+enter', 'cmd+enter'],
      callback: callbacks.generateProof,
      allowInInputs: true,
      description: 'Generate ZK Proof'
    },
    {
      keys: ['ctrl+s', 'cmd+s'],
      callback: callbacks.saveCircuit,
      allowInInputs: true,
      description: 'Save Circuit'
    },
    {
      keys: ['ctrl+o', 'cmd+o'],
      callback: callbacks.loadCircuit,
      allowInInputs: false,
      description: 'Load Circuit'
    },
    {
      keys: ['ctrl+shift+e', 'cmd+shift+e'],
      callback: callbacks.exportResults,
      allowInInputs: false,
      description: 'Export Results'
    },
    {
      keys: ['ctrl+shift+c', 'cmd+shift+c'],
      callback: callbacks.clearAll,
      allowInInputs: false,
      description: 'Clear All'
    },
    {
      keys: ['f5'],
      callback: callbacks.refresh,
      allowInInputs: false,
      description: 'Refresh/Reset'
    },
    {
      keys: ['escape'],
      callback: callbacks.escape,
      allowInInputs: false,
      description: 'Cancel/Clear Selection'
    }
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
};

export default useKeyboardShortcuts;