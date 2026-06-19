import { useRef, useEffect, useCallback } from 'react';

export function useBsModal() {
  const ref = useRef(null);
  const inst = useRef(null);

  useEffect(() => {
    import('bootstrap').then(({ Modal }) => {
      if (ref.current) inst.current = new Modal(ref.current);
    });
    return () => inst.current?.dispose();
  }, []);

  const show = useCallback(() => inst.current?.show(), []);
  const hide = useCallback(() => inst.current?.hide(), []);

  return { ref, show, hide };
}
