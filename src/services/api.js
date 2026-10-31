import axios from "axios";

const api = axios.create({
  baseURL: "https://complaine-backend.vercel.app/api",
});

// ==========================================
// AUTH TOKEN
// ==========================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ==========================================
// GLOBAL GET REQUEST TRACKING
// ==========================================

const REFRESH_INTERVAL = 20000;

const trackedRequests = new Map();

const getRequestKey = (config) => {
  return JSON.stringify({
    url: config.url,
    params: config.params || {},
  });
};

// ==========================================
// TRACK SUCCESSFUL GET REQUESTS
// ==========================================

api.interceptors.response.use(
  (response) => {
    const config = response.config;

    if (
      config.method?.toLowerCase() === "get" &&
      !config.skipAutoRefresh &&
      !config._backgroundRefresh
    ) {
      const key = getRequestKey(config);

      trackedRequests.set(key, {
        url: config.url,
        params: config.params,
      });
    }

    return response;
  },
  (error) => Promise.reject(error),
);

// ==========================================
// BACKGROUND DATA REFRESH
// ==========================================

let refreshRunning = false;

export const refreshAllData = async () => {
  if (refreshRunning) return;

  if (document.visibilityState !== "visible") return;

  const token = localStorage.getItem("token");

  if (!token) {
    trackedRequests.clear();
    return;
  }

  refreshRunning = true;

  try {
    const requests = [...trackedRequests.values()];

    await Promise.allSettled(
      requests.map(({ url, params }) =>
        api.get(url, {
          params,
          _backgroundRefresh: true,
          skipAutoRefresh: true,
        }),
      ),
    );
  } finally {
    refreshRunning = false;
  }
};

// ==========================================
// AUTO REFRESH TIMER
// ==========================================

if (typeof window !== "undefined") {
  const globalKey = "__AMI_MAINT_API_REFRESH__";

  if (!window[globalKey]) {
    window[globalKey] = window.setInterval(() => {
      refreshAllData();
    }, REFRESH_INTERVAL);
  }
}

export default api;
