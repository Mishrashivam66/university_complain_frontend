import { useEffect } from "react";

// ==========================================
// GLOBAL REALTIME REFRESH HOOK
// ==========================================

const useRealtimeRefresh = (
  eventName,

  callback,
) => {
  useEffect(() => {}, [eventName, callback]);
};

export default useRealtimeRefresh;
