import clsx from 'clsx';
import { Search } from 'lucide-react';
import { useRef, useState } from 'react';

import { Input } from '@components/ui/input';
import { useSearchFocus } from '../lib/searchFocus';

const DEFAULT_PLACEHOLDER = 'Search';
const FOCUSED_PLACEHOLDER = 'Type a name that comes to mind...';
const CHAR_DELAY_MS = 40; // ms per character
const ICON_ANIM_DURATION_MS = 400;

export default function SearchBar() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  useSearchFocus(searchInputRef);

  const typingEffectRef = useRef<number | null>(null);
  const [isAnimatingIcon, setIsAnimatingIcon] = useState(false);
  const [placeholder, setPlaceholder] = useState(DEFAULT_PLACEHOLDER);

  return (
    <div className="search-container">
      <Search
        className={clsx(['search-icon', isAnimatingIcon && 'animate-search'])}
      />
      <Input
        ref={searchInputRef}
        placeholder={placeholder}
        className="search-input"
        onFocus={() => {
          // Start icon animation
          setIsAnimatingIcon(true);
          setTimeout(() => setIsAnimatingIcon(false), ICON_ANIM_DURATION_MS);

          // Cancel any ongoing typing effect
          if (typingEffectRef.current) {
            window.cancelAnimationFrame(typingEffectRef.current);
          }

          let index = 0;
          let lastTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - lastTime;
            if (elapsed >= CHAR_DELAY_MS) {
              if (index <= FOCUSED_PLACEHOLDER.length) {
                setPlaceholder(FOCUSED_PLACEHOLDER.slice(0, index));
                index++;
                lastTime = currentTime;
              } else {
                return; // animation complete
              }
            }
            typingEffectRef.current = window.requestAnimationFrame(animate);
          };

          setPlaceholder('');
          typingEffectRef.current = requestAnimationFrame(animate);
        }}
        onBlur={() => {
          if (typingEffectRef.current) {
            cancelAnimationFrame(typingEffectRef.current);
            typingEffectRef.current = null;
          }
          setPlaceholder(DEFAULT_PLACEHOLDER);
        }}
      />
    </div>
  );
}
