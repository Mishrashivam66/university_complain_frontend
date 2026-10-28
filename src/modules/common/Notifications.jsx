import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  BellRing,
  Check,
  CheckCheck,
  ChevronDown,
  Clock3,
  Inbox,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

import api from "../../services/api";

// =====================================================
// AMI MAINTENANCE - PREMIUM NOTIFICATION BELL
// Shared by Student, Manager, Technician and others
// =====================================================

const PAGE_SIZE = 12;
const API_ROOT = "/notifications";

// =====================================================
// HELPERS
// =====================================================

function getCurrentRole() {
  try {
    return String(
      JSON.parse(localStorage.getItem("user") || "{}")?.role || "",
    ).toUpperCase();
  } catch {
    return "";
  }
}

function relativeDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// =====================================================
// ONLY ALLOW INTERNAL NAVIGATION
// =====================================================

function safeInternalPath(path) {
  if (typeof path !== "string") {
    return "";
  }

  const value = path.trim();

  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return "";
  }

  if (/\s|[\\<>]/.test(value)) {
    return "";
  }

  return value;
}

// =====================================================
// RELATED COMPLAINT
// =====================================================

function referencedComplaintId(item) {
  const fields = [
    item.relatedComplaint,

    item.relatedId && item.relatedModel === "Complaint" ? item.relatedId : null,

    item.data?.complaintId,
  ];

  for (const field of fields) {
    const id = typeof field === "object" ? field?._id : field;

    if (typeof id === "string" && /^[a-f0-9]{24}$/i.test(id)) {
      return id;
    }
  }

  return "";
}

// =====================================================
// NOTIFICATION DESTINATION
// =====================================================

function destinationFor(item) {
  const role = getCurrentRole();

  if (role === "STUDENT") {
    const id = referencedComplaintId(item);

    if (id) {
      return `/complaints/${id}`;
    }
  }

  return safeInternalPath(item.actionUrl || item.link || item.url || "");
}

// =====================================================
// NOTIFICATION COLORS
// =====================================================

