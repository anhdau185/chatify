import { useEffect } from 'react';

import { EventEmitter } from '@shared/lib/eventEmitter';

const searchFocusEmitter = new EventEmitter();

export function useSearchFocus(
  inputRef: React.RefObject<HTMLInputElement | null>,
) {
  useEffect(() => {
    return searchFocusEmitter.subscribe(() => {
      if (inputRef.current) inputRef.current.focus();
    });
  }, [inputRef]);

  useEffect(() => {
    return () => {
      searchFocusEmitter.clear();
    };
  }, []);
}

export function focusSearchInput() {
  searchFocusEmitter.emit();
}
