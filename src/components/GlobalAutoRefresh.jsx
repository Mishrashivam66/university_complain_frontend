import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const REFRESH_INTERVAL = 20000;

export default function GlobalAutoRefresh() {
  const location = useLocation();

  useEffect(() => {
    const publicRoutes = [
      "/",
      "/login",
      "/register",
      "/forgot-password",
      "/verify-otp",
    ];

    const isPublicRoute = publicRoutes.some(
      (route) =>
        location.pathname === route ||
        location.pathname.startsWith(`${route}/`),
    );

    if (isPublicRoute) return;

    const notifyRefresh = () => {
      if (document.visibilityState !== "visible") return;

      window.dispatchEvent(new CustomEvent("ami-maint-refresh"));
    };

    const interval = window.setInterval(notifyRefresh, REFRESH_INTERVAL);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        notifyRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [location.pathname]);

  return null;
}
