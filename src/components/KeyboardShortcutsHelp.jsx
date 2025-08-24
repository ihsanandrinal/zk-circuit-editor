'use client';

import React, { useState } from 'react';
import { QuestionMarkCircleIcon, XMarkIcon, CommandLineIcon } from '@heroicons/react/24/outline';

const KeyboardShortcutsHelp = ({ shortcuts = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatShortcut = (keys) => {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    return keys.map(keyCombo => {
      return keyCombo
        .replace(/ctrl/gi, isMac ? '⌘' : 'Ctrl')
        .replace(/cmd/gi, '⌘')
        .replace(/shift/gi, isMac ? '⇧' : 'Shift')
        .replace(/alt/gi, isMac ? '⌥' : 'Alt')
        .replace(/enter/gi, isMac ? '↵' : 'Enter')
        .replace(/escape/gi, isMac ? '⎋' : 'Esc')
        .replace(/\+/g, isMac ? '' : '+');
    }).join(' or ');
  };

  if (!shortcuts.length) return null;

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-colors z-40"
        title="Show keyboard shortcuts (Ctrl+?)"
      >
        <CommandLineIcon className="w-5 h-5" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <CommandLineIcon className="w-5 h-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-indigo-500 rounded"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="p-4 overflow-y-auto max-h-96">
              <div className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">
                        {shortcut.description}
                      </div>
                    </div>
                    <div className="ml-4">
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                        {formatShortcut(shortcut.keys)}
                      </kbd>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Additional Tips */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 text-sm mb-2">Tips:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Most shortcuts work even when typing in text areas</li>
                  <li>• Use Escape to cancel operations or close dialogs</li>
                  <li>• Shortcuts are disabled during proof generation</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Press <kbd className="px-1 py-0.5 text-xs bg-gray-200 rounded">?</kbd> to show this dialog anytime
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcutsHelp;