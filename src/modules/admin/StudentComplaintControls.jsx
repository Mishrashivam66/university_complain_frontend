import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  Ban,
  CheckCircle2,
  History,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  X,
} from "lucide-react";

import api from "../../services/api";

// ==========================================
// BLOCK REASON CATEGORIES
// ==========================================

const CATEGORIES = [
  {
    value: "ABUSIVE_LANGUAGE",
    label: "Abusive / Inappropriate Language",
  },
  {
    value: "FALSE_COMPLAINT",
    label: "Repeated False Complaints",
  },
  {
    value: "MISUSE",
    label: "Misuse of Complaint System",
  },
  {
    value: "OTHER",
    label: "Other Documented Reason",
  },
];

// ==========================================
// ERROR HELPER
// ==========================================

const messageFromError = (error, fallback) => {
  const message = error?.response?.data?.message;

  if (message) return message;

  if (error?.response?.status === 404) {
    return "Complaint access API not found. Check backend route registration and deployment.";
  }

  if (error?.response?.status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (error?.response?.status === 403) {
    return "Admin access is required to manage complaint restrictions.";
  }

  return fallback;
};

// ==========================================
// DATE HELPER
// ==========================================

const formatDate = (date) => {
  if (!date) return "—";

  const value = new Date(date);

  return Number.isNaN(value.getTime())
    ? "—"
    : value.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });
};

// ==========================================
// STUDENT COMPLAINT CONTROLS
// ==========================================

