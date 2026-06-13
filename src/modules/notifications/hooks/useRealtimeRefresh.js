import { useEffect } from "react";

import socket from "../../../socket";

// ==========================================
// GLOBAL REALTIME REFRESH HOOK
// ==========================================

const useRealtimeRefresh = (
  eventName,

  callback,
) => {
  useEffect(() => {
    socket.on(
      eventName,

      () => {
        console.log(`Realtime Refresh: ${eventName}`);

        callback();
      },
    );

    return () => {
      socket.off(eventName);
    };
  }, [eventName, callback]);
};

export default useRealtimeRefresh;