function colorFor(item) {
  const title = String(item.title || "").toLowerCase();

  const priority = String(item.priority || "").toUpperCase();

  const type = String(item.type || "").toUpperCase();

  if (
    title.includes("delay") ||
    title.includes("overdue") ||
    type === "ESCALATION" ||
    priority === "CRITICAL"
  ) {
    return {
      Icon: ShieldAlert,
      wrap: "bg-rose-50 text-rose-600",
      chip: "bg-rose-50 text-rose-700",
      bar: "bg-rose-400",
    };
  }

  if (type === "REOPEN" || priority === "HIGH") {
    return {
      Icon: AlertTriangle,
      wrap: "bg-amber-50 text-amber-700",
      chip: "bg-amber-50 text-amber-700",
      bar: "bg-amber-400",
    };
  }

  if (type === "WORKER_ASSIGN" || type === "STATUS_UPDATE") {
    return {
      Icon: Wrench,
      wrap: "bg-sky-50 text-sky-700",
      chip: "bg-sky-50 text-sky-700",
      bar: "bg-sky-400",
    };
  }

  return {
    Icon: BellRing,
    wrap: "bg-indigo-50 text-indigo-700",
    chip: "bg-indigo-50 text-indigo-700",
    bar: "bg-indigo-400",
  };
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function NotificationBell() {
  const navigate = useNavigate();

  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  // ===================================================
  // STATE
  // ===================================================

  const [open, setOpen] = useState(false);

  const [notices, setNotices] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [tab, setTab] = useState("all");

  const [search, setSearch] = useState("");

  const [limit, setLimit] = useState(PAGE_SIZE);

  const [busyId, setBusyId] = useState("");

  const [bulkBusy, setBulkBusy] = useState(false);

  const [confirmClear, setConfirmClear] = useState(false);

  const [position, setPosition] = useState({
    left: 12,
    top: 76,
    width: 420,
    height: 600,
  });

  // ===================================================
  // FETCH NOTIFICATIONS
  // ===================================================

  const load = useCallback(async (quiet = false) => {
    if (quiet) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data } = await api.get(API_ROOT);

      const list = Array.isArray(data?.notifications)
        ? data.notifications
        : Array.isArray(data)
          ? data
          : [];

      setNotices(list);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ===================================================
  // INITIAL LOAD + POLLING
  //
  // No Socket.IO dependency.
  // ===================================================

  useEffect(() => {
    load();

    const id = window.setInterval(() => {
      if (!document.hidden && localStorage.getItem("token")) {
        load(true);
      }
    }, 60000);

    return () => window.clearInterval(id);
  }, [load]);

  // ===================================================
  // RELOAD WHEN POPUP OPENS
  // ===================================================

  useEffect(() => {
    if (open) {
      setLimit(PAGE_SIZE);
      load(true);
    }
  }, [open, load]);

  // ===================================================
  // RESPONSIVE POPUP POSITION
  //
  // Portal avoids clipping inside navbar.
  // ===================================================

  const adjustPosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();

    if (!rect) return;

    const width = Math.min(440, window.innerWidth - 24);

    const left = Math.min(
      Math.max(12, rect.right - width),
      window.innerWidth - width - 12,
    );

    const top = Math.min(
      rect.bottom + 12,
      Math.max(12, window.innerHeight - 200),
    );

    setPosition({
      left,
      top,
      width,

      height: Math.max(180, window.innerHeight - top - 12),
    });
  }, []);

  // ===================================================
  // OUTSIDE CLICK / ESCAPE / RESIZE
  // ===================================================

  useEffect(() => {
    if (!open) return undefined;

    adjustPosition();

    const outside = (event) => {
      if (
        !panelRef.current?.contains(event.target) &&
        !triggerRef.current?.contains(event.target)
      ) {
        setOpen(false);
        setConfirmClear(false);
      }
    };

    const keydown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setConfirmClear(false);

        triggerRef.current?.focus();
      }
    };

    window.addEventListener("resize", adjustPosition);

    window.addEventListener("scroll", adjustPosition, true);

    document.addEventListener("pointerdown", outside);

    document.addEventListener("keydown", keydown);

    return () => {
      window.removeEventListener("resize", adjustPosition);

      window.removeEventListener("scroll", adjustPosition, true);

      document.removeEventListener("pointerdown", outside);

      document.removeEventListener("keydown", keydown);
    };
  }, [open, adjustPosition]);

  // ===================================================
  // COUNTS / FILTERING
  // ===================================================

  const unread = useMemo(
    () => notices.filter((item) => !item.isRead).length,
    [notices],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notices
      .filter((item) => {
        const matchTab = tab === "all" || !item.isRead;

        const matchSearch =
          !query ||
          `${item.title || ""} ${item.message || ""}`
            .toLowerCase()
            .includes(query);

        return matchTab && matchSearch;
      })
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [notices, tab, search]);

  const shown = filtered.slice(0, limit);

  // ===================================================
  // MARK SINGLE NOTIFICATION READ
  // ===================================================

  const markRead = async (id, showToast = true) => {
    if (!id) return;

    setBusyId(id);

    try {
      await api.put(`${API_ROOT}/read/${id}`, {});

      setNotices((previous) =>
        previous.map((item) =>
          item._id === id
            ? {
                ...item,
                isRead: true,
              }
            : item,
        ),
      );

      if (showToast) {
        toast.success("Marked as read", {
          duration: 1200,
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not mark as read");
    } finally {
      setBusyId("");
    }
  };

  // ===================================================
  // DELETE SINGLE NOTIFICATION
  // ===================================================

  const remove = async (id) => {
    setBusyId(id);

    try {
      await api.delete(`${API_ROOT}/delete/${id}`);

      setNotices((previous) => previous.filter((item) => item._id !== id));

      toast.success("Notification deleted", {
        duration: 1200,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setBusyId("");
    }
  };

  // ===================================================
  // MARK ALL AS READ
  // ===================================================

  const markAll = async () => {
    if (!unread || bulkBusy) return;

    setBulkBusy(true);

    try {
      await api.put(`${API_ROOT}/read-all`, {});

      setNotices((previous) =>
        previous.map((item) => ({
          ...item,
          isRead: true,
        })),
      );

      toast.success("All notifications marked as read", {
        duration: 1200,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to mark all as read");
    } finally {
      setBulkBusy(false);
    }
  };

  // ===================================================
  // CLEAR ALL NOTIFICATIONS
  // ===================================================

  const clearAll = async () => {
    if (bulkBusy) return;

    setBulkBusy(true);

    try {
      await api.delete(`${API_ROOT}/clear-all`);

      setNotices([]);
      setConfirmClear(false);

      toast.success("Notifications cleared", {
        duration: 1200,
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to clear notifications",
      );
    } finally {
      setBulkBusy(false);
    }
  };

  // ===================================================
  // OPEN NOTIFICATION DETAILS
  // ===================================================

  const openNotification = async (notice) => {
    const target = destinationFor(notice);

    if (!target) return;

    if (!notice.isRead && notice._id) {
      await markRead(notice._id, false);
    }

    setOpen(false);
    navigate(target);
  };

  // ===================================================
  // PREMIUM POPUP
  // ===================================================

  const popup = (
    <section
      ref={panelRef}
      role="dialog"
      aria-label="Notification center"
      style={{
        left: position.left,
        top: position.top,
        width: position.width,
        maxHeight: position.height,
      }}
      className="fixed z-[100] flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-[#E4EAF2] bg-white shadow-[0_24px_70px_rgba(8,27,52,0.26)]"
    >
      {/* ========================================
          PREMIUM HEADER
      ======================================== */}

      <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-[#09213F] via-[#143765] to-[#224B77] px-5 pb-4 pt-5 text-white">
        <div className="pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full border border-white/10 bg-white/5" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#F0C66E]/20 bg-[#F0C66E]/15 text-[#F0C66E]">
              <BellRing size={22} />
            </div>

            <div>
              <h2 className="text-lg font-extrabold tracking-tight">
                Notifications
              </h2>

              <p className="mt-0.5 text-xs text-slate-200">
                {unread
                  ? `${unread} unread notifications`
                  : "You're all caught up"}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            className="rounded-xl border border-white/15 bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#F2CE84]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F2CE84]" />
          AMI MAINTENANCE • Notification Center
        </div>
      </div>

      {/* ========================================
          FILTER / BULK ACTIONS / SEARCH
      ======================================== */}

      <div className="shrink-0 space-y-3 border-b border-slate-100 bg-white px-4 py-3">
        {/* ALL / UNREAD TABS */}

        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl bg-[#F3F6FB] p-1">
            <button
              type="button"
              onClick={() => {
                setTab("all");
                setLimit(PAGE_SIZE);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                tab === "all"
                  ? "bg-white text-[#12345B] shadow-sm"
                  : "text-slate-500"
              }`}
            >
              All ({notices.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setTab("unread");
                setLimit(PAGE_SIZE);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                tab === "unread"
                  ? "bg-white text-[#12345B] shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Unread ({unread})
            </button>
          </div>

          {/* REFRESH */}

          <button
            type="button"
            disabled={refreshing}
            onClick={() => load(true)}
            aria-label="Refresh notifications"
            title="Refresh"
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {/* BULK ACTIONS */}

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!unread || bulkBusy}
            onClick={markAll}
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-[#DCE6F2] bg-[#F7FAFE] px-3 py-2 text-xs font-extrabold text-[#183A63] transition hover:bg-[#EAF2FC] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCheck size={15} />
            Read All
          </button>

          <button
            type="button"
            disabled={!notices.length || bulkBusy}
            onClick={() => setConfirmClear(true)}
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-extrabold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={15} />
            Clear All
          </button>
        </div>

        {/* SEARCH */}

        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-2.5 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setLimit(PAGE_SIZE);
            }}
            placeholder="Search notifications..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-[#102746] outline-none focus:border-[#D6A94C]"
          />
        </div>
      </div>

      {/* ========================================
          SCROLLABLE NOTIFICATION LIST
      ======================================== */}

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain bg-[#F7F9FC] p-3 [scrollbar-width:thin]">
        {loading ? (
          <div className="flex min-h-36 items-center justify-center gap-3 text-sm text-slate-500">
            <LoaderCircle size={20} className="animate-spin" />
            Loading notifications...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-100 bg-white p-5 text-center">
            <AlertCircle className="mx-auto text-rose-500" size={27} />

            <p className="mt-2 text-sm font-semibold text-slate-700">{error}</p>

            <button
              type="button"
              onClick={() => load(true)}
              className="mt-3 text-xs font-bold text-[#17416E] underline"
            >
              Try again
            </button>
          </div>
        ) : shown.length === 0 ? (
          <div className="py-10 text-center">
            <Inbox size={35} className="mx-auto text-slate-300" />

            <h3 className="mt-3 text-sm font-extrabold text-[#102746]">
              {tab === "unread"
                ? "No unread notifications"
                : "No notifications found"}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {search ? "Try another search term." : "You're all caught up."}
            </p>
          </div>
        ) : (
          <>
            {shown.map((notice) => {
              const style = colorFor(notice);

              const Icon = style.Icon;

              const destination = destinationFor(notice);

              const priority = String(notice.priority || "").toUpperCase();

              return (
                <article
                  key={notice._id}
                  className={`relative overflow-hidden rounded-2xl border bg-white p-3.5 shadow-sm transition hover:shadow-md ${
                    notice.isRead ? "border-slate-200" : "border-[#D5E2F2]"
                  }`}
                >
                  {/* UNREAD COLOR BAR */}

                  {!notice.isRead && (
                    <span
                      className={`absolute inset-y-0 left-0 w-1 ${style.bar}`}
                    />
                  )}

                  <div className="flex items-start gap-3">
                    {/* ICON */}

                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.wrap}`}
                    >
                      <Icon size={19} />
                    </span>

                    {/* NOTIFICATION CONTENT */}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="break-words text-[13px] font-extrabold leading-5 text-[#102746]">
                          {notice.title || "Notification"}
                        </h3>

                        {!notice.isRead && (
                          <span
                            title="Unread"
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2E6FDD]"
                          />
                        )}
                      </div>

                      {/* MESSAGE */}

                      <p className="mt-1.5 break-words text-xs leading-5 text-slate-600">
                        {notice.message || "You have a new notification."}
                      </p>

                      {/* PRIORITY AND DATE */}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {priority && (
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${style.chip}`}
                          >
                            {priority}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock3 size={12} />

                          {relativeDate(notice.createdAt)}
                        </span>
                      </div>

                      {/* NOTIFICATION ACTIONS */}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {destination && (
                          <button
                            type="button"
                            onClick={() => openNotification(notice)}
                            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#164A86] transition hover:text-[#B38125]"
                          >
                            View details
                            <ArrowRight size={13} />
                          </button>
                        )}

                        {!notice.isRead && (
                          <button
                            type="button"
                            disabled={busyId === notice._id}
                            onClick={() => markRead(notice._id)}
                            className="ml-auto inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <Check size={13} />
                            Mark read
                          </button>
                        )}

                        {/* DELETE */}

                        <button
                          type="button"
                          disabled={busyId === notice._id}
                          onClick={() => remove(notice._id)}
                          aria-label="Delete notification"
                          title="Delete"
                          className={`${
                            notice.isRead || !destination ? "ml-auto" : ""
                          } rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {/* LOAD MORE */}

            {filtered.length > limit && (
              <button
                type="button"
                onClick={() => setLimit((current) => current + PAGE_SIZE)}
                className="flex w-full items-center justify-center gap-1 rounded-xl bg-white py-3 text-xs font-bold text-[#18426E] shadow-sm hover:bg-[#EDF4FC]"
              >
                Show more ({filtered.length - limit} remaining)
                <ChevronDown size={15} />
              </button>
            )}
          </>
        )}
      </div>

      {/* ========================================
          FOOTER
      ======================================== */}

      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-100 bg-white px-4 py-3">
        <span className="text-[11px] text-slate-400">AMI Maintenance</span>

        <button
          type="button"
          onClick={() => {
            setOpen(false);

            navigate("/notifications");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-extrabold text-[#16416D] hover:bg-slate-100"
        >
          View all notifications
          <ArrowRight size={14} />
        </button>
      </div>

      {/* ========================================
          CUSTOM CLEAR ALL CONFIRMATION
      ======================================== */}

      {confirmClear && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#071B34]/60 p-5 backdrop-blur-[2px]">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Trash2 size={21} />
            </div>

            <h3 className="mt-3 text-lg font-extrabold text-[#102746]">
              Clear all notifications?
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-600">
              This deletes {notices.length} notifications from your account.
              This action cannot be undone.
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={bulkBusy}
                onClick={() => setConfirmClear(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={bulkBusy}
                onClick={clearAll}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-extrabold text-white disabled:opacity-50"
              >
                {bulkBusy ? "Clearing..." : "Clear All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );

  // ===================================================
  // NOTIFICATION BELL + PORTAL
  // ===================================================

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Notifications, ${unread} unread`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => {
          adjustPosition();

          setOpen((previous) => !previous);

          setConfirmClear(false);
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#15375F] transition hover:bg-[#F2F6FD]"
      >
        <Bell size={21} />

        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[9px] font-black leading-none text-white shadow-sm">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && createPortal(popup, document.body)}
    </>
  );
}
