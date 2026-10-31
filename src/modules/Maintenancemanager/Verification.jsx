import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";

import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  FileCheck2,
  FilterX,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Wrench,
  X,
} from "lucide-react";

// ======================================================
// AMI MAINT. — PREMIUM VERIFICATION CENTER
// Existing backend verification endpoint preserved.
// ======================================================

const API = "/maintenance/job-cards";

const INPUT =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#102B52] outline-none transition focus:border-[#D6AD59] focus:ring-2 focus:ring-amber-100 disabled:opacity-50";

const PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#102B52] px-4 py-3 text-xs font-extrabold text-white transition hover:bg-[#204779] disabled:cursor-not-allowed disabled:opacity-50";

const SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-[#102B52] transition hover:bg-slate-50 disabled:opacity-50";

const GOLD =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#D6AD59] px-4 py-3 text-xs font-extrabold text-[#081B35] transition hover:bg-[#E8C477] disabled:cursor-not-allowed disabled:opacity-50";

const upper = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

const lower = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const idOf = (value) => String(value?._id ?? value ?? "");

const readable = (value) => String(value || "—").replaceAll("_", " ");

function isCompleted(item) {
  return ["COMPLETED", "CLOSED"].includes(upper(item?.status));
}

function getComplaintId(item) {
  return idOf(item?.complaint);
}

function locationOf(job) {
  return job.hostel || job.block || "Other";
}

function getPendingItems(job) {
  return (job.complaints || []).filter((item) => !isCompleted(item));
}

function pendingIds(job) {
  return getPendingItems(job).map(getComplaintId).filter(Boolean);
}

// ======================================================
// COMPONENTS
// ======================================================

function StatCard({ icon: Icon, title, value, detail, tone = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-indigo-50 text-indigo-600",
    green: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="group rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#D6AD59]/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colors[tone]}`}
        >
          <Icon size={23} strokeWidth={1.8} />
        </div>

        <Activity size={15} className="text-slate-300" />
      </div>

      <p className="mt-5 text-[30px] font-black tracking-tight text-[#102B52]">
        {value}
      </p>

      <p className="mt-1 text-xs font-bold text-slate-600">{title}</p>

      <p className="mt-2 text-[11px] leading-5 text-slate-400">{detail}</p>
    </div>
  );
}

function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-[#F8FAFD] p-3.5">
      <div className="flex items-center gap-2 text-[#A87D30]">
        <Icon size={15} />
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
          {label}
        </p>
      </div>

      <p className="mt-2 break-words text-[13px] font-extrabold text-[#102B52]">
        {value || "—"}
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-48 rounded-[26px] bg-slate-200" />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 rounded-2xl bg-slate-200" />
        ))}
      </div>

      <div className="h-24 rounded-2xl bg-slate-200" />

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-72 rounded-3xl bg-slate-200" />
        <div className="h-72 rounded-3xl bg-slate-200" />
      </div>
    </div>
  );
}

// ======================================================
// MAIN VERIFICATION PAGE
// ======================================================

export default function Verification() {
  const navigate = useNavigate();

  const [jobCards, setJobCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [workerFilter, setWorkerFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [selectedComplaints, setSelectedComplaints] = useState({});

  const [updatingJobs, setUpdatingJobs] = useState({});
  const [confirmationId, setConfirmationId] = useState(null);

  const [expandedJobs, setExpandedJobs] = useState({});

  // ====================================================
  // FETCH DATA
  // ====================================================

  const fetchJobCards = useCallback(async ({ silent = false, signal } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await api.get(API, { signal });

      const items = response?.data?.jobCards;

      if (!Array.isArray(items)) {
        throw new Error("Invalid verification response");
      }

      if (signal?.aborted) return;

      setJobCards(items);
      setError("");

      if (silent) {
        toast.success("Verification records refreshed", {
          duration: 1200,
        });
      }
    } catch (err) {
      if (
        signal?.aborted ||
        err?.code === "ERR_CANCELED" ||
        err?.name === "CanceledError"
      ) {
        return;
      }

      console.error("VERIFICATION LOAD ERROR:", err);

      const message =
        err?.response?.data?.message || "Unable to load verification records";

      setError(message);

      if (!silent) {
        toast.error(message, { duration: 2000 });
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetchJobCards({
      signal: controller.signal,
    });

    return () => controller.abort();
  }, [fetchJobCards]);

  // ====================================================
  // DERIVED DATA
  // ====================================================

  const verificationJobs = useMemo(
    () =>
      jobCards.filter(
        (job) =>
          upper(job.printStatus) === "PRINTED" &&
          !["COMPLETED", "CLOSED"].includes(upper(job.status)),
      ),
    [jobCards],
  );

  const workers = useMemo(() => {
    const map = new Map();

    verificationJobs.forEach((job) => {
      const worker = job.assignedWorker;

      if (worker?._id) {
        map.set(idOf(worker._id), worker);
      }
    });

    return [...map.values()].sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || "")),
    );
  }, [verificationJobs]);

  const locations = useMemo(
    () => [...new Set(verificationJobs.map(locationOf))].sort(),
    [verificationJobs],
  );

  const categories = useMemo(
    () =>
      [
        ...new Set(verificationJobs.map((job) => job.category).filter(Boolean)),
      ].sort(),
    [verificationJobs],
  );

  const totalPending = useMemo(
    () =>
      verificationJobs.reduce(
        (total, job) => total + getPendingItems(job).length,
        0,
      ),
    [verificationJobs],
  );

  const completedCount = useMemo(
    () =>
      jobCards.reduce(
        (total, job) =>
          total + (job.complaints || []).filter(isCompleted).length,
        0,
      ),
    [jobCards],
  );

  const filteredJobs = useMemo(() => {
    const query = lower(search);

    return verificationJobs.filter((job) => {
      const searchable = [
        job.jobCardId,
        job.hostel,
        job.block,
        job.category,
        job.assignedWorker?.name,
        ...(job.complaints || []).flatMap((item) => [
          item.complaint?.complaintId,
          item.title || item.complaint?.title,
          item.roomNumber,
          item.floor,
        ]),
      ]
        .map(lower)
        .join(" ");

      return (
        (!query || searchable.includes(query)) &&
        (workerFilter === "ALL" || idOf(job.assignedWorker) === workerFilter) &&
        (locationFilter === "ALL" || locationOf(job) === locationFilter) &&
        (categoryFilter === "ALL" || job.category === categoryFilter)
      );
    });
  }, [verificationJobs, search, workerFilter, locationFilter, categoryFilter]);

  const confirmationJob = useMemo(
    () => jobCards.find((job) => idOf(job._id) === confirmationId) || null,
    [jobCards, confirmationId],
  );

  function validSelectedIds(job) {
    const valid = new Set(pendingIds(job));

    return (selectedComplaints[idOf(job._id)] || []).filter((id) =>
      valid.has(id),
    );
  }

  function toggleComplaint(job, complaintId) {
    if (!complaintId || updatingJobs[idOf(job._id)]) return;

    const jobId = idOf(job._id);

    setSelectedComplaints((previous) => {
      const selected = previous[jobId] || [];

      return {
        ...previous,
        [jobId]: selected.includes(complaintId)
          ? selected.filter((id) => id !== complaintId)
          : [...selected, complaintId],
      };
    });
  }

  function selectAllPending(job) {
    const jobId = idOf(job._id);
    const valid = pendingIds(job);
    const current = validSelectedIds(job);

    const allSelected =
      valid.length > 0 && valid.every((id) => current.includes(id));

    setSelectedComplaints((previous) => ({
      ...previous,
      [jobId]: allSelected ? [] : valid,
    }));
  }

  function openConfirmation(job) {
    if (!validSelectedIds(job).length) {
      toast.error("Select at least one complaint", {
        duration: 1500,
      });
      return;
    }

    setConfirmationId(idOf(job._id));
  }

  function closeConfirmation() {
    if (confirmationJob && updatingJobs[idOf(confirmationJob._id)]) {
      return;
    }

    setConfirmationId(null);
  }

  // ====================================================
  // COMPLETE SELECTED COMPLAINTS
  // ====================================================

  async function handleCompleteSelected(job) {
    if (!job) return;

    const jobId = idOf(job._id);
    const complaintIds = validSelectedIds(job);

    if (!complaintIds.length || updatingJobs[jobId]) {
      return;
    }

    setUpdatingJobs((previous) => ({
      ...previous,
      [jobId]: true,
    }));

    try {
      const response = await api.put(`${API}/${jobId}/complete-complaints`, {
        complaintIds,
      });

      const updatedJobCard = response?.data?.jobCard;

      if (updatedJobCard?._id) {
        setJobCards((previous) =>
          previous.map((current) =>
            idOf(current._id) === idOf(updatedJobCard._id)
              ? updatedJobCard
              : current,
          ),
        );
      } else {
        await fetchJobCards();
      }

      setSelectedComplaints((previous) => ({
        ...previous,
        [jobId]: [],
      }));

      setConfirmationId(null);

      toast.success(
        `${complaintIds.length} complaint${
          complaintIds.length !== 1 ? "s" : ""
        } updated successfully`,
        { duration: 1400 },
      );
    } catch (err) {
      console.error("VERIFICATION COMPLETION ERROR:", err);

      toast.error(
        err?.response?.data?.message ||
          "Failed to complete selected complaints",
        { duration: 2500 },
      );
    } finally {
      setUpdatingJobs((previous) => ({
        ...previous,
        [jobId]: false,
      }));
    }
  }

  function resetFilters() {
    setSearch("");
    setWorkerFilter("ALL");
    setLocationFilter("ALL");
    setCategoryFilter("ALL");
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <main className="min-w-0 space-y-6 pb-8 text-[#102B52]">
      {/* HEADER */}

      <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#081B35] via-[#102E55] to-[#204779] p-6 text-white shadow-[0_12px_35px_rgba(8,27,53,0.12)] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[42px] border-white/[0.04]" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D6AD59]/30 bg-[#D6AD59]/10 px-3 py-1.5">
              <Sparkles size={13} className="text-[#E8C477]" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#F0D494]">
                AMI MAINT. · QUALITY CONTROL
              </span>
            </div>

            <h1 className="mt-4 text-[27px] font-black tracking-tight sm:text-[34px]">
              Job Card Verification
            </h1>

            <p className="mt-3 max-w-xl text-[13px] leading-6 text-slate-300">
              Review returned printed Job Cards, verify completed maintenance
              work and update selected complaints with confidence.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/maintenance/job-cards")}
                className="inline-flex items-center gap-2 rounded-xl bg-[#D6AD59] px-4 py-3 text-xs font-extrabold text-[#081B35] transition hover:bg-[#E8C477]"
              >
                <ArrowLeft size={16} />
                Back to Job Cards
              </button>

              <button
                type="button"
                disabled={refreshing}
                onClick={() => fetchJobCards({ silent: true })}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/20 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.07] p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D6AD59]/20 text-[#E8C477]">
              <ShieldCheck size={25} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase text-slate-300">
                Operations Portal
              </p>
              <p className="mt-1 text-sm font-extrabold">Maintenance Manager</p>
              <p className="mt-1 text-[11px] text-slate-300">AMI MAINT.</p>
            </div>
          </div>
        </div>
      </section>

      {/* API ERROR */}

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4"
        >
          <p className="flex items-center gap-2 text-xs font-semibold text-rose-700">
            <AlertTriangle size={17} />
            {error}
          </p>

          <button
            type="button"
            onClick={() => fetchJobCards({ silent: true })}
            className="text-xs font-bold text-rose-700 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* STATISTICS */}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          title="Printed Active Job Cards"
          value={verificationJobs.length}
          detail="Available for review"
          icon={ClipboardList}
          tone="blue"
        />

        <StatCard
          title="Assigned Technicians"
          value={workers.length}
          detail="Technicians in active printed cards"
          icon={Users}
          tone="purple"
        />

        <StatCard
          title="Pending Verification"
          value={totalPending}
          detail="Items not yet marked complete"
          icon={Clock3}
          tone="amber"
        />

        <StatCard
          title="Completed Complaints"
          value={completedCount}
          detail="Across loaded Job Cards"
          icon={CheckCircle2}
          tone="green"
        />
      </div>

      {/* FILTER PANEL */}

      <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold">Verification Queue</h2>

            <p className="mt-1 text-xs text-slate-500">
              Find Job Cards by complaint, location, category or assigned
              Technician.
            </p>
          </div>

          <span className="rounded-xl bg-[#F8FAFD] px-3 py-2 text-xs font-extrabold text-[#102B52]">
            {filteredJobs.length} Job Cards
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative md:col-span-2 xl:col-span-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className={`${INPUT} pl-10`}
              value={search}
              placeholder="Search Job Card, complaint, room..."
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <select
            className={INPUT}
            value={workerFilter}
            onChange={(event) => setWorkerFilter(event.target.value)}
          >
            <option value="ALL">All Technicians</option>
            {workers.map((worker) => (
              <option key={worker._id} value={idOf(worker._id)}>
                {worker.name} · {worker.department || "Technician"}
              </option>
            ))}
          </select>

          <select
            className={INPUT}
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
          >
            <option value="ALL">All Locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          <select
            className={INPUT}
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="ALL">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {(search ||
          workerFilter !== "ALL" ||
          locationFilter !== "ALL" ||
          categoryFilter !== "ALL") && (
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#A87D30] hover:underline"
          >
            <FilterX size={15} />
            Clear Filters
          </button>
        )}
      </section>

      {/* JOB CARDS */}

      {filteredJobs.length === 0 ? (
        <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <FileCheck2 size={29} />
          </div>

          <h3 className="mt-4 text-base font-extrabold">No Job Cards Found</h3>

          <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-slate-500">
            Printed and active Job Cards matching your filters will appear here.
          </p>
        </div>
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-2">
          {filteredJobs.map((job) => {
            const jobId = idOf(job._id);
            const items = job.complaints || [];
            const pending = getPendingItems(job);
            const selected = validSelectedIds(job);
            const updating = Boolean(updatingJobs[jobId]);

            const allSelected =
              pending.length > 0 &&
              pendingIds(job).every((id) => selected.includes(id));

            const completed = items.length - pending.length;

            const percent = items.length ? (completed / items.length) * 100 : 0;

            const expanded = expandedJobs[jobId] !== false;

            return (
              <article
                key={jobId}
                className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {/* CARD HEADER */}

                <div className="bg-gradient-to-r from-[#081B35] to-[#204779] p-5 text-white">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#E8C477]">
                        PRINTED JOB CARD
                      </p>

                      <h3 className="mt-2 break-all text-xl font-black">
                        {job.jobCardId}
                      </h3>

                      <p className="mt-2 flex items-center gap-2 text-xs text-slate-300">
                        <UserRound size={14} />
                        {job.assignedWorker?.name || "Technician unavailable"}
                      </p>
                    </div>

                    <span className="rounded-full border border-amber-200/30 bg-[#D6AD59]/15 px-3 py-1.5 text-[10px] font-extrabold text-[#E8C477]">
                      {pending.length} Pending
                    </span>
                  </div>
                </div>

                {/* CARD BODY */}

                <div className="space-y-5 p-4 sm:p-5">
                  <div className="grid grid-cols-2 gap-3">
                    <InfoBox
                      icon={MapPin}
                      label="Location"
                      value={locationOf(job)}
                    />

                    <InfoBox
                      icon={Wrench}
                      label="Category"
                      value={job.category}
                    />

                    <InfoBox
                      icon={ClipboardList}
                      label="Total Complaints"
                      value={items.length}
                    />

                    <InfoBox
                      icon={CheckCheck}
                      label="Completed"
                      value={completed}
                    />
                  </div>

                  {/* PROGRESS */}

                  <div>
                    <div className="flex justify-between text-xs font-bold">
                      <span>Verification Progress</span>
                      <span>{percent.toFixed(0)}%</span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#D6AD59] transition-all duration-300"
                        style={{
                          width: `${percent}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* COMPLAINT HEADER */}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      className="flex items-center gap-2 text-left text-sm font-extrabold"
                      onClick={() =>
                        setExpandedJobs((previous) => ({
                          ...previous,
                          [jobId]: !expanded,
                        }))
                      }
                    >
                      <ClipboardCheck size={18} />
                      Complaint Verification
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          expanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      disabled={updating || pending.length === 0}
                      onClick={() => selectAllPending(job)}
                      className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-extrabold text-[#946B25] hover:bg-amber-100 disabled:opacity-50"
                    >
                      {allSelected ? "Clear Selection" : "Select All Pending"}
                    </button>
                  </div>

                  {expanded && (
                    <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                      {items.map((item, index) => {
                        const complaintId = getComplaintId(item);
                        const done = isCompleted(item);

                        const checked = done || selected.includes(complaintId);

                        return (
                          <label
                            key={item._id || complaintId || index}
                            className={`flex gap-3 rounded-xl border p-3.5 transition ${
                              done
                                ? "border-emerald-200 bg-emerald-50/60"
                                : checked
                                  ? "border-[#D6AD59] bg-amber-50/50"
                                  : "border-slate-200 bg-[#FAFBFD] hover:border-amber-200"
                            } ${
                              done || !complaintId
                                ? "cursor-default"
                                : "cursor-pointer"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={done || !complaintId || updating}
                              onChange={() => toggleComplaint(job, complaintId)}
                              className="mt-1 h-4 w-4 shrink-0 accent-[#102B52]"
                            />

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs font-black text-[#102B52]">
                                  {item.complaint?.complaintId ||
                                    `Complaint ${index + 1}`}
                                </p>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold ${
                                    done
                                      ? "bg-emerald-100 text-emerald-700"
                                      : checked
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-slate-200 text-slate-600"
                                  }`}
                                >
                                  {done
                                    ? "COMPLETED"
                                    : checked
                                      ? "SELECTED"
                                      : readable(item.status)}
                                </span>
                              </div>

                              <p className="mt-1.5 text-[12px] font-semibold text-slate-700">
                                {item.title ||
                                  item.complaint?.title ||
                                  "No title"}
                              </p>

                              <p className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                <MapPin size={12} />
                                Room {item.roomNumber || "—"}
                                <span>·</span>
                                Floor {item.floor || "—"}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* ACTION FOOTER */}

                  <div className="border-t border-slate-100 pt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Selected for verification
                      </span>

                      <span className="text-sm font-black text-[#102B52]">
                        {selected.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`${PRIMARY} w-full`}
                      disabled={!selected.length || updating}
                      onClick={() => openConfirmation(job)}
                    >
                      {updating ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <ShieldCheck size={17} />
                      )}

                      {updating
                        ? "Updating..."
                        : `Verify & Complete Selected (${selected.length})`}
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* CONFIRMATION MODAL */}

      {confirmationJob && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Job Card verification"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={closeConfirmation}
            aria-label="Close confirmation"
            className="absolute inset-0 h-full w-full"
          />

          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-[#081B35] to-[#204779] p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D6AD59]/20 text-[#E8C477]">
                    <ShieldCheck size={22} />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase text-[#E8C477]">
                      Final Verification
                    </p>
                    <h2 className="mt-1 text-lg font-black">
                      Confirm Completion
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeConfirmation}
                  disabled={Boolean(updatingJobs[idOf(confirmationJob._id)])}
                  className="rounded-xl bg-white/10 p-2.5 hover:bg-white/20 disabled:opacity-50"
                  aria-label="Close"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <FileCheck2 size={29} />
              </div>

              <h3 className="text-center text-lg font-black">
                Complete Selected Complaints?
              </h3>

              <p className="text-center text-xs leading-6 text-slate-500">
                You are about to mark{" "}
                <b className="text-[#102B52]">
                  {validSelectedIds(confirmationJob).length}
                </b>{" "}
                selected complaint(s) as completed through the existing Job Card
                verification workflow.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <InfoBox
                  icon={ClipboardList}
                  label="Job Card"
                  value={confirmationJob.jobCardId}
                />

                <InfoBox
                  icon={UserRound}
                  label="Technician"
                  value={confirmationJob.assignedWorker?.name}
                />
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="flex items-start gap-2 text-xs leading-6 text-amber-900">
                  <AlertTriangle size={17} className="mt-1 shrink-0" />
                  Confirm only the work actually completed and checked against
                  the returned physical Job Card. Student satisfaction
                  confirmation remains separate.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  className={SECONDARY}
                  onClick={closeConfirmation}
                  disabled={Boolean(updatingJobs[idOf(confirmationJob._id)])}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={GOLD}
                  disabled={
                    Boolean(updatingJobs[idOf(confirmationJob._id)]) ||
                    validSelectedIds(confirmationJob).length === 0
                  }
                  onClick={() => handleCompleteSelected(confirmationJob)}
                >
                  {updatingJobs[idOf(confirmationJob._id)] ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="flex items-center gap-2 border-t border-slate-200 pt-4 text-[11px] text-slate-400">
        <ShieldCheck size={14} />
        AMI MAINT. · Job Card Verification
      </footer>
    </main>
  );
}
