import { createContext, useContext, useEffect } from 'react';

export const DetailContext = createContext<(detail: boolean) => void>(() => {});

export function usePhoneDetail(active: boolean) {
  const setDetail = useContext(DetailContext);

  useEffect(() => {
    setDetail(active);
    return () => setDetail(false);
  }, [active, setDetail]);
}
