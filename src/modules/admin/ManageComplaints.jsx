import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import toast from "react-hot-toast";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Eye,
  FilterX,
  Loader2,
  Package,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserCheck,
  Wrench,
  X,
} from "lucide-react";

import api from "../../services/api";

const ROOT = "/complaints";

const FINISHED = ["RESOLVED", "CLOSED"];
const WAITING = ["WAITING_MATERIAL", "WAITING_FOR_MATERIAL"];
const WORKING = ["ASSIGNED", "IN_PROGRESS"];

const INPUT =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100";

const errorText = (error, fallback) =>
  error?.response?.data?.message || fallback;

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

// ==========================================
// STATUS FILTER
// ==========================================

function inGroup(item, filter) {
  if (filter === "ALL") return true;

  if (filter === "PENDING") {
    return ["PENDING", "REOPENED"].includes(item.status);
  }

  if (filter === "WORKING") {
    return WORKING.includes(item.status);
  }

  if (filter === "WAITING") {
    return WAITING.includes(item.status);
  }

  if (filter === "VERIFY") {
    return item.status === "COMPLETED";
  }

  if (filter === "FINISHED") {
    return FINISHED.includes(item.status);
  }

  if (filter === "DISSATISFIED") {
    return item.reopenCount > 0 && !FINISHED.includes(item.status);
  }

  if (filter === "OVERDUE") {
    return (
      !!item.deadline &&
      new Date(item.deadline).getTime() < Date.now() &&
      !FINISHED.includes(item.status) &&
      item.status !== "COMPLETED"
    );
  }

  if (filter === "EMERGENCY") {
    return item.priority === "URGENT" || item.isEscalated === true;
  }

  return item.status === filter;
}

// ==========================================
// STATUS LABEL
// ==========================================

function statusName(item) {
  if (item?.status === "COMPLETED") {
    return "Awaiting Verification";
  }

  if (item?.status === "RESOLVED") {
    return "Manager Verified";
  }

  return String(item?.status || "UNKNOWN").replaceAll("_", " ");
}

function statusColor(item) {
  if (FINISHED.includes(item.status)) {
    return "bg-emerald-50 text-emerald-800";
  }

  if (item.status === "COMPLETED") {
    return "bg-violet-50 text-violet-800";
  }

  if (WAITING.includes(item.status)) {
    return "bg-amber-50 text-amber-800";
  }

  if (WORKING.includes(item.status)) {
    return "bg-blue-50 text-blue-800";
  }

  return "bg-slate-100 text-slate-700";
}

// ==========================================
// DATE IN IST
// ==========================================

