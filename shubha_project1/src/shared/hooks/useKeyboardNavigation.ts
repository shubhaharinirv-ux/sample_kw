/**
 * Keyboard Navigation Hooks
 * Provides reusable keyboard event handlers for accessibility
 */

import { useEffect, useCallback, useRef } from "react";

/**
 * Hook for handling keyboard events (Enter, Escape, Arrow keys, etc.)
 */
export function useKeyboardEvent(
  callback: (event: KeyboardEvent, key: string) => void,
  keys?: string[]
) {
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (keys && !keys.includes(event.key)) return;
      callback(event, event.key);
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [callback, keys]);
}

/**
 * Hook for handling keyboard navigation in lists (Up/Down arrows)
 */
export function useKeyboardListNavigation(
  items: HTMLElement[],
  onSelect?: (index: number, item: HTMLElement) => void
) {
  const currentIndexRef = useRef<number>(-1);

  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (!items.length) return;

      let newIndex = currentIndexRef.current;

      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        newIndex = Math.min(newIndex + 1, items.length - 1);
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        newIndex = Math.max(newIndex - 1, 0);
      } else if (event.key === "Home") {
        event.preventDefault();
        newIndex = 0;
      } else if (event.key === "End") {
        event.preventDefault();
        newIndex = items.length - 1;
      } else {
        return;
      }

      currentIndexRef.current = newIndex;
      const item = items[newIndex];
      if (item) {
        item.focus();
        onSelect?.(newIndex, item);
      }
    },
    [items, onSelect]
  );

  return { handleKeydown, currentIndex: currentIndexRef.current };
}

/**
 * Hook for handling Enter/Space key activation
 */
export function useKeyboardActivation(
  onActivate: () => void,
  element?: HTMLElement | null
) {
  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onActivate();
      }
    },
    [onActivate]
  );

  useEffect(() => {
    if (!element) return;

    element.addEventListener("keydown", handleKeydown);
    return () => element.removeEventListener("keydown", handleKeydown);
  }, [element, handleKeydown]);

  return handleKeydown;
}

/**
 * Hook for handling Escape key (close modals, popovers, etc.)
 */
export function useKeyboardEscape(
  onEscape: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscape();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [onEscape, enabled]);
}

/**
 * Hook for managing focus trap (keeps focus within modal/dialog)
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey) {
        // Shift+Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeydown);
    firstElement.focus();

    return () => container.removeEventListener("keydown", handleKeydown);
  }, [containerRef, enabled]);
}

/**
 * Hook for checkbox keyboard support (Space to toggle)
 */
export function useCheckboxKeyboard(
  checked: boolean,
  onChange: (checked: boolean) => void,
  element?: HTMLElement | null
) {
  useEffect(() => {
    if (!element) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        onChange(!checked);
      }
    };

    element.addEventListener("keydown", handleKeydown);
    return () => element.removeEventListener("keydown", handleKeydown);
  }, [element, checked, onChange]);
}

/**
 * Hook for combobox/select keyboard navigation
 * Handles Arrow keys, Enter to select, Escape to close
 */
export function useComboboxKeyboard(
  items: Array<{ id: string; label: string }>,
  isOpen: boolean,
  onOpenChange: (open: boolean) => void,
  onSelect: (item: { id: string; label: string }) => void,
  onFilter?: (query: string) => void
) {
  const currentIndexRef = useRef<number>(-1);

  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
        currentIndexRef.current = -1;
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!isOpen) {
          onOpenChange(true);
        } else {
          currentIndexRef.current = Math.min(
            currentIndexRef.current + 1,
            items.length - 1
          );
        }
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (isOpen) {
          currentIndexRef.current = Math.max(currentIndexRef.current - 1, -1);
        }
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (
          isOpen &&
          currentIndexRef.current >= 0 &&
          items[currentIndexRef.current]
        ) {
          onSelect(items[currentIndexRef.current]);
          onOpenChange(false);
          currentIndexRef.current = -1;
        }
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        // Already handled above
      } else if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        // Type to search - delegate to parent for input handling
        onFilter?.(event.key);
      }
    },
    [items, isOpen, onOpenChange, onSelect, onFilter]
  );

  return { handleKeydown, currentIndex: currentIndexRef.current };
}

/**
 * Hook for button/link keyboard activation (Enter or Space)
 */
export function useKeyboardButton(
  onClick: () => void,
  element?: HTMLElement | null
) {
  useEffect(() => {
    if (!element) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick();
      }
    };

    element.addEventListener("keydown", handleKeydown);
    return () => element.removeEventListener("keydown", handleKeydown);
  }, [element, onClick]);
}

/**
 * Hook for managing arrow key navigation in 2D grids
 */
export function useKeyboardGridNavigation(
  items: HTMLElement[],
  columns: number,
  onSelect?: (index: number, item: HTMLElement) => void
) {
  const currentIndexRef = useRef<number>(-1);

  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (!items.length) return;

      let newIndex = currentIndexRef.current;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        newIndex = Math.min(newIndex + 1, items.length - 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        newIndex = Math.max(newIndex - 1, 0);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        newIndex = Math.min(newIndex + columns, items.length - 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        newIndex = Math.max(newIndex - columns, 0);
      } else if (event.key === "Home") {
        event.preventDefault();
        newIndex = 0;
      } else if (event.key === "End") {
        event.preventDefault();
        newIndex = items.length - 1;
      } else {
        return;
      }

      currentIndexRef.current = newIndex;
      const item = items[newIndex];
      if (item) {
        item.focus();
        onSelect?.(newIndex, item);
      }
    },
    [items, columns, onSelect]
  );

  return { handleKeydown, currentIndex: currentIndexRef.current };
}

/**
 * Hook for Enter key to submit forms
 */
export function useKeyboardSubmit(
  onSubmit: () => void,
  element?: HTMLElement | null
) {
  useEffect(() => {
    if (!element) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        onSubmit();
      }
    };

    element.addEventListener("keydown", handleKeydown);
    return () => element.removeEventListener("keydown", handleKeydown);
  }, [element, onSubmit]);
}
