import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import { Toaster } from "react-hot-toast";

import "./index.css";

import AppRoutes from "./routes/AppRoutes";

import { NotificationProvider } from "./modules/notifications/context/NotificationContext";

import { RealtimeProvider } from "./context/RealtimeProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RealtimeProvider>
      <NotificationProvider>
        <AppRoutes />

        <Toaster position="top-right" reverseOrder={false} />
      </NotificationProvider>
    </RealtimeProvider>
  </StrictMode>,
);
