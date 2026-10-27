import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileText,
  FilterX,
  Loader2,
  Package,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Trash2,
  UserCheck,
  Users,
  Wrench,
  X,
} from "lucide-react";

import api from "../../services/api";

const PAGE_SIZE = 12;

const UNITS = [
  "PIECE",
  "METER",
  "KG",
  "GRAM",
  "LITER",
  "ML",
  "BOX",
  "PACKET",
  "ROLL",
  "SET",
  "PAIR",
  "OTHER",
];

const TABS = [
  ["ALL", "All Complaints"],
  ["PENDING", "Pending"],
  ["ASSIGNED", "Assigned"],
  ["IN_PROGRESS", "In Progress"],
  ["MATERIAL", "Material Requests"],
  ["AWAITING", "Awaiting Student"],
  ["REOPENED", "Reopened"],
  ["OVERDUE", "Overdue"],
  ["RESOLVED", "Resolved"],
];

const upper = (v) =>
  String(v ?? "")
    .trim()
    .toUpperCase();
const lower = (v) =>
  String(v ?? "")
    .trim()
    .toLowerCase();
const toId = (v) => String(v?._id ?? v ?? "");
const readable = (v) => String(v || "—").replaceAll("_", " ");

function dateIST(v) {
  if (!v || Number.isNaN(new Date(v).getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(v));
}

function locationOf(c) {
  return (
    [
      c.hostel || c.block || c.complaintArea,
      c.issueLocation,
      c.floor ? `Floor ${c.floor}` : "",
      c.roomNumber ? `Room ${c.roomNumber}` : "",
    ]
      .filter(Boolean)
      .join(" · ") || "—"
  );
}

function assigned(c) {
  return Boolean(c.assignedTo || c.workerAssigned);
}

function emergency(c) {
  return (
    c?.isEmergency === true ||
    upper(c?.priority) === "EMERGENCY" ||
    upper(c?.complaintType) === "EMERGENCY"
  );
}

function overdue(c, now) {
  const time = c.deadline ? new Date(c.deadline).getTime() : NaN;

  return (
    Number.isFinite(time) &&
    time < now &&
    !["RESOLVED", "CLOSED"].includes(upper(c.status))
  );
}

function matchesRequest(r, c) {
  const link = r.complaint;

  return (
    toId(link) === toId(c._id) ||
    (typeof link === "object" && link?.complaintId === c.complaintId) ||
    [toId(c._id), c.complaintId].includes(String(r.complaintId || ""))
  );
}

function categoryKey(v) {
  return upper(v).replace(/\s+/g, " ");
}

function canSchedule(worker) {
  return (
    upper(worker.role) === "TECHNICIAN" &&
    worker.isActive !== false &&
    worker.isDeleted !== true &&
    !["OFFLINE", "ON_LEAVE", "INACTIVE"].includes(upper(worker.status)) &&
    worker.canScheduleAssignment !== false
  );
}

function matchesTechnician(worker, complaint) {
  return (
    canSchedule(worker) &&
    categoryKey(worker.department || worker.category) ===
      categoryKey(complaint.category)
  );
}

function badge(status) {
  const v = upper(status);

  if (["RESOLVED", "CLOSED", "ISSUED", "RECEIVED"].includes(v)) {
    return "bg-emerald-50 text-emerald-800";
  }

  if (["REOPENED", "REJECTED", "OUT_OF_STOCK"].includes(v)) {
    return "bg-rose-50 text-rose-800";
  }

  if (["ASSIGNED", "IN_PROGRESS"].includes(v)) {
    return "bg-blue-50 text-blue-800";
  }

  return "bg-amber-50 text-amber-900";
}

function statusText(c) {
  if (upper(c.status) === "ASSIGNED") {
    return "Assigned · Awaiting Start";
  }

  if (upper(c.status) === "COMPLETED" && c.studentVerified !== true) {
    return "Work Done · Awaiting Student";
  }

  return readable(c.status);
}

function studentReason(c) {
  return (
    [
      c.studentConfirmation?.reason,
      c.studentFeedback?.reason,
      c.studentReopenReason,
      c.reopenReason,
      c.reopenNote,
    ].find((v) => typeof v === "string" && v.trim()) || ""
  );
}

const newMaterial = () => ({
  itemName: "",
  quantity: "",
  unit: "PIECE",
});

const inputClass =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-400";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#102B52] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50";

const smallLabel = "text-xs font-bold uppercase text-slate-500";

export default function Complaints() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [complaintError, setComplaintError] = useState("");
  const [workerError, setWorkerError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const [tab, setTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const [page, setPage] = useState(1);

  const [selectedId, setSelectedId] = useState("");
  const [drawerTab, setDrawerTab] = useState("OVERVIEW");

  const [workerId, setWorkerId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const [showBatches, setShowBatches] = useState(false);
  const [batchSelections, setBatchSelections] = useState({});
  const [assigningBatch, setAssigningBatch] = useState("");

  const [materials, setMaterials] = useState([newMaterial()]);
  const [reason, setReason] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);

  // ========================================
  // FETCH EXISTING BACKEND DATA
  // ========================================

  const fetchAll = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const results = await Promise.allSettled([
        api.get("/maintenance/worker/complaints"),
        api.get("/maintenance/worker/workers"),
        api.get("/maintenance/material-requests"),
      ]);

      const [complaintResult, workerResult, requestResult] = results;

      if (
        complaintResult.status === "fulfilled" &&
        Array.isArray(complaintResult.value.data?.complaints)
      ) {
        setComplaints(complaintResult.value.data.complaints);
        setComplaintError("");
      } else {
        const message =
          complaintResult.status === "rejected"
            ? complaintResult.reason?.response?.data?.message ||
              "Unable to load complaints."
            : "Invalid complaint response.";

        setComplaintError(message);
        if (!silent) toast.error(message);
      }

      if (
        workerResult.status === "fulfilled" &&
        Array.isArray(workerResult.value.data?.workers)
      ) {
        setWorkers(workerResult.value.data.workers);
        setWorkerError("");
      } else {
        setWorkerError("Technician list unavailable. Assignment disabled.");
      }

      if (
        requestResult.status === "fulfilled" &&
        Array.isArray(requestResult.value.data?.requests)
      ) {
        setRequests(requestResult.value.data.requests);
        setRequestError("");
      } else {
        setRequestError(
          "Material request history unavailable. New requests disabled to prevent duplicates.",
        );
      }

      setLastUpdated(new Date().toISOString());
    } catch (error) {
      toast.error(error.message || "Unable to refresh data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchAll(true);
      }
    }, 30000);

    return () => window.clearInterval(timer);
  }, [fetchAll]);

  useEffect(() => {
    if (!selectedId) return undefined;

    const onEscape = (event) => {
      if (event.key === "Escape") setSelectedId("");
    };

    window.addEventListener("keydown", onEscape);

    return () => window.removeEventListener("keydown", onEscape);
  }, [selectedId]);

  // ========================================
  // DERIVED DATA
  // ========================================

  const selected = useMemo(
    () => complaints.find((c) => toId(c._id) === selectedId) || null,
    [complaints, selectedId],
  );

  const linkedRequests = useCallback(
    (complaint) =>
      requests.filter((request) => matchesRequest(request, complaint)),
    [requests],
  );

  const selectedRequests = selected ? linkedRequests(selected) : [];

  const availableTechnicians = selected
    ? workers.filter((w) => matchesTechnician(w, selected))
    : [];

  const canAssign =
    selected &&
    !assigned(selected) &&
    ["PENDING", "REOPENED"].includes(upper(selected.status));

  const canCreateRequest =
    selected &&
    !requestError &&
    selectedRequests.length === 0 &&
    !["RESOLVED", "CLOSED"].includes(upper(selected.status));

  const now = lastUpdated ? new Date(lastUpdated).getTime() : 0;

  const stats = useMemo(() => {
    const count = (predicate) => complaints.filter(predicate).length;

    return {
      ALL: complaints.length,

      PENDING: count((c) => upper(c.status) === "PENDING" && !assigned(c)),

      ASSIGNED: count(
        (c) => assigned(c) && !["RESOLVED", "CLOSED"].includes(upper(c.status)),
      ),

      IN_PROGRESS: count((c) => upper(c.status) === "IN_PROGRESS"),

      MATERIAL: count(
        (c) => c.materialRequired || requests.some((r) => matchesRequest(r, c)),
      ),

      AWAITING: count(
        (c) =>
          ["COMPLETED", "AWAITING_STUDENT_CONFIRMATION"].includes(
            upper(c.status),
          ) && c.studentVerified !== true,
      ),

      REOPENED: count((c) => upper(c.status) === "REOPENED"),

      OVERDUE: count((c) => overdue(c, now)),

      RESOLVED: count((c) => ["RESOLVED", "CLOSED"].includes(upper(c.status))),
    };
  }, [complaints, requests, now]);

  const locations = useMemo(
    () =>
      [
        ...new Set(
          complaints
            .map((c) => c.hostel || c.block || c.complaintArea)
            .filter(Boolean),
        ),
      ].sort(),
    [complaints],
  );

  const categories = useMemo(
    () =>
      [...new Set(complaints.map((c) => c.category).filter(Boolean))].sort(),
    [complaints],
  );

  const filtered = useMemo(() => {
    const query = lower(search);

    return complaints
      .filter((c) => {
        const status = upper(c.status);
        const linked = linkedRequests(c);
        const hasMaterials = Boolean(c.materialRequired || linked.length);

        const matchTab =
          tab === "ALL" ||
          (tab === "PENDING" && status === "PENDING" && !assigned(c)) ||
          (tab === "ASSIGNED" &&
            assigned(c) &&
            !["RESOLVED", "CLOSED"].includes(status)) ||
          (tab === "IN_PROGRESS" && status === "IN_PROGRESS") ||
          (tab === "MATERIAL" && hasMaterials) ||
          (tab === "AWAITING" &&
            ["COMPLETED", "AWAITING_STUDENT_CONFIRMATION"].includes(status) &&
            c.studentVerified !== true) ||
          (tab === "REOPENED" && status === "REOPENED") ||
          (tab === "OVERDUE" && overdue(c, now)) ||
          (tab === "RESOLVED" && ["RESOLVED", "CLOSED"].includes(status));

        const searchable = [
          c.complaintId,
          c.title,
          c.description,
          c.category,
          c.hostel,
          c.block,
          c.roomNumber,
          c.createdBy?.name,
          c.assignedTo?.name,
        ]
          .map(lower)
          .join(" ");

        const location = c.hostel || c.block || c.complaintArea;

        return (
          matchTab &&
          (!query || searchable.includes(query)) &&
          (!categoryFilter || c.category === categoryFilter) &&
          (!locationFilter || location === locationFilter) &&
          (!priorityFilter || upper(c.priority) === priorityFilter) &&
          (!materialFilter ||
            (materialFilter === "REQUIRED" ? hasMaterials : !hasMaterials))
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      );
  }, [
    complaints,
    linkedRequests,
    tab,
    search,
    categoryFilter,
    locationFilter,
    priorityFilter,
    materialFilter,
    now,
  ]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const safePage = Math.min(page, pages);

  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const batches = useMemo(() => {
    const groups = new Map();

    complaints
      .filter((c) => upper(c.status) === "PENDING" && !assigned(c))
      .forEach((c) => {
        const location = c.hostel || c.block || c.complaintArea || "Other";

        const category = c.category || "Uncategorized";
        const key = `${lower(location)}::${lower(category)}`;

        if (!groups.has(key)) {
          groups.set(key, {
            location,
            category,
            complaints: [],
          });
        }

        groups.get(key).complaints.push(c);
      });

    const list = [];

    for (const [key, group] of groups.entries()) {
      for (let index = 0; index < group.complaints.length; index += 10) {
        list.push({
          key: `${key}::${index / 10 + 1}`,
          location: group.location,
          category: group.category,
          complaints: group.complaints.slice(index, index + 10),
        });
      }
    }

    return list;
  }, [complaints]);

  // ========================================
  // ACTIONS
  // ========================================

  function openComplaint(c, section = "OVERVIEW") {
    setSelectedId(toId(c._id));
    setDrawerTab(section);
    setWorkerId("");
    setMaterials([newMaterial()]);
    setReason("");
  }

  function resetFilters() {
    setTab("ALL");
    setSearch("");
    setCategoryFilter("");
    setLocationFilter("");
    setPriorityFilter("");
    setMaterialFilter("");
    setPage(1);
  }

  async function assignOne() {
    if (!selected || !canAssign || !workerId || assigning) return;

    const technician = availableTechnicians.find(
      (w) => toId(w._id) === workerId,
    );

    if (!technician || !canSchedule(technician)) {
      toast.error("Technician cannot receive this assignment.");
      return;
    }

    setAssigning(true);

    try {
      await api.put("/maintenance/worker/assign-worker", {
        complaintId: selected._id,
        workerId,
      });

      toast.success(
        "Technician assigned. Work will start during eligible duty.",
      );

      setWorkerId("");
      await fetchAll(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Technician assignment failed.",
      );
    } finally {
      setAssigning(false);
    }
  }

  async function assignBatch(batch) {
    const id = batchSelections[batch.key];
    if (!id || assigningBatch) return;

    const technician = workers.find(
      (w) => toId(w._id) === id && matchesTechnician(w, batch.complaints[0]),
    );

    if (!technician) {
      toast.error("Selected Technician is unavailable.");
      return;
    }

    setAssigningBatch(batch.key);
    let count = 0;
    let failed = false;

    try {
      for (const c of batch.complaints) {
        try {
          await api.put("/maintenance/worker/assign-worker", {
            complaintId: c._id,
            workerId: id,
          });
          count += 1;
        } catch (error) {
          toast.error(
            `${count} assigned. Failed at ${c.complaintId}: ${
              error?.response?.data?.message || "Assignment failed"
            }`,
          );

          failed = true;
          break;
        }
      }

      if (!failed) {
        toast.success(`${count} complaints assigned successfully.`);
      }

      await fetchAll(true);

      setBatchSelections((old) => ({
        ...old,
        [batch.key]: "",
      }));
    } finally {
      setAssigningBatch("");
    }
  }

  function updateMaterial(index, field, value) {
    setMaterials((list) =>
      list.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  async function createMaterialRequest(event) {
    event.preventDefault();

    if (!selected || !canCreateRequest || sendingRequest) {
      return;
    }

    if (!reason.trim()) {
      toast.error("Enter material request reason.");
      return;
    }

    const invalid = materials.some(
      (m) =>
        !m.itemName.trim() ||
        !Number.isFinite(Number(m.quantity)) ||
        Number(m.quantity) <= 0,
    );

    if (invalid) {
      toast.error("Enter valid materials and quantities.");
      return;
    }

    setSendingRequest(true);

    try {
      await api.post("/maintenance/material-requests/create", {
        complaintId: selected._id,
        materials: materials.map((m) => ({
          itemName: m.itemName.trim(),
          quantity: Number(m.quantity),
          unit: m.unit,
        })),
        reason: reason.trim(),
      });

      toast.success("Material request sent to Store Manager.");
      setMaterials([newMaterial()]);
      setReason("");
      await fetchAll(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Material request failed.");
    } finally {
      setSendingRequest(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center gap-3 text-slate-500">
        <Loader2 className="animate-spin" />
        Loading complaints...
      </div>
    );
  }

  return (
    <main className="min-w-0 space-y-5 text-[#102B52]">
      {/* HEADER */}

      <header className="rounded-3xl bg-gradient-to-r from-[#071C3C] to-[#204779] p-5 text-white shadow-lg sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
              AMIM AINTAIN · MAINTENANCE PORTAL
            </p>

            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Complaint Management
            </h1>

            <p className="mt-2 text-sm text-slate-200">
              Assign Technicians, request materials and monitor Student
              confirmation.
            </p>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() => void fetchAll(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-300">
          Last updated: {dateIST(lastUpdated)}
        </p>
      </header>

      {complaintError && (
        <div
          role="alert"
          className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700"
        >
          {complaintError}
        </div>
      )}

      {/* KPI CARDS */}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {[
          ["Total Complaints", stats.ALL, ClipboardList, "ALL"],
          ["Pending Assignment", stats.PENDING, Clock3, "PENDING"],
          ["In Progress", stats.IN_PROGRESS, Wrench, "IN_PROGRESS"],
          ["Material Requests", stats.MATERIAL, Package, "MATERIAL"],
          ["Awaiting Student", stats.AWAITING, UserCheck, "AWAITING"],
        ].map(([label, value, Icon, targetTab]) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              setTab(targetTab);
              setPage(1);
            }}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm ${
              tab === targetTab ? "border-amber-400" : "border-slate-200"
            }`}
          >
            <Icon size={20} className="text-amber-600" />
            <p className="mt-3 text-2xl font-black">{value}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
          </button>
        ))}
      </section>

      {/* MAIN COMPLAINT SECTION */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">All Maintenance Complaints</h2>

              <p className="text-xs text-slate-500">
                Each complaint is maintained separately.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowBatches((v) => !v)}
              className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900"
            >
              <Users size={16} />
              {showBatches
                ? "Hide Batch Assignment"
                : "Batch Assignment (Max 10)"}
            </button>
          </div>

          {/* TABS */}

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {TABS.map(([key, label]) => (
              <button
                type="button"
                key={key}
                onClick={() => {
                  setTab(key);
                  setPage(1);
                }}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${
                  tab === key
                    ? "bg-[#102B52] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {label} <span className="opacity-70">{stats[key]}</span>
              </button>
            ))}
          </div>

          {/* FILTERS */}

          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="relative xl:col-span-2">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search ID, issue, Student, Technician..."
                className={`${inputClass} pl-10`}
              />
            </label>

            <select
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">All Locations</option>
              {locations.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">All Categories</option>
              {categories.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">All Priorities</option>
              {["LOW", "MEDIUM", "HIGH", "URGENT", "EMERGENCY"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            <select
              value={materialFilter}
              onChange={(e) => {
                setMaterialFilter(e.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">All Material Requirements</option>
              <option value="REQUIRED">Material Required</option>
              <option value="NOT_REQUIRED">Not Required</option>
            </select>
          </div>

          {(search ||
            tab !== "ALL" ||
            categoryFilter ||
            locationFilter ||
            priorityFilter ||
            materialFilter) && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500"
            >
              <FilterX size={14} />
              Clear Filters
            </button>
          )}
        </div>

        {/* BATCH ASSIGNMENT */}

        {showBatches && (
          <div className="border-b bg-amber-50/30 p-4 sm:p-5">
            <h3 className="font-bold">Pending Complaint Batches</h3>

            {workerError && (
              <p className="mt-2 text-sm text-rose-700">{workerError}</p>
            )}

            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {batches.map((batch) => {
                const matching = workers.filter((w) =>
                  matchesTechnician(w, batch.complaints[0]),
                );

                return (
                  <div
                    key={batch.key}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-bold">{batch.location}</p>
                        <p className="text-xs text-slate-500">
                          {batch.category}
                        </p>
                      </div>

                      <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold">
                        {batch.complaints.length}/10
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {batch.complaints.map((c) => c.complaintId).join(", ")}
                    </p>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <select
                        value={batchSelections[batch.key] || ""}
                        onChange={(e) =>
                          setBatchSelections((prev) => ({
                            ...prev,
                            [batch.key]: e.target.value,
                          }))
                        }
                        className={`${inputClass} flex-1`}
                      >
                        <option value="">Select Technician</option>

                        {matching.map((w) => (
                          <option key={w._id} value={w._id}>
                            {w.name} · {w.shift} · {readable(w.availability)}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        disabled={
                          !batchSelections[batch.key] ||
                          Boolean(assigningBatch) ||
                          Boolean(workerError)
                        }
                        onClick={() => assignBatch(batch)}
                        className={primaryButton}
                      >
                        {assigningBatch === batch.key
                          ? "Assigning..."
                          : `Assign ${batch.complaints.length}`}
                      </button>
                    </div>

                    {matching.length === 0 && (
                      <p className="mt-2 text-xs text-amber-800">
                        No eligible Technician with matching Admin category.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {batches.length === 0 && (
              <p className="mt-3 text-sm text-slate-500">
                No pending complaint batches.
              </p>
            )}
          </div>
        )}

        {/* DESKTOP TABLE */}

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Complaint</th>
                <th className="px-4 py-3">Location / Category</th>
                <th className="px-4 py-3">Technician</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Materials</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {visible.map((c) => {
                const linked = linkedRequests(c);

                return (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-black">{c.complaintId}</p>
                      <p className="mt-1 text-xs text-slate-600">{c.title}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {dateIST(c.createdAt)}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-xs">{locationOf(c)}</p>
                      <p className="mt-1 font-semibold">{c.category}</p>
                    </td>

                    <td className="px-4 py-3 text-xs">
                      {c.assignedTo?.name ||
                        (assigned(c) ? "Assigned" : "Not Assigned")}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-bold ${badge(c.status)}`}
                      >
                        {statusText(c)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs">
                      {linked.length
                        ? readable(linked[0].status)
                        : c.materialRequired
                          ? readable(c.materialStatus || "PENDING")
                          : "No request"}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openComplaint(c)}
                        className={primaryButton}
                      >
                        <ArrowRight size={14} />
                        Open
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}

        <div className="grid gap-3 p-3 lg:hidden">
          {visible.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => openComplaint(c)}
              className="rounded-xl border border-slate-200 p-4 text-left"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <strong>{c.complaintId}</strong>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${badge(c.status)}`}
                >
                  {statusText(c)}
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold">{c.title}</p>

              <p className="mt-2 text-xs text-slate-500">{locationOf(c)}</p>

              <p className="mt-1 text-xs text-slate-500">
                Category: {c.category}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Technician: {c.assignedTo?.name || "Not Assigned"}
              </p>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="p-10 text-center text-sm text-slate-500">
            No complaints match your filters.
          </p>
        )}

        {/* PAGINATION */}

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t p-4 text-xs">
            <span>
              Page {safePage} of {pages}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border p-2 disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>

              <button
                type="button"
                disabled={safePage >= pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border p-2 disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* DETAILS DRAWER */}

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Complaint ${selected.complaintId}`}
          className="fixed inset-0 z-[100]"
        >
          <button
            type="button"
            aria-label="Close details"
            onClick={() => setSelectedId("")}
            className="absolute inset-0 w-full bg-slate-950/60"
          />

          <aside className="absolute inset-y-0 right-0 flex w-full max-w-[640px] flex-col bg-white shadow-2xl">
            {/* DRAWER HEADER */}

            <div className="bg-gradient-to-r from-[#071C3C] to-[#204779] p-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
                    Complaint Details
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    {selected.complaintId}
                  </h2>

                  <p className="mt-1 text-sm text-slate-200">
                    {selected.title}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedId("")}
                  aria-label="Close"
                  className="rounded-lg bg-white/10 p-2"
                >
                  <X size={21} />
                </button>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto">
                {[
                  ["OVERVIEW", "Overview"],
                  ["ASSIGN", "Technician"],
                  ["MATERIALS", "Materials"],
                  ["STUDENT", "Student Status"],
                ].map(([key, label]) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setDrawerTab(key)}
                    className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold ${
                      drawerTab === key
                        ? "bg-[#D7A94B] text-[#071C3C]"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* DRAWER CONTENT */}

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              {/* OVERVIEW */}

              {drawerTab === "OVERVIEW" && (
                <>
                  <div className="rounded-xl border p-4">
                    <h3 className="flex items-center gap-2 font-bold">
                      <FileText size={17} />
                      Issue Details
                    </h3>

                    <p className="mt-3 font-semibold">{selected.title}</p>

                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                      {selected.description || "No description"}
                    </p>

                    {(selected.titleHindi || selected.descriptionHindi) && (
                      <p className="mt-3 border-t pt-3 text-sm text-slate-600">
                        {selected.titleHindi} {selected.descriptionHindi}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["Location", locationOf(selected)],
                      ["Student", selected.createdBy?.name || "—"],
                      ["Category", selected.category],
                      ["Priority", selected.priority],
                      ["Status", statusText(selected)],
                      ["Deadline", dateIST(selected.deadline)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-slate-50 p-4">
                        <p className={smallLabel}>{label}</p>
                        <p className="mt-2 text-sm font-semibold">
                          {value || "—"}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border p-4">
                    <h3 className="flex items-center gap-2 font-bold">
                      <CalendarDays size={17} />
                      Timeline
                    </h3>

                    <p className="mt-3 text-xs">
                      Created: {dateIST(selected.createdAt)}
                    </p>
                    <p className="mt-2 text-xs">
                      Started: {dateIST(selected.startedAt)}
                    </p>
                    <p className="mt-2 text-xs">
                      Work Done: {dateIST(selected.completedAt)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDrawerTab("ASSIGN")}
                      className={primaryButton}
                    >
                      Technician
                    </button>

                    <button
                      type="button"
                      onClick={() => setDrawerTab("MATERIALS")}
                      className="rounded-xl bg-amber-100 p-3 text-xs font-bold text-amber-950"
                    >
                      Materials
                    </button>
                  </div>

                  {emergency(selected) && (
                    <button
                      type="button"
                      onClick={() => navigate("/maintenance/job-cards")}
                      className="flex items-center gap-2 text-sm font-bold text-blue-700"
                    >
                      <Printer size={16} />
                      Emergency Job Cards
                    </button>
                  )}
                </>
              )}

              {/* TECHNICIAN ASSIGNMENT */}

              {drawerTab === "ASSIGN" && (
                <div className="space-y-4">
                  <div className="rounded-xl border p-4">
                    <p className={smallLabel}>Current Technician</p>

                    <p className="mt-2 font-black">
                      {selected.assignedTo?.name ||
                        (assigned(selected) ? "Assigned" : "Not Assigned")}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {selected.category}
                    </p>
                  </div>

                  {assigned(selected) ? (
                    <p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                      Complaint already assigned. Technician will start work
                      during eligible duty.
                    </p>
                  ) : canAssign ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                      <h3 className="font-black">Assign Technician</h3>

                      <p className="mt-1 text-xs text-slate-600">
                        Showing active Technicians matching Admin category:{" "}
                        <b>{selected.category}</b>. Off-duty Technicians can
                        receive scheduled assignments.
                      </p>

                      {workerError && (
                        <p className="mt-3 text-xs text-rose-700">
                          {workerError}
                        </p>
                      )}

                      <select
                        value={workerId}
                        onChange={(e) => setWorkerId(e.target.value)}
                        disabled={Boolean(workerError)}
                        className={`${inputClass} mt-4`}
                      >
                        <option value="">Select Technician</option>

                        {availableTechnicians.map((w) => (
                          <option key={w._id} value={w._id}>
                            {w.name} · {w.department} · {w.shift} ·{" "}
                            {readable(w.availability)}
                          </option>
                        ))}
                      </select>

                      {availableTechnicians.length === 0 && (
                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                          <p className="font-bold">
                            No category-matched eligible Technician.
                          </p>

                          <p className="mt-1">
                            Verify the Technician's category against Admin
                            Category Master.
                          </p>

                          <button
                            type="button"
                            onClick={() => navigate("/maintenance/workers")}
                            className="mt-2 font-bold text-blue-700 underline"
                          >
                            Open Technician Management
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={assignOne}
                        disabled={
                          !workerId || assigning || Boolean(workerError)
                        }
                        className={`${primaryButton} mt-3 w-full`}
                      >
                        <UserCheck size={17} />

                        {assigning ? "Assigning..." : "Confirm Assignment"}
                      </button>
                    </div>
                  ) : (
                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                      Only unassigned Pending or Reopened complaints can be
                      assigned.
                    </p>
                  )}

                  <p className="text-xs leading-5 text-slate-500">
                    Assignment sets status to ASSIGNED. Technician Start Work
                    changes status to IN_PROGRESS after duty validation. Student
                    performs final YES/NO confirmation.
                  </p>
                </div>
              )}

              {/* MATERIAL REQUESTS */}

              {drawerTab === "MATERIALS" && (
                <div className="space-y-4">
                  {requestError && (
                    <p
                      role="alert"
                      className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
                    >
                      {requestError}
                    </p>
                  )}

                  {selectedRequests.length === 0 && (
                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                      No material requests for this complaint.
                    </p>
                  )}

                  {selectedRequests.map((request) => (
                    <div
                      key={request._id || request.requestId}
                      className="overflow-hidden rounded-xl border"
                    >
                      <div className="flex items-center justify-between gap-2 bg-slate-50 p-4">
                        <div>
                          <p className="font-bold">
                            {request.requestId || "Material Request"}
                          </p>

                          <p className="text-xs text-slate-500">
                            {dateIST(request.createdAt)}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2 py-1 text-xs ${badge(request.status)}`}
                        >
                          {readable(request.status)}
                        </span>
                      </div>

                      <div className="space-y-3 p-4">
                        {(request.materials || []).map((m, i) => {
                          const requested = Number(m.quantity);
                          const issued =
                            m.issuedQuantity == null
                              ? null
                              : Number(m.issuedQuantity);
                          const received =
                            m.receivedQuantity == null
                              ? null
                              : Number(m.receivedQuantity);

                          return (
                            <div
                              key={m._id || i}
                              className="rounded-xl border p-3 text-sm"
                            >
                              <p className="font-bold">{m.itemName}</p>

                              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                                {[
                                  ["Requested", requested],
                                  ["Store Issued", issued],
                                  ["Tech Received", received],
                                  [
                                    "Pending Issue",
                                    issued == null
                                      ? null
                                      : Math.max(0, requested - issued),
                                  ],
                                ].map(([label, amount]) => (
                                  <div
                                    key={label}
                                    className="rounded-lg bg-slate-50 p-2"
                                  >
                                    <p className="text-slate-500">{label}</p>
                                    <p className="mt-1 font-black">
                                      {amount == null ? "—" : amount}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}

                        {request.reason && (
                          <p className="text-xs text-slate-600">
                            <b>Reason:</b> {request.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {canCreateRequest ? (
                    <form
                      onSubmit={createMaterialRequest}
                      className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/30 p-4"
                    >
                      <h3 className="flex items-center gap-2 font-black">
                        <Package size={17} />
                        Request Materials
                      </h3>

                      <p className="text-xs text-slate-600">
                        Materials can be requested before Technician assignment.
                      </p>

                      {materials.map((m, i) => (
                        <div key={i} className="rounded-xl border bg-white p-3">
                          <div className="flex justify-between gap-2">
                            <p className="text-xs font-bold">Item {i + 1}</p>

                            {materials.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setMaterials((list) =>
                                    list.filter((_, index) => index !== i),
                                  )
                                }
                                aria-label="Remove material"
                              >
                                <Trash2 size={15} className="text-rose-600" />
                              </button>
                            )}
                          </div>

                          <input
                            required
                            value={m.itemName}
                            onChange={(e) =>
                              updateMaterial(i, "itemName", e.target.value)
                            }
                            placeholder="Material Name"
                            className={`${inputClass} mt-2`}
                          />

                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <input
                              required
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={m.quantity}
                              onChange={(e) =>
                                updateMaterial(i, "quantity", e.target.value)
                              }
                              placeholder="Quantity"
                              className={inputClass}
                            />

                            <select
                              value={m.unit}
                              onChange={(e) =>
                                updateMaterial(i, "unit", e.target.value)
                              }
                              className={inputClass}
                            >
                              {UNITS.map((unit) => (
                                <option key={unit} value={unit}>
                                  {unit}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          setMaterials((list) => [...list, newMaterial()])
                        }
                        className="flex items-center gap-2 text-xs font-bold text-blue-700"
                      >
                        <Plus size={16} />
                        Add Material
                      </button>

                      <textarea
                        rows={3}
                        required
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason for request"
                        className={inputClass}
                      />

                      <button
                        type="submit"
                        disabled={sendingRequest}
                        className={`${primaryButton} w-full`}
                      >
                        <Send size={16} />
                        {sendingRequest
                          ? "Sending..."
                          : "Send Request to Store"}
                      </button>
                    </form>
                  ) : selectedRequests.length > 0 ? (
                    <p className="text-xs text-slate-500">
                      Existing request is tracked above. Follow-up material
                      requests need a separate backend workflow.
                    </p>
                  ) : null}
                </div>
              )}

              {/* STUDENT STATUS */}

              {drawerTab === "STUDENT" && (
                <div className="space-y-4">
                  <div className="rounded-xl border p-4">
                    <h3 className="flex items-center gap-2 font-bold">
                      <CheckCircle2 size={18} />
                      Student Confirmation
                    </h3>

                    <p className="mt-3 text-sm">
                      {selected.studentVerified === true
                        ? "Student confirmed the complaint is resolved."
                        : [
                              "COMPLETED",
                              "AWAITING_STUDENT_CONFIRMATION",
                            ].includes(upper(selected.status))
                          ? "Work done. Awaiting Student YES/NO confirmation."
                          : upper(selected.status) === "REOPENED"
                            ? "Student reported the issue is not resolved."
                            : `Current status: ${statusText(selected)}`}
                    </p>
                  </div>

                  {upper(selected.status) === "REOPENED" && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                      <h3 className="flex items-center gap-2 font-bold text-rose-800">
                        <RotateCcw size={17} />
                        Reopened Reason
                      </h3>

                      <p className="mt-3 whitespace-pre-wrap text-sm text-rose-900">
                        {studentReason(selected) ||
                          "Reason not available in API response."}
                      </p>
                    </div>
                  )}

                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    Only Student can confirm YES to resolve the complaint. NO
                    requires a reason and reopens the complaint. Maintenance
                    Manager and Warden monitor the process.
                  </div>

                  {emergency(selected) && (
                    <button
                      type="button"
                      onClick={() => navigate("/maintenance/job-cards")}
                      className="flex items-center gap-2 text-sm font-bold text-blue-700"
                    >
                      <Printer size={16} />
                      Emergency Job Card
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
