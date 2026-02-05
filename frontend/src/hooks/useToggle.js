import { useState, useCallback } from 'react';

/**
 * Hook for managing boolean state
 * 
 * @param {boolean} initialValue - Initial boolean value
 * @returns {[boolean, Object]} - [value, { toggle, setTrue, setFalse, setValue }]
 * 
 * @example
 * const [isOpen, { toggle, setTrue, setFalse }] = useToggle(false);
 */
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [
    value,
    {
      toggle,
      setTrue,
      setFalse,
      setValue,
    },
  ];
}

export default useToggle;