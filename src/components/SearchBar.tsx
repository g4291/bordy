import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar(
    {
      value,
      onChange,
      placeholder = 'Search tasks...',
      debounceMs = 300,
      className = '',
    },
    forwardedRef
  ) {
    const [localValue, setLocalValue] = useState(value);
    const internalRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    // Expose the internal ref to parent via forwarded ref
    useImperativeHandle(forwardedRef, () => internalRef.current!, []);

    // Sync local value when external value changes
    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    // Debounced onChange
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
          onChange(newValue);
        }, debounceMs);
      },
      [onChange, debounceMs]
    );

    // Clear search
    const handleClear = useCallback(() => {
      setLocalValue('');
      onChange('');
      internalRef.current?.focus();
    }, [onChange]);

    // Keyboard shortcut: Ctrl+K / Cmd+K to focus
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          internalRef.current?.focus();
          internalRef.current?.select();
        }
        // Escape to clear and blur
        if (e.key === 'Escape' && document.activeElement === internalRef.current) {
          if (localValue) {
            handleClear();
          } else {
            internalRef.current?.blur();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [localValue, handleClear]);

    // Cleanup debounce on unmount
    useEffect(() => {
      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }, []);

    return (
      <div className={`relative ${className}`}>
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={internalRef}
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="pl-8 pr-8 h-9 w-full"
        />
        {localValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={handleClear}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
        {/* Keyboard shortcut hint */}
        {!localValue && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded border border-border">
              /
            </kbd>
          </div>
        )}
      </div>
    );
  }
);
