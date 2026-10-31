/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

const RealtimeContext = createContext(null);

const REFRESH_INTERVAL = 20000;

export const RealtimeProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshNow = useCallback(() => {
    setRefreshKey((previous) => previous + 1);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshNow();
      }
    }, REFRESH_INTERVAL);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshNow();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshNow]);

  const value = useMemo(
    () => ({
      refreshKey,
      refreshNow,
      refreshInterval: REFRESH_INTERVAL,
    }),
    [refreshKey, refreshNow],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  return useContext(RealtimeContext);
};