function dateIST(value) {
  if (!value || Number.isNaN(Date.parse(value))) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

// ==========================================
// COMPLAINT LOCATION
// ==========================================

function location(item) {
  return (
    [
      item.hostel || item.block || item.complaintArea,
      item.floor,
      item.issueLocation,
      item.roomNumber ? `Room ${item.roomNumber}` : "",
    ]
      .filter(Boolean)
      .join(" · ") || "—"
  );
}

function isAssignable(item) {
  return (
    !!item &&
    ["PENDING", "REOPENED", "ASSIGNED", "IN_PROGRESS"].includes(item.status)
  );
}

// ==========================================
// DETAILS FIELD
// ==========================================

function Field({ title, children }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <div className="mt-1 break-words text-sm text-[#122B4E]">
        {children || "—"}
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);

  const [technicians, setTechnicians] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [busy, setBusy] = useState(false);

  // FILTER STATE
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("ALL");

  const [priority, setPriority] = useState("ALL");

  const [area, setArea] = useState("ALL");

  const [category, setCategory] = useState("ALL");

  const [place, setPlace] = useState("ALL");

  // MODAL STATE
  const [selectedId, setSelectedId] = useState("");

  const [actionMode, setActionMode] = useState("");

  const [technicianId, setTechnicianId] = useState("");

  const [remarks, setRemarks] = useState("");

  const [actionHistory, setActionHistory] = useState([]);

  const recordsRef = useRef(null);

  // ========================================
  // LOAD REAL COMPLAINTS & TECHNICIANS
  // ========================================

  const load = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [cases, techs] = await Promise.all([
        api.get(`${ROOT}/all`),
        api.get(`${ROOT}/technicians`),
      ]);

      setComplaints(
        Array.isArray(cases.data?.complaints) ? cases.data.complaints : [],
      );

      setTechnicians(
        Array.isArray(techs.data?.technicians) ? techs.data.technicians : [],
      );
    } catch (error) {
      toast.error(errorText(error, "Unable to load maintenance complaints"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ========================================
  // AUTOMATIC REFRESH
  // ========================================

  useEffect(() => {
    load();

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        load(true);
      }
    }, 20000);

    return () => window.clearInterval(timer);
  }, [load]);

  // ========================================
  // SELECTED COMPLAINT
  // ========================================

  const selected = complaints.find((item) => item._id === selectedId) || null;

  // ========================================
  // LOAD MANAGER ACTION HISTORY
  // ========================================

  useEffect(() => {
    if (!selectedId) {
      setActionHistory([]);
      return;
    }

    let cancelled = false;

    api
      .get(`${ROOT}/actions/${selectedId}`)
      .then(({ data }) => {
        if (!cancelled) {
          setActionHistory(data.actions || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setActionHistory([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId, complaints]);

  // ========================================
  // DYNAMIC FILTER OPTIONS
  // ========================================

  const categories = useMemo(
    () =>
      [...new Set(complaints.map((c) => c.category).filter(Boolean))].sort(),
    [complaints],
  );

  const areas = useMemo(
    () =>
      [
        ...new Set(complaints.map((c) => c.complaintArea).filter(Boolean)),
      ].sort(),
    [complaints],
  );

  const places = useMemo(
    () =>
      [
        ...new Set(
          complaints
            .filter((c) => area === "ALL" || c.complaintArea === area)
            .map((c) =>
              c.complaintArea === "HOSTEL"
                ? c.hostel
                : c.complaintArea === "DEPARTMENT"
                  ? c.block
                  : c.issueLocation,
            )
            .filter(Boolean),
        ),
      ].sort(),
    [complaints, area],
  );

  // ========================================
  // BASE COMPLAINT FILTER
  // ========================================

  const base = useMemo(
    () =>
      complaints.filter((c) => {
        if (area !== "ALL" && c.complaintArea !== area) {
          return false;
        }

        if (
          category !== "ALL" &&
          normalize(c.category) !== normalize(category)
        ) {
          return false;
        }

        if (place !== "ALL") {
          const actual =
            c.complaintArea === "HOSTEL"
              ? c.hostel
              : c.complaintArea === "DEPARTMENT"
                ? c.block
                : c.issueLocation;

          if (normalize(actual) !== normalize(place)) {
            return false;
          }
        }

        const q = normalize(search);

        return (
          !q ||
          [
            c.complaintId,
            c.title,
            c.category,
            c.createdBy?.name,
            c.hostel,
            c.block,
            c.issueLocation,
          ].some((v) => normalize(v).includes(q))
        );
      }),
    [complaints, area, category, place, search],
  );

  // ========================================
  // DISPLAYED COMPLAINTS
  // ========================================

  const displayed = useMemo(
    () =>
      base.filter(
        (c) =>
          inGroup(c, status) &&
          (priority === "ALL" ||
            (priority === "HIGH_PLUS"
              ? ["HIGH", "URGENT"].includes(c.priority)
              : c.priority === priority)),
      ),
    [base, status, priority],
  );

  // ========================================
  // LIVE DASHBOARD COUNTS
  // ========================================

  const count = (key) => base.filter((c) => inGroup(c, key)).length;

  const kpis = [
    {
      label: "Total",
      value: base.length,
      key: "ALL",
      icon: ClipboardList,
    },
    {
      label: "Pending",
      value: count("PENDING"),
      key: "PENDING",
      icon: Clock3,
    },
    {
      label: "In Progress",
      value: count("WORKING"),
      key: "WORKING",
      icon: Wrench,
    },
    {
      label: "Waiting Material",
      value: count("WAITING"),
      key: "WAITING",
      icon: Package,
    },
    {
      label: "To Verify",
      value: count("VERIFY"),
      key: "VERIFY",
      icon: ClipboardCheck,
    },
    {
      label: "Verified",
      value: count("FINISHED"),
      key: "FINISHED",
      icon: ShieldCheck,
    },
    {
      label: "Not Satisfied",
      value: count("DISSATISFIED"),
      key: "DISSATISFIED",
      icon: AlertTriangle,
    },
    {
      label: "Overdue",
      value: count("OVERDUE"),
      key: "OVERDUE",
      icon: AlertTriangle,
    },
    {
      label: "Emergency",
      value: count("EMERGENCY"),
      key: "EMERGENCY",
      icon: AlertTriangle,
    },
  ];

  // ========================================
  // CARD DRILLDOWN
  // ========================================

  const drilldown = (key) => {
    setStatus(key);
    setPriority("ALL");

    window.requestAnimationFrame(() => {
      recordsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  // ========================================
  // RESET FILTERS
  // ========================================

  const reset = () => {
    setSearch("");
    setStatus("ALL");
    setPriority("ALL");
    setArea("ALL");
    setCategory("ALL");
    setPlace("ALL");
  };

  // ========================================
  // OPEN ACTION
  // ========================================

  const startAction = (mode) => {
    if (!selected) return;

    setActionMode(mode);

    setTechnicianId(
      typeof selected.assignedTo === "object"
        ? selected.assignedTo?._id || ""
        : selected.assignedTo || "",
    );

    setRemarks("");
  };

  // ========================================
  // SUBMIT MAINTENANCE ACTION
  // ========================================

  const submitAction = async (event) => {
    event.preventDefault();

    if (!selected || busy) return;

    if (actionMode === "assign" && !technicianId) {
      return toast.error("Choose a Technician");
    }

    if (actionMode === "correction" && remarks.trim().length < 5) {
      return toast.error("Enter a correction reason");
    }

    setBusy(true);

    try {
      if (actionMode === "assign") {
        await api.patch(`${ROOT}/assign/${selected._id}`, {
          technicianId,
        });
      } else if (actionMode === "verify") {
        await api.patch(`${ROOT}/verify/${selected._id}`, {
          remarks: remarks.trim(),
        });
      } else if (actionMode === "correction") {
        await api.patch(`${ROOT}/correction/${selected._id}`, {
          reason: remarks.trim(),
        });
      }

      toast.success(
        actionMode === "assign"
          ? "Technician assigned"
          : actionMode === "verify"
            ? "Complaint verified"
            : "Returned for correction",
      );

      setActionMode("");

      await load(true);
    } catch (error) {
      toast.error(errorText(error, "Operation failed"));
    } finally {
      setBusy(false);
    }
  };

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <main className="min-h-full bg-[#F5F7FB] px-3 py-5 text-[#102B52] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* HEADER */}

        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#071C3C] via-[#123765] to-[#184A80] p-6 text-white shadow-lg sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">
              AmiMaintain · Maintenance Operations
            </p>

            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Manage Complaints
            </h1>

            <p className="mt-2 text-sm text-slate-200">
              Assign Technicians, monitor digital work and verify completion.
            </p>
          </div>

          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm font-bold disabled:opacity-50"
          >
            <RefreshCcw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        {/* CLICKABLE DASHBOARD CARDS */}

        <section
          className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"
          aria-label="Complaint dashboard"
        >
          {kpis.map((k) => {
            const Icon = k.icon;

            return (
              <button
                type="button"
                key={k.key}
                onClick={() => drilldown(k.key)}
                className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-amber-400 hover:shadow-md ${
                  status === k.key
                    ? "border-amber-400 ring-1 ring-amber-200"
                    : "border-slate-200"
                }`}
              >
                <Icon size={21} className="text-[#B3852F]" />

                <span className="mt-3 block text-2xl font-black">
                  {k.value}
                </span>

                <span className="mt-1 block text-xs font-bold text-slate-500">
                  {k.label}
                </span>
              </button>
            );
          })}
        </section>

        {/* ADVANCED FILTERS */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3">
              <Search size={18} className="text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search complaint ID, title, reporter, location..."
                className="w-full min-w-0 bg-transparent py-3 text-sm outline-none"
              />
            </label>

            <button
              type="button"
              onClick={reset}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold"
            >
              <FilterX size={16} />
              Clear Filters
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-xs font-bold text-slate-600">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`${INPUT} mt-1.5`}
              >
                <option value="ALL">All Statuses</option>

                <option value="PENDING">Pending</option>

                <option value="WORKING">In Progress</option>

                <option value="WAITING">Waiting Material</option>

                <option value="VERIFY">Awaiting Verification</option>

                <option value="FINISHED">Verified / Closed</option>

                <option value="DISSATISFIED">Not Satisfied</option>

                <option value="OVERDUE">Overdue</option>

                <option value="EMERGENCY">Emergency / Escalated</option>
              </select>
            </label>

            <label className="text-xs font-bold text-slate-600">
              Priority
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`${INPUT} mt-1.5`}
              >
                <option value="ALL">All Priorities</option>

                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>

                <option value="HIGH_PLUS">High + Urgent</option>
              </select>
            </label>

            <label className="text-xs font-bold text-slate-600">
              Area
              <select
                value={area}
                onChange={(e) => {
                  setArea(e.target.value);
                  setPlace("ALL");
                }}
                className={`${INPUT} mt-1.5`}
              >
                <option value="ALL">All Areas</option>

                {areas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-bold text-slate-600">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`${INPUT} mt-1.5`}
              >
                <option value="ALL">All Categories</option>

                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-bold text-slate-600">
              Hostel / Block / Location
              <select
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className={`${INPUT} mt-1.5`}
              >
                <option value="ALL">All Locations</option>

                {places.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-600">
            <strong>{displayed.length}</strong> matching complaint(s)
          </p>
        </section>

        {/* COMPLAINT RECORDS */}

        <section
          ref={recordsRef}
          className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-extrabold">Complaint Records</h2>

            <p className="mt-1 text-xs text-slate-500">
              Live MongoDB data · Maintenance Manager actions
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
              <Loader2 className="animate-spin" size={20} />
              Loading complaints...
            </div>
          ) : !displayed.length ? (
            <p className="py-16 text-center text-slate-500">
              No matching complaints found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                  <tr>
                    {[
                      "Complaint",
                      "Reporter",
                      "Location",
                      "Technician",
                      "Priority",
                      "Status",
                      "Created",
                      "Action",
                    ].map((h) => (
                      <th className="px-4 py-3" key={h}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {displayed.map((c) => (
                    <tr className="hover:bg-slate-50" key={c._id}>
                      <td className="px-4 py-4">
                        <strong>{c.complaintId || "—"}</strong>

                        <p className="mt-1 max-w-48 truncate">{c.title}</p>

                        <p className="text-xs text-slate-500">{c.category}</p>
                      </td>

                      <td className="px-4 py-4">{c.createdBy?.name || "—"}</td>

                      <td className="max-w-52 px-4 py-4">{location(c)}</td>

                      <td className="px-4 py-4">
                        {c.assignedTo?.name || "Not assigned"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ${
                            ["HIGH", "URGENT"].includes(c.priority)
                              ? "bg-red-50 text-red-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {c.priority || "MEDIUM"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-block whitespace-nowrap rounded-full px-2 py-1 text-xs font-bold ${statusColor(c)}`}
                        >
                          {statusName(c)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-xs">
                        {dateIST(c.createdAt)}
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedId(c._id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                        >
                          <Eye size={14} />
                          View / Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* COMPLAINT DETAILS MODAL */}

      {selected && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#031126]/75 p-3"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !busy) {
              setSelectedId("");
              setActionMode("");
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Maintenance complaint details"
            className="max-h-[94dvh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white p-5">
              <div>
                <p className="text-xs font-bold uppercase text-amber-700">
                  Maintenance Complaint
                </p>

                <h2 className="mt-1 text-xl font-black">
                  {selected.complaintId}
                </h2>

                <p className="mt-1 text-sm text-slate-500">{selected.title}</p>
              </div>

              <button
                type="button"
                disabled={busy}
                aria-label="Close"
                onClick={() => {
                  setSelectedId("");
                  setActionMode("");
                }}
                className="rounded-lg bg-slate-100 p-2"
              >
                <X size={20} />
              </button>
            </header>

            <div className="space-y-5 p-5">
              {/* STATUS */}

              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor(selected)}`}
                >
                  {statusName(selected)}
                </span>

                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                  {selected.priority || "MEDIUM"}
                </span>
              </div>

              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                {selected.description}
              </p>

              {/* FULL COMPLAINT INFO */}

              <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field title="Reporter">{selected.createdBy?.name}</Field>

                <Field title="Area">{selected.complaintArea}</Field>

                <Field title="Location">{location(selected)}</Field>

                <Field title="Category">{selected.category}</Field>

                <Field title="Subcategory">{selected.subCategory}</Field>

                <Field title="Assigned Technician">
                  {selected.assignedTo?.name}
                </Field>

                <Field title="Assigned By">{selected.assignedBy?.name}</Field>

                <Field title="Work Started">
                  {dateIST(selected.startedAt)}
                </Field>

                <Field title="Technician Completed">
                  {dateIST(selected.completedAt)}
                </Field>

                <Field title="Manager Verified">
                  {dateIST(selected.resolvedAt)}
                </Field>

                <Field title="Deadline">{dateIST(selected.deadline)}</Field>

                <Field title="Material Decision">
                  {selected.materialDecision ||
                    (selected.materialRequired ? "REQUIRED" : "NOT RECORDED")}
                </Field>
              </div>

              {/* TECHNICIAN REMARKS */}

              {selected.workerRemarks && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <strong className="text-sm">Technician Remarks</strong>

                  <p className="mt-1 whitespace-pre-wrap text-sm">
                    {selected.workerRemarks}
                  </p>
                </div>
              )}

              {/* NOT SATISFIED */}

              {selected.reopenReason && (
                <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
                  <strong className="text-sm">Not Satisfied Reason</strong>

                  <p className="mt-1 whitespace-pre-wrap text-sm">
                    {selected.reopenReason}
                  </p>
                </div>
              )}

              {/* COMPLAINT IMAGE */}

              {selected.image && (
                <a
                  href={selected.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-blue-700 underline"
                >
                  View complaint photo
                </a>
              )}

              {/* ACTION BUTTONS */}

              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                {isAssignable(selected) && (
                  <button
                    type="button"
                    onClick={() => startAction("assign")}
                    className="flex items-center gap-2 rounded-xl bg-[#102D56] px-4 py-2.5 text-sm font-bold text-white"
                  >
                    <UserCheck size={17} />

                    {selected.assignedTo
                      ? "Reassign Technician"
                      : "Assign Technician"}
                  </button>
                )}

                {selected.status === "COMPLETED" && (
                  <>
                    <button
                      type="button"
                      onClick={() => startAction("verify")}
                      className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white"
                    >
                      <CheckCircle2 size={17} />
                      Verify Completion
                    </button>

                    <button
                      type="button"
                      onClick={() => startAction("correction")}
                      className="flex items-center gap-2 rounded-xl border border-orange-300 px-4 py-2.5 text-sm font-bold text-orange-800"
                    >
                      <Wrench size={17} />
                      Return for Correction
                    </button>
                  </>
                )}

                {WAITING.includes(selected.status) && (
                  <span className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-800">
                    Awaiting Store Manager material action
                  </span>
                )}

                {FINISHED.includes(selected.status) && (
                  <span className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800">
                    Verification complete
                  </span>
                )}
              </div>

              {/* ASSIGN / VERIFY / CORRECTION FORM */}

              {actionMode && (
                <form
                  onSubmit={submitAction}
                  className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4"
                >
                  <h3 className="font-black">
                    {actionMode === "assign"
                      ? "Technician Assignment"
                      : actionMode === "verify"
                        ? "Verify Technician Completion"
                        : "Return Work for Correction"}
                  </h3>

                  {actionMode === "assign" ? (
                    <label className="block text-sm font-semibold">
                      Select Technician
                      <select
                        required
                        value={technicianId}
                        onChange={(e) => setTechnicianId(e.target.value)}
                        className={`${INPUT} mt-2`}
                      >
                        <option value="">Select an active Technician</option>

                        {technicians.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name}
                            {t.employeeId ? ` (${t.employeeId})` : ""}
                            {t.status === "ON_LEAVE" ? " — On leave" : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <label className="block text-sm font-semibold">
                      {actionMode === "verify"
                        ? "Manager Verification Remarks (optional)"
                        : "Correction Reason (required)"}

                      <textarea
                        rows={3}
                        maxLength={2000}
                        required={actionMode === "correction"}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className={`${INPUT} mt-2`}
                        placeholder={
                          actionMode === "verify"
                            ? "Work checked; satisfactory..."
                            : "What must the Technician correct?"
                        }
                      />
                    </label>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setActionMode("")}
                      className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={busy}
                      className="rounded-lg bg-[#102D56] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                    >
                      {busy ? "Saving..." : "Confirm Action"}
                    </button>
                  </div>
                </form>
              )}

              {/* STATUS TIMELINE */}

              <div>
                <h3 className="mb-3 font-black">Complaint Status Timeline</h3>

                {!selected.statusHistory?.length ? (
                  <p className="text-sm text-slate-500">
                    No status events recorded.
                  </p>
                ) : (
                  <div className="space-y-3 border-l-2 border-amber-200 pl-4">
                    {selected.statusHistory.map((event, i) => (
                      <div key={event._id || i}>
                        <p className="text-sm font-bold">
                          {String(event.status || "").replaceAll("_", " ")}
                        </p>

                        <p className="text-xs text-slate-500">
                          {dateIST(event.changedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* VERIFICATION / CORRECTION AUDIT */}

              <div>
                <h3 className="mb-3 font-black">
                  Manager Verification / Correction History
                </h3>

                {!actionHistory.length ? (
                  <p className="text-sm text-slate-500">
                    No manager verification actions yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {actionHistory.map((a) => (
                      <div
                        key={a._id}
                        className="rounded-xl border border-slate-200 p-3 text-sm"
                      >
                        <strong>
                          {a.action === "VERIFIED"
                            ? "Verified"
                            : "Returned for Correction"}
                        </strong>

                        <p className="text-xs text-slate-500">
                          {a.performedBy?.name || "Manager"} ·{" "}
                          {dateIST(a.createdAt)}
                        </p>

                        {a.remarks && (
                          <p className="mt-2 whitespace-pre-wrap text-slate-700">
                            {a.remarks}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
