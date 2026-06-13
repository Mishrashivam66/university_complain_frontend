import { createContext, useContext, useEffect, useState } from "react";

import socket from "../socket";

// ==========================================
// CONTEXT
// ==========================================

const RealtimeContext = createContext();

// ==========================================
// PROVIDER
// ==========================================

export const RealtimeProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // ======================================
    // GLOBAL EVENTS
    // ======================================

    const refreshApp = () => {
      console.log("Realtime Global Refresh");

      setRefreshKey((prev) => prev + 1);
    };

    // ======================================
    // SOCKET EVENTS
    // ======================================

    socket.on(
      "complaintUpdated",

      refreshApp,
    );

    socket.on(
      "inventoryUpdated",

      refreshApp,
    );

    socket.on(
      "dashboardUpdated",

      refreshApp,
    );

    socket.on(
      "notificationUpdated",

      refreshApp,
    );

    // ======================================
    // CLEANUP
    // ======================================

    return () => {
      socket.off("complaintUpdated");

      socket.off("inventoryUpdated");

      socket.off("dashboardUpdated");

      socket.off("notificationUpdated");
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ refreshKey }}>
      {children}
    </RealtimeContext.Provider>
  );
};

// ==========================================
// CUSTOM HOOK
// ==========================================

export const useRealtime = () => {
  return useContext(RealtimeContext);
};
