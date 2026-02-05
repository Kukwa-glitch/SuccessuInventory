import { useEffect } from 'react';

/**
 * Hook that detects clicks outside of a specified element
 * Useful for closing modals, dropdowns, etc.
 * 
 * @param {React.RefObject} ref - React ref to the element
 * @param {Function} handler - Callback when click outside occurs
 * 
 * @example
 * const dropdownRef = useRef();
 * useClickOutside(dropdownRef, () => setIsOpen(false));
 * 
 * return <div ref={dropdownRef}>Dropdown content</div>
 */
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export default useClickOutside;