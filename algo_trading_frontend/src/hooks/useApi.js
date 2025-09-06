import { useEffect, useState } from 'react';

// PUBLIC_INTERFACE
export function useApi(promiseFactory, deps = []) {
  /** Generic hook to fetch data from an async function and track loading/error. */
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(promiseFactory));
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!promiseFactory) return;
    setLoading(true);
    setError(null);
    promiseFactory()
      .then((res) => !cancelled && setData(res))
      .catch((e) => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: () => promiseFactory && promiseFactory().then(setData).catch(setError) };
}
