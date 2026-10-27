import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Loader2,
  LogOut,
  MapPin,
  Package,
  Play,
  RefreshCw,
  Search,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

import api from "../../../services/api";

const upper = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const readable = (value) => String(value || "—").replaceAll("_", " ");

const done = new Set(["RESOLVED", "CLOSED"]);

const awaiting = new Set(["COMPLETED", "AWAITING_STUDENT_CONFIRMATION"]);

function dateIST(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function locationOf(job) {
  return (
    [
      job.hostel || job.block,
      job.floor ? `Floor ${job.floor}` : "",
      job.roomNumber ? `Room ${job.roomNumber}` : "",
    ]
      .filter(Boolean)
      .join(" · ") || "—"
  );
}

function statusClass(status) {
  const value = upper(status);

  if (done.has(value)) {
    return "bg-emerald-50 text-emerald-800";
  }

  if (value === "REOPENED") {
    return "bg-rose-50 text-rose-800";
  }

  if (awaiting.has(value)) {
    return "bg-amber-50 text-amber-800";
  }

  return "bg-blue-50 text-blue-800";
}

function storedUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

export default function TechnicianDashboard() {
  const navigate = useNavigate();

  const [user] = useState(storedUser);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [selectedId, setSelectedId] = useState("");
  const [startingId, setStartingId] = useState("");

  // ========================================
  // FETCH OWN ASSIGNED JOBS
  // ========================================

  const fetchMyJobs = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.get("/maintenance/worker/my-jobs");

      setJobs(
        Array.isArray(response.data?.complaints)
          ? response.data.complaints
          : [],
      );

      setError("");
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load assigned jobs.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchMyJobs();

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchMyJobs(true);
      }
    }, 30000);

    return () => window.clearInterval(interval);
  }, [fetchMyJobs]);

  // ========================================
  // STATISTICS
  // ========================================

  const stats = useMemo(
    () => ({
      total: jobs.length,

      assigned: jobs.filter((job) => upper(job.status) === "ASSIGNED").length,

      active: jobs.filter((job) => upper(job.status) === "IN_PROGRESS").length,

      awaiting: jobs.filter((job) => awaiting.has(upper(job.status))).length,

      resolved: jobs.filter((job) => done.has(upper(job.status))).length,
    }),
    [jobs],
  );

  // ========================================
  // SEARCH AND FILTERS
  // ========================================

  const filteredJobs = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const status = upper(job.status);

      const matchFilter =
        filter === "ALL" ||
        (filter === "ASSIGNED" && status === "ASSIGNED") ||
        (filter === "ACTIVE" && status === "IN_PROGRESS") ||
        (filter === "AWAITING" && awaiting.has(status)) ||
        (filter === "RESOLVED" && done.has(status));

      const searchText = [
        job.complaintId,
        job.title,
        job.description,
        job.category,
        job.hostel,
        job.block,
        job.roomNumber,
      ]
        .map((part) => String(part || "").toLowerCase())
        .join(" ");

      return matchFilter && (!needle || searchText.includes(needle));
    });
  }, [jobs, search, filter]);

  const selectedJob = jobs.find((job) => String(job._id) === selectedId);

  // ========================================
  // TECHNICIAN START WORK
  // ========================================

  async function startWork(job) {
    if (startingId || upper(job.status) !== "ASSIGNED") {
      return;
    }

    setStartingId(String(job._id));

    try {
      await api.put(`/maintenance/worker/my-jobs/${job._id}/start`);

      toast.success("Work started. Complaint is now In Progress.");

      await fetchMyJobs(true);
    } catch (requestError) {
      toast.error(
        requestError?.response?.data?.message ||
          "Cannot start work. Check your duty shift.",
      );
    } finally {
      setStartingId("");
    }
  }

  function logout() {
    ["token", "accessToken", "user", "role", "activeRole"].forEach((key) => {
      localStorage.removeItem(key);
    });

    navigate("/login", {
      replace: true,
    });
  }

  const infoClass = "rounded-xl border border-slate-200 p-3";

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-[#102B52]">
      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#102B52] p-2.5 text-amber-300">
              <Wrench size={22} />
            </div>

            <div>
              <h1 className="text-xl font-black">AmiMaintain</h1>

              <p className="text-xs text-slate-500">Technician Portal</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6 lg:p-8">
        {/* WELCOME */}

        <section className="rounded-3xl bg-gradient-to-r from-[#071C3C] to-[#204779] p-6 text-white shadow-lg">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
            TECHNICIAN WORKSPACE
          </p>

          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Welcome, {user.name || "Technician"}
          </h2>

          <p className="mt-2 text-sm text-slate-200">
            Assigned jobs are scheduled first. Start work during eligible duty.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              user.department || "Maintenance",
              `${user.shift || "DAY"} Shift`,
              `Account: ${user.status || "ACTIVE"}`,
            ].map((item) => (
              <span
                key={item}
                className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold"
              >
                {item}
              </span>
            ))}
          </div>

          <p className="mt-3 text-xs text-slate-300">
            Start Work eligibility is checked by the backend against your duty
            shift. 24x7 means emergency on-call.
          </p>
        </section>

        {/* STATS */}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            ["Total Assigned", stats.total, ClipboardList],
            ["Awaiting Start", stats.assigned, Clock3],
            ["In Progress", stats.active, Wrench],
            ["Awaiting Student", stats.awaiting, CheckCircle2],
            ["Resolved", stats.resolved, CheckCircle2],
          ].map(([label, value, Icon]) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <Icon size={21} className="text-[#B48632]" />

              <p className="mt-3 text-2xl font-black">{value}</p>

              <p className="text-xs font-semibold text-slate-500">{label}</p>
            </div>
          ))}
        </section>

        {/* JOB DIRECTORY */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
            <div>
              <h3 className="text-lg font-black">My Assigned Complaints</h3>

              <p className="text-xs text-slate-500">
                Only your assigned jobs are returned by the API.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void fetchMyJobs(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl bg-[#102B52] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <label className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search complaints..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-amber-400"
              />
            </label>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-3 text-sm"
            >
              <option value="ALL">All Jobs</option>
              <option value="ASSIGNED">Awaiting Start</option>
              <option value="ACTIVE">In Progress</option>
              <option value="AWAITING">Awaiting Student</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          {error && (
            <p
              role="alert"
              className="mx-4 mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
            >
              {error}
            </p>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
              <Loader2 size={19} className="animate-spin" />
              Loading jobs...
            </div>
          ) : filteredJobs.length === 0 ? (
            <p className="py-14 text-center text-sm text-slate-500">
              No matching assigned complaints.
            </p>
          ) : (
            <div className="grid gap-3 px-4 pb-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredJobs.map((job) => (
                <article
                  key={job._id}
                  className="rounded-xl border border-slate-200 p-4 hover:border-amber-400"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-sm">{job.complaintId}</strong>

                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-bold ${statusClass(
                        job.status,
                      )}`}
                    >
                      {readable(job.status)}
                    </span>
                  </div>

                  <h4 className="mt-3 line-clamp-2 font-bold">
                    {job.title || "Untitled Complaint"}
                  </h4>

                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={14} />
                    {locationOf(job)}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {job.category || "—"} · {job.priority || "—"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Material:{" "}
                    {job.materialRequired
                      ? readable(job.materialStatus || "PENDING")
                      : "Not Required"}
                  </p>

                  <button
                    type="button"
                    onClick={() => setSelectedId(String(job._id))}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#102B52] px-4 py-2.5 text-sm font-bold text-white"
                  >
                    View Job Details
                    <ArrowRight size={16} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* JOB DETAILS MODAL */}

      {selectedJob && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Job Details"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3"
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-amber-700">
                  ASSIGNED COMPLAINT
                </p>

                <h3 className="mt-1 text-xl font-black">
                  {selectedJob.complaintId}
                </h3>
              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={() => setSelectedId("")}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="font-black">{selectedJob.title}</p>

                <p className="mt-2 whitespace-pre-wrap text-slate-600">
                  {selectedJob.description || "No description"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={infoClass}>
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={13} />
                    Location
                  </p>

                  <p className="mt-2 font-semibold">
                    {locationOf(selectedJob)}
                  </p>
                </div>

                <div className={infoClass}>
                  <p className="text-xs text-slate-500">Status</p>

                  <p className="mt-2 font-semibold">
                    {readable(selectedJob.status)}
                  </p>
                </div>

                <div className={infoClass}>
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <Package size={13} />
                    Materials
                  </p>

                  <p className="mt-2 font-semibold">
                    {selectedJob.materialRequired
                      ? readable(selectedJob.materialStatus || "PENDING")
                      : "Not Required"}
                  </p>
                </div>

                <div className={infoClass}>
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <UserRound size={13} />
                    Reported By
                  </p>

                  <p className="mt-2 font-semibold">
                    {selectedJob.createdBy?.name || "Student"}
                  </p>
                </div>
              </div>

              {/* TIMELINE */}

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="flex items-center gap-2 font-bold">
                  <CalendarDays size={17} />
                  Work Timeline
                </p>

                <p className="mt-3 text-xs text-slate-600">
                  Created: {dateIST(selectedJob.createdAt)}
                </p>

                <p className="mt-2 text-xs text-slate-600">
                  Work Started: {dateIST(selectedJob.startedAt)}
                </p>

                <p className="mt-2 text-xs text-slate-600">
                  Work Completed: {dateIST(selectedJob.completedAt)}
                </p>
              </div>

              {/* START WORK */}

              {upper(selectedJob.status) === "ASSIGNED" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <h4 className="font-bold">Ready to start?</h4>

                  <p className="mt-1 text-xs text-slate-600">
                    This job has been assigned but is not yet In Progress. Start
                    Work will be validated against your duty shift by the
                    server.
                  </p>

                  <button
                    type="button"
                    disabled={Boolean(startingId)}
                    onClick={() => void startWork(selectedJob)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#102B52] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {startingId ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Play size={16} />
                    )}

                    {startingId ? "Starting..." : "Start Work"}
                  </button>
                </div>
              )}

              {upper(selectedJob.status) === "IN_PROGRESS" && (
                <p className="rounded-xl bg-blue-50 p-3 text-xs text-blue-900">
                  Work is in progress. Work Done submission will use the
                  existing completion API after integration.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