export default function StudentComplaintControls({ student, onChanged }) {
  const studentId = student?._id;

  // ======================================
  // STATES
  // ======================================

  const [access, setAccess] = useState(null);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  const [saving, setSaving] = useState(false);

  const [action, setAction] = useState(null);

  const [category, setCategory] = useState("ABUSIVE_LANGUAGE");

  const [reason, setReason] = useState("");

  // ======================================
  // FETCH CURRENT ACCESS + AUDIT HISTORY
  // ======================================

  const fetchAccess = useCallback(
    async (signal) => {
      if (!studentId) {
        setAccess(null);
        setLoading(false);
        setLoadError("No student selected.");
        return;
      }

      try {
        setLoading(true);
        setLoadError("");

        const { data } = await api.get(
          `/complaint-access/admin/${encodeURIComponent(studentId)}`,
          { signal },
        );

        if (signal?.aborted) return;

        if (data?.success !== true) {
          throw new Error(data?.message || "Unexpected API response");
        }

        setAccess(data);
      } catch (error) {
        if (signal?.aborted || error?.code === "ERR_CANCELED") {
          return;
        }

        const message = messageFromError(
          error,
          error?.message || "Failed to load complaint access",
        );

        setAccess(null);
        setLoadError(message);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [studentId],
  );

  // ======================================
  // AUTO LOAD WHEN STUDENT CHANGES
  // ======================================

  useEffect(() => {
    const controller = new AbortController();

    setAccess(null);
    setAction(null);
    setReason("");

    fetchAccess(controller.signal);

    return () => controller.abort();
  }, [fetchAccess]);

  // ======================================
  // OPEN BLOCK / UNBLOCK CONFIRMATION
  // ======================================

  const openAction = (nextAction) => {
    if (!access || loading || saving) {
      return;
    }

    setAction(nextAction);

    setCategory(nextAction === "BLOCK" ? "ABUSIVE_LANGUAGE" : "OTHER");

    setReason("");
  };

  // ======================================
  // SUBMIT ADMIN ACTION
  // ======================================

  const submitAction = async (event) => {
    event.preventDefault();

    if (!action || !access || saving || loading || !studentId) {
      return;
    }

    const cleanedReason = reason.trim();

    if (cleanedReason.length < 10 || cleanedReason.length > 500) {
      toast.error("Reason must contain 10 to 500 characters.");
      return;
    }

    try {
      setSaving(true);

      const { data } = await api.patch(
        `/complaint-access/admin/${encodeURIComponent(studentId)}`,
        {
          action,
          category,
          reason: cleanedReason,
        },
      );

      if (data?.success !== true) {
        throw new Error(data?.message || "Update failed");
      }

      // Close confirmation only after success.
      setAction(null);
      setReason("");

      // Update Manage Students parent list.
      onChanged?.({
        complaintAccessBlocked: Boolean(data.complaintAccessBlocked),

        complaintBlockReason: data.complaintBlockReason || "",

        complaintBlockCategory: data.complaintBlockCategory || "",

        complaintBlockedAt: data.complaintBlockedAt || null,

        complaintBlockedBy: data.complaintBlockedBy || null,
      });

      toast.success(data.message || "Complaint access updated successfully");

      // Reload latest status and audit history.
      await fetchAccess();
    } catch (error) {
      toast.error(
        messageFromError(
          error,
          error?.message || "Unable to update complaint access",
        ),
      );

      // Recover from stale block/unblock status.
      if (error?.response?.status === 409) {
        await fetchAccess();
      }
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // UI
  // ======================================

  return (
    <section className="border-t border-slate-200 bg-white p-4 text-[#10264B] sm:p-5">
      {/* HEADER */}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-extrabold">
            <ShieldAlert size={20} className="text-[#163D73]" />
            Complaint Access Control
          </h3>

          <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
            Block only new complaint submissions. Login and previous complaint
            history stay available.
          </p>
        </div>

        {/* REFRESH */}

        <button
          type="button"
          onClick={() => fetchAccess()}
          disabled={loading || saving}
          aria-label="Refresh complaint permission"
          title="Refresh"
          className="rounded-lg bg-slate-100 p-2 transition hover:bg-slate-200 disabled:opacity-50"
        >
          <RefreshCcw size={16} />
        </button>
      </div>

      {/* LOADING */}

      {loading ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 size={17} className="animate-spin" />
          Checking complaint permission...
        </div>
      ) : loadError || !access ? (
        /* ERROR + RETRY */

        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm text-red-700">
            {loadError || "Complaint access details are unavailable."}
          </p>

          <button
            type="button"
            onClick={() => fetchAccess()}
            className="mt-2 text-sm font-bold text-[#163D73] underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* CURRENT COMPLAINT PERMISSION */}

          <div className="mt-4 rounded-xl border border-slate-200 bg-[#F8FAFD] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold">Complaint Permission</p>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  access.complaintAccessBlocked
                    ? "bg-red-100 text-red-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {access.complaintAccessBlocked ? "Blocked" : "Allowed"}
              </span>
            </div>

            {/* BLOCK DETAILS */}

            {access.complaintAccessBlocked ? (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-xs font-extrabold text-red-700">
                  Current Block Reason
                </p>

                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">
                  {access.complaintBlockReason || "Reason not available"}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Blocked: {formatDate(access.complaintBlockedAt)}
                  {access.complaintBlockedBy?.name
                    ? ` · By ${access.complaintBlockedBy.name}`
                    : ""}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-emerald-700">
                This student is allowed to submit new maintenance complaints.
              </p>
            )}
          </div>

          {/* BLOCK / UNBLOCK BUTTON */}

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              openAction(access.complaintAccessBlocked ? "UNBLOCK" : "BLOCK")
            }
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:opacity-50 ${
              access.complaintAccessBlocked
                ? "bg-emerald-700 hover:bg-emerald-800"
                : "bg-red-700 hover:bg-red-800"
            }`}
          >
            {access.complaintAccessBlocked ? (
              <CheckCircle2 size={18} />
            ) : (
              <Ban size={18} />
            )}

            {access.complaintAccessBlocked
              ? "Unblock Complaints"
              : "Block Complaints"}
          </button>

          {/* AUDIT HISTORY */}

          <details className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
            <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold">
              <History size={17} />
              Block / Unblock History ({access.history?.length || 0})
            </summary>

            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
              {!access.history?.length ? (
                <p className="text-xs text-slate-500">
                  No previous Block / Unblock actions.
                </p>
              ) : (
                [...access.history].reverse().map((entry, index) => (
                  <div
                    key={`${entry.at}-${index}`}
                    className="rounded-lg border border-slate-100 bg-[#F8FAFD] p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span
                        className={`text-xs font-extrabold ${
                          entry.action === "BLOCK"
                            ? "text-red-700"
                            : "text-emerald-700"
                        }`}
                      >
                        {entry.action}
                      </span>

                      <span className="text-xs text-slate-500">
                        {formatDate(entry.at)}
                      </span>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">
                      {entry.reason || "—"}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Admin: {entry.actor?.name || "Unavailable"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </details>
        </>
      )}

      {/* ======================================
          BLOCK / UNBLOCK CONFIRMATION
      ====================================== */}

      {action && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#06142A]/80 p-3">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="complaint-block-title"
            className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6"
          >
            {/* MODAL HEADER */}

            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  id="complaint-block-title"
                  className="text-xl font-extrabold"
                >
                  {action === "BLOCK"
                    ? "Block Complaints"
                    : "Unblock Complaints"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Student: {student?.name || "Student"}
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => setAction(null)}
                aria-label="Close confirmation"
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={submitAction} className="mt-5 space-y-4">
              {/* CATEGORY */}

              <label className="block text-sm font-bold">
                Reason Category
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-amber-500"
                >
                  {CATEGORIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* MANDATORY REASON */}

              <label className="block text-sm font-bold">
                {action === "BLOCK"
                  ? "Reason for Blocking"
                  : "Reason for Unblocking"}
                {" *"}

                <textarea
                  required
                  minLength={10}
                  maxLength={500}
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    action === "BLOCK"
                      ? "Example: Abusive language in a maintenance complaint verified by Admin."
                      : "Example: Student was counselled and complaint access restored."
                  }
                  className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-amber-500"
                />
              </label>

              <p className="text-xs text-slate-500">
                {reason.trim().length}/500 characters. Minimum 10 characters.
                Admin and time are logged.
              </p>

              {/* ACTION BUTTONS */}

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setAction(null)}
                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    reason.trim().length < 10 ||
                    reason.trim().length > 500
                  }
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 ${
                    action === "BLOCK" ? "bg-red-700" : "bg-emerald-700"
                  }`}
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}

                  {saving
                    ? "Saving..."
                    : action === "BLOCK"
                      ? "Confirm Block"
                      : "Confirm Unblock"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
