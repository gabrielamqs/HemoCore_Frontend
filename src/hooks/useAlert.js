import { useState, useCallback } from 'react';

export function useAlert() {
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback((type, message) => {
    setAlert({ type, message, id: Date.now() });
    setTimeout(() => setAlert(null), 4000);
  }, []);

  const clearAlert = useCallback(() => setAlert(null), []);

  return { alert, showAlert, clearAlert };
}
