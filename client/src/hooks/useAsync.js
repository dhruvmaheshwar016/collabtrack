import { useCallback, useState } from 'react';
import { getApiError } from '../api/client.js';

export function useAsync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = useCallback(async (fn) => {
    setLoading(true);
    setError('');

    try {
      return await fn();
    } catch (err) {
      const message = getApiError(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, setError, run };
}
