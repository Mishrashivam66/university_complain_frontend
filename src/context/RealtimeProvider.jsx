/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";

// ==========================================
// CONTEXT
// ==========================================

const RealtimeContext = createContext();

// ==========================================
// PROVIDER
// ==========================================

export const RealtimeProvider = ({ children }) => {
  return (
    <RealtimeContext.Provider value={{ refreshKey: 0 }}>
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
