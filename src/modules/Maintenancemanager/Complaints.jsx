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
  MapPin,
  Package,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Trash2,
  UserCheck,
  UserRound,
  Users,
  Wrench,
  X,
} from "lucide-react";

import api from "../../services/api";

// ==========================================
// CONFIGURATION
// ==========================================

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

// ==========================================
// HELPERS
// ==========================================

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const upper = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

const readable = (value) => String(value || "—").replaceAll("_", " ");

const toId = (value) => String(value?._id ?? value ?? "");

const numberOrNull = (value) =>
  value === "" ||
  value === null ||
  value === undefined ||
  !Number.isFinite(Number(value))
    ? null
    : Number(value);

const displayQuantity = (value) =>
  numberOrNull(value) === null ? "—" : Number(value);

function formatIST(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) {
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

function locationLabel(complaint) {
  const parts = [
    complaint.hostel || complaint.block || complaint.complaintArea,

    complaint.issueLocation,

    complaint.floor ? `Floor ${complaint.floor}` : null,

    complaint.roomNumber ? `Room ${complaint.roomNumber}` : null,
  ];

  return parts.filter(Boolean).join(" · ") || "—";
}

function hasAssignedTechnician(complaint) {
  return Boolean(complaint.assignedTo || complaint.workerAssigned);
}

function isEmergency(complaint) {
  return (
    complaint.isEmergency === true ||
    upper(complaint.priority) === "EMERGENCY" ||
    upper(complaint.complaintType) === "EMERGENCY"
  );
}

function isOverdue(complaint, now) {
  if (!complaint.deadline || !now) {
    return false;
  }

  const deadline = new Date(complaint.deadline).getTime();

  return (
    Number.isFinite(deadline) &&
    deadline < now &&
    !["RESOLVED", "CLOSED"].includes(upper(complaint.status))
  );
}

function matchesRequest(request, complaint) {
  const linked = request?.complaint;

  const linkedId = toId(linked);

  const publicId = typeof linked === "object" ? linked?.complaintId : null;

  return (
    (linkedId && linkedId === toId(complaint._id)) ||
    (publicId && publicId === complaint.complaintId) ||
    (request?.complaintId &&
      [toId(complaint._id), complaint.complaintId].includes(
        String(request.complaintId),
      ))
  );
}

// ==========================================
// BADGE COLORS
// ==========================================

function badgeStyle(value) {
  const status = upper(value);

  if (
    [
      "RESOLVED",
      "CLOSED",
      "ISSUED",
      "APPROVED",
      "APPROVED_BY_STORE",
      "RECEIVED",
    ].includes(status)
  ) {
    return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  }

  if (
    ["REOPENED", "REJECTED", "OUT_OF_STOCK", "EMERGENCY", "URGENT"].includes(
      status,
    )
  ) {
    return "bg-rose-50 text-rose-800 ring-rose-200";
  }

  if (["ASSIGNED", "IN_PROGRESS"].includes(status)) {
    return "bg-blue-50 text-blue-800 ring-blue-200";
  }

  if (
    [
      "PENDING",
      "COMPLETED",
      "AWAITING_STUDENT_CONFIRMATION",
      "WAITING_MATERIAL",
      "WAITING_FOR_MATERIAL",
      "PARTIALLY_ISSUED",
      "PARTIALLY_APPROVED",
    ].includes(status)
  ) {
    return "bg-amber-50 text-amber-800 ring-amber-200";
  }

  return "bg-slate-100 text-slate-600 ring-slate-200";
}

function statusText(complaint) {
  const status = upper(complaint.status);

  if (status === "AWAITING_STUDENT_CONFIRMATION") {
    return "Awaiting Student Confirmation";
  }

  if (status === "COMPLETED" && complaint.studentVerified !== true) {
    return "Work Done · Awaiting Student";
  }

  return readable(status);
}

// ==========================================
// STUDENT REOPEN REASON
// ==========================================

function studentReason(complaint) {
  const options = [
    complaint.studentConfirmation?.reason,
    complaint.studentFeedback?.reason,
    complaint.studentReopenReason,
    complaint.reopenReason,
    complaint.reopenNote,
  ];

  return (
    options.find((value) => typeof value === "string" && value.trim()) || ""
  );
}

// ==========================================
// CATEGORY-MATCHED TECHNICIANS
// ==========================================

function matchingTechnicians(workers, complaint) {
  return workers.filter((worker) => {
    const department = worker.department ?? worker.category;

    const enabled =
      worker.isActive !== false &&
      !["OFFLINE", "INACTIVE", "DELETED"].includes(upper(worker.status));

    return enabled && normalize(department) === normalize(complaint.category);
  });
}

const INITIAL_MATERIAL = () => ({
  itemName: "",
  quantity: "",
  unit: "PIECE",
});

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function Complaints() {
  const navigate = useNavigate();

  // DATABASE DATA
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [requests, setRequests] = useState([]);

  // LOADING
  const [initialLoading, setInitialLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  // API ERRORS
  const [complaintError, setComplaintError] = useState("");

  const [workerError, setWorkerError] = useState("");

  const [requestError, setRequestError] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);

  // FILTERS
  const [tab, setTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");

  const [page, setPage] = useState(1);

  // COMPLAINT DETAILS
  const [selectedId, setSelectedId] = useState("");

  const [drawerTab, setDrawerTab] = useState("OVERVIEW");

  // TECHNICIAN ASSIGNMENT
  const [workerId, setWorkerId] = useState("");
  const [assigning, setAssigning] = useState(false);

  // MATERIAL REQUEST
  const [materials, setMaterials] = useState([INITIAL_MATERIAL()]);

  const [reason, setReason] = useState("");

  const [sendingRequest, setSendingRequest] = useState(false);

  // BATCH ASSIGNMENT
  const [showBatches, setShowBatches] = useState(false);

  const [batchSelections, setBatchSelections] = useState({});

  const [assigningBatch, setAssigningBatch] = useState("");

  // ========================================
  // FETCH ALL CONNECTED DATA
  // ========================================

  const fetchAll = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setInitialLoading(true);
    }

    try {
      const [complaintResult, workerResult, requestResult] =
        await Promise.allSettled([
          api.get("/maintenance/worker/complaints"),

          api.get("/maintenance/assign-worker/workers"),

          api.get("/maintenance/material-requests"),
        ]);

      // COMPLAINTS

      if (
        complaintResult.status === "fulfilled" &&
        Array.isArray(complaintResult.value.data?.complaints)
      ) {
        setComplaints(complaintResult.value.data.complaints);

        setComplaintError("");
      } else {
        const error =
          complaintResult.status === "rejected" ? complaintResult.reason : null;

        const message =
          error?.response?.data?.message || "Could not load complaints.";

        setComplaintError(message);

        if (!silent) {
          toast.error(message);
        }
      }

      // TECHNICIANS

      if (
        workerResult.status === "fulfilled" &&
        Array.isArray(workerResult.value.data?.workers)
      ) {
        setWorkers(workerResult.value.data.workers);

        setWorkerError("");
      } else {
        setWorkerError(
          "Technician list unavailable. Assignment is disabled until it loads.",
        );
      }

      // MATERIAL REQUESTS

      if (
        requestResult.status === "fulfilled" &&
        Array.isArray(requestResult.value.data?.requests)
      ) {
        setRequests(requestResult.value.data.requests);

        setRequestError("");
      } else {
        setRequestError(
          "Material request history unavailable. New requests are disabled to avoid duplicates.",
        );
      }

      setLastUpdated(new Date().toISOString());
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ========================================
  // INITIAL LOAD + AUTO REFRESH
  // ========================================

  useEffect(() => {
    void fetchAll();

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchAll(true);
      }
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [fetchAll]);

  // ========================================
  // DRAWER ESCAPE HANDLER
  // ========================================

  useEffect(() => {
    if (!selectedId) {
      return undefined;
    }

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedId("");
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedId]);

  // ========================================
  // CURRENT COMPLAINT
  // ========================================

  const selected = useMemo(
    () =>
      complaints.find((complaint) => toId(complaint._id) === selectedId) ||
      null,
    [complaints, selectedId],
  );

  const now = lastUpdated ? new Date(lastUpdated).getTime() : 0;

  // ========================================
  // LINK MATERIAL REQUEST TO COMPLAINT
  // ========================================

  const requestsFor = (complaint) =>
    requests.filter((request) => matchesRequest(request, complaint));

  const selectedRequests = selected ? requestsFor(selected) : [];

  const eligibleTechnicians = selected
    ? matchingTechnicians(workers, selected)
    : [];

  const alreadyAssigned = selected ? hasAssignedTechnician(selected) : false;

  const eligibleForAssignment =
    selected &&
    !alreadyAssigned &&
    ["PENDING", "REOPENED"].includes(upper(selected.status));

  const canCreateRequest =
    selected &&
    !requestError &&
    selectedRequests.length === 0 &&
    !["RESOLVED", "CLOSED"].includes(upper(selected.status));

  // ========================================
  // FILTER VALUES
  // ========================================

  const locations = useMemo(
    () =>
      [
        ...new Set(
          complaints
            .map((item) => item.hostel || item.block || item.complaintArea)
            .filter(Boolean),
        ),
      ].sort(),
    [complaints],
  );

  const categories = useMemo(
    () =>
      [
        ...new Set(complaints.map((item) => item.category).filter(Boolean)),
      ].sort(),
    [complaints],
  );

  // ========================================
  // COMPLAINT COUNTS
  // ========================================

  const stats = useMemo(() => {
    const count = (check) => complaints.filter(check).length;

    return {
      ALL: complaints.length,

      PENDING: count(
        (c) => upper(c.status) === "PENDING" && !hasAssignedTechnician(c),
      ),

      ASSIGNED: count(
        (c) =>
          hasAssignedTechnician(c) &&
          !["RESOLVED", "CLOSED"].includes(upper(c.status)),
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

      OVERDUE: count((c) => isOverdue(c, now)),

      RESOLVED: count((c) => ["RESOLVED", "CLOSED"].includes(upper(c.status))),
    };
  }, [complaints, requests, now]);

  // ========================================
  // SEARCH + FILTERING
  // ========================================

  const filtered = useMemo(() => {
    const value = normalize(search);

    return complaints
      .filter((item) => {
        const status = upper(item.status);

        const tabMatches =
          tab === "ALL" ||
          (tab === "PENDING" &&
            status === "PENDING" &&
            !hasAssignedTechnician(item)) ||
          (tab === "ASSIGNED" &&
            hasAssignedTechnician(item) &&
            !["RESOLVED", "CLOSED"].includes(status)) ||
          (tab === "IN_PROGRESS" && status === "IN_PROGRESS") ||
          (tab === "MATERIAL" &&
            (item.materialRequired ||
              requests.some((r) => matchesRequest(r, item)))) ||
          (tab === "AWAITING" &&
            ["COMPLETED", "AWAITING_STUDENT_CONFIRMATION"].includes(status) &&
            item.studentVerified !== true) ||
          (tab === "REOPENED" && status === "REOPENED") ||
          (tab === "OVERDUE" && isOverdue(item, now)) ||
          (tab === "RESOLVED" && ["RESOLVED", "CLOSED"].includes(status));

        const location = item.hostel || item.block || item.complaintArea;

        const searchable = [
          item.complaintId,
          item.title,
          item.description,
          item.hostel,
          item.block,
          item.roomNumber,
          item.category,
          item.createdBy?.name,
          item.assignedTo?.name,
        ]
          .map(normalize)
          .join(" ");

        const hasMaterials = Boolean(
          item.materialRequired ||
          requests.some((r) => matchesRequest(r, item)),
        );

        return (
          tabMatches &&
          (!value || searchable.includes(value)) &&
          (!categoryFilter || item.category === categoryFilter) &&
          (!locationFilter || location === locationFilter) &&
          (!priorityFilter || upper(item.priority) === priorityFilter) &&
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
    requests,
    tab,
    search,
    categoryFilter,
    locationFilter,
    priorityFilter,
    materialFilter,
    now,
  ]);

  // ========================================
  // PAGINATION
  // ========================================

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const safePage = Math.min(page, pages);

  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // ========================================
  // BATCH ASSIGNMENT
  // SAME LOCATION + CATEGORY
  // MAX 10 PER BATCH
  // ========================================

  const batches = useMemo(() => {
    const groups = new Map();

    complaints
      .filter(
        (item) =>
          upper(item.status) === "PENDING" && !hasAssignedTechnician(item),
      )
      .forEach((item) => {
        const location =
          item.hostel || item.block || item.complaintArea || "Other";

        const category = item.category || "Uncategorized";

        const key = `${normalize(location)}::${normalize(category)}`;

        if (!groups.has(key)) {
          groups.set(key, {
            location,
            category,
            complaints: [],
          });
        }

        groups.get(key).complaints.push(item);
      });

    const result = [];

    for (const [key, group] of groups.entries()) {
      for (let index = 0; index < group.complaints.length; index += 10) {
        result.push({
          key: `${key}::${index / 10 + 1}`,

          location: group.location,

          category: group.category,

          complaints: group.complaints.slice(index, index + 10),
        });
      }
    }

    return result;
  }, [complaints]);

  // ========================================
  // OPEN COMPLAINT DRAWER
  // ========================================

  function openComplaint(complaint, initialTab = "OVERVIEW") {
    setSelectedId(toId(complaint._id));

    setDrawerTab(initialTab);

    setWorkerId("");

    setMaterials([INITIAL_MATERIAL()]);

    setReason("");
  }

  // ========================================
  // UPDATE MATERIAL FORM
  // ========================================

  function updateMaterial(index, field, value) {
    setMaterials((items) =>
      items.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  // ========================================
  // ASSIGN SINGLE COMPLAINT
  // ========================================

  async function assignOne() {
    if (!selected || !workerId || assigning || !eligibleForAssignment) {
      return;
    }

    try {
      setAssigning(true);

      await api.put("/maintenance/assign-worker/assign", {
        complaintId: selected._id,
        workerId,
      });

      toast.success("Technician assigned successfully.");

      setWorkerId("");

      await fetchAll(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Could not assign Technician.",
      );
    } finally {
      setAssigning(false);
    }
  }

  // ========================================
  // ASSIGN COMPLAINT BATCH
  // ========================================

  async function assignBatch(batch) {
    const chosen = batchSelections[batch.key];

    if (!chosen || assigningBatch) {
      return;
    }

    setAssigningBatch(batch.key);

    let assignedCount = 0;

    try {
      for (const complaint of batch.complaints) {
        try {
          await api.put("/maintenance/assign-worker/assign", {
            complaintId: complaint._id,
            workerId: chosen,
          });

          assignedCount += 1;
        } catch (error) {
          toast.error(
            `${assignedCount} assigned. Stopped at ${complaint.complaintId}: ${
              error?.response?.data?.message || "Assignment failed"
            }`,
          );

          break;
        }
      }

      if (assignedCount === batch.complaints.length) {
        toast.success(`${assignedCount} complaints assigned.`);
      }

      await fetchAll(true);

      setBatchSelections((current) => ({
        ...current,
        [batch.key]: "",
      }));
    } finally {
      setAssigningBatch("");
    }
  }

  // ========================================
  // CREATE MATERIAL REQUEST
  // ========================================

  async function createMaterialRequest(event) {
    event.preventDefault();

    if (!selected || !canCreateRequest || sendingRequest) {
      return;
    }

    if (!reason.trim()) {
      return toast.error("Please enter the reason for materials.");
    }

    const invalid = materials.some(
      (material) =>
        !material.itemName.trim() ||
        numberOrNull(material.quantity) === null ||
        Number(material.quantity) <= 0,
    );

    if (invalid) {
      return toast.error(
        "Enter a material name and valid quantity for each item.",
      );
    }

    try {
      setSendingRequest(true);

      await api.post("/maintenance/material-requests/create", {
        complaintId: selected._id,

        materials: materials.map((material) => ({
          itemName: material.itemName.trim(),

          quantity: Number(material.quantity),

          unit: material.unit,
        })),

        reason: reason.trim(),
      });

      toast.success("Material request sent to Store Manager.");

      setMaterials([INITIAL_MATERIAL()]);

      setReason("");

      setDrawerTab("MATERIALS");

      await fetchAll(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Could not create material request.",
      );
    } finally {
      setSendingRequest(false);
    }
  }

  // ========================================
  // INITIAL LOADER
  // ========================================

  if (initialLoading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center gap-3 text-slate-500">
        <Loader2 className="animate-spin text-[#B48632]" size={26} />
        Loading complaints...
      </div>
    );
  }

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <main className="min-w-0 space-y-5 text-[#102B52]">
      {/* HEADER */}

      <header className="rounded-3xl bg-gradient-to-r from-[#071C3C] via-[#123665] to-[#204779] p-5 text-white shadow-lg sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-amber-300">
              AMIMAINTAIN · MAINTENANCE OPERATIONS
            </p>

            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Complaint Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              Receive complaints, assign Technicians, send material requests and
              track Student confirmation—all in one workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/20 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-300">
          Updated {formatIST(lastUpdated)} IST · Auto-refresh every 30 seconds
        </p>
      </header>

      {/* ERROR */}

      {complaintError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          {complaintError}{" "}
          <button
            type="button"
            onClick={() => fetchAll()}
            className="font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI CARDS */}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {[
          {
            label: "Total Complaints",
            value: stats.ALL,
            icon: ClipboardList,
            filter: "ALL",
          },
          {
            label: "Pending Assignment",
            value: stats.PENDING,
            icon: Clock3,
            filter: "PENDING",
          },
          {
            label: "In Progress",
            value: stats.IN_PROGRESS,
            icon: Wrench,
            filter: "IN_PROGRESS",
          },
          {
            label: "Material Requests",
            value: stats.MATERIAL,
            icon: Package,
            filter: "MATERIAL",
          },
          {
            label: "Awaiting Student",
            value: stats.AWAITING,
            icon: UserCheck,
            filter: "AWAITING",
          },
        ].map((card) => {
          const Icon = card.icon;

          return (
            <button
              key={card.label}
              type="button"
              onClick={() => {
                setTab(card.filter);
                setPage(1);
              }}
              className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-[#D7A94B] hover:shadow-md ${
                tab === card.filter ? "border-[#D7A94B]" : "border-slate-200"
              }`}
            >
              <Icon size={20} className="text-[#B48632]" />

              <div className="mt-3 text-2xl font-black tabular-nums">
                {card.value}
              </div>

              <div className="mt-1 text-xs font-semibold text-slate-500">
                {card.label}
              </div>
            </button>
          );
        })}
      </section>

      {/* COMPLAINT WORKSPACE */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* FILTER HEADER */}

        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">All Maintenance Complaints</h2>

              <p className="text-xs text-slate-500">
                Every complaint remains a separate record, even at the same
                location.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowBatches((value) => !value)}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100"
            >
              <Users size={16} />

              {showBatches
                ? "Hide Batch Assignment"
                : "Batch Assignment (Max 10)"}
            </button>
          </div>

          {/* STATUS TABS */}

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {TABS.map(([key, label]) => (
              <button
                type="button"
                key={key}
                onClick={() => {
                  setTab(key);
                  setPage(1);
                }}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold transition ${
                  tab === key
                    ? "bg-[#102B52] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}

                <span className="ml-1 opacity-70">{stats[key]}</span>
              </button>
            ))}
          </div>

          {/* SEARCH AND FILTERS */}

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="relative xl:col-span-2">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search ID, issue, Student, Technician..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-amber-400"
              />
            </label>

            <select
              value={locationFilter}
              onChange={(event) => {
                setLocationFilter(event.target.value);
                setPage(1);
              }}
              className="min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="">All Locations</option>

              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setPage(1);
              }}
              className="min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="">All Categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              value={priorityFilter}
              onChange={(event) => {
                setPriorityFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="">All Priorities</option>

              {["LOW", "MEDIUM", "HIGH", "URGENT", "EMERGENCY"].map(
                (priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ),
              )}
            </select>

            <select
              value={materialFilter}
              onChange={(event) => {
                setMaterialFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="">All Material Requirements</option>

              <option value="REQUIRED">Materials Requested / Required</option>

              <option value="NOT_REQUIRED">No Materials Requested</option>
            </select>
          </div>

          {(search ||
            locationFilter ||
            categoryFilter ||
            priorityFilter ||
            materialFilter ||
            tab !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setLocationFilter("");
                setCategoryFilter("");
                setPriorityFilter("");
                setMaterialFilter("");
                setTab("ALL");
                setPage(1);
              }}
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#102B52]"
            >
              <FilterX size={14} />
              Clear filters
            </button>
          )}
        </div>

        {/* BATCH ASSIGNMENT */}

        {showBatches && (
          <div className="border-b border-amber-100 bg-amber-50/40 p-4 sm:p-5">
            <div className="mb-3 font-bold">Pending Complaint Batches</div>

            {workerError && (
              <p className="mb-3 text-sm text-rose-700">{workerError}</p>
            )}

            {batches.length === 0 ? (
              <p className="text-sm text-slate-500">
                No unassigned pending complaints.
              </p>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {batches.map((batch) => {
                  const matching = matchingTechnicians(workers, {
                    category: batch.category,
                  });

                  return (
                    <div
                      key={batch.key}
                      className="rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">
                            {batch.location} · {batch.category}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {batch.complaints
                              .map((item) => item.complaintId)
                              .join(", ")}
                          </p>
                        </div>

                        <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-900">
                          {batch.complaints.length}/10
                        </span>
                      </div>

                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <select
                          aria-label="Select Technician for batch"
                          value={batchSelections[batch.key] || ""}
                          onChange={(event) =>
                            setBatchSelections((current) => ({
                              ...current,
                              [batch.key]: event.target.value,
                            }))
                          }
                          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        >
                          <option value="">Select Technician</option>

                          {matching.map((worker) => (
                            <option key={worker._id} value={worker._id}>
                              {worker.name} ·{" "}
                              {worker.department || worker.category}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          disabled={
                            !batchSelections[batch.key] ||
                            !!assigningBatch ||
                            !!workerError
                          }
                          onClick={() => assignBatch(batch)}
                          className="rounded-lg bg-[#102B52] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                        >
                          {assigningBatch === batch.key
                            ? "Assigning..."
                            : `Assign ${batch.complaints.length}`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* DESKTOP COMPLAINT TABLE */}

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[920px] text-left text-sm">
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
              {visible.map((complaint) => {
                const linked = requestsFor(complaint);

                return (
                  <tr key={complaint._id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <p className="font-black">
                        {complaint.complaintId || "—"}
                      </p>

                      <p className="mt-1 max-w-[220px] truncate text-xs text-slate-600">
                        {complaint.title || "Untitled"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatIST(complaint.createdAt)}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="max-w-[230px] text-xs">
                        {locationLabel(complaint)}
                      </p>

                      <p className="mt-1 font-semibold">
                        {complaint.category || "—"}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-xs">
                      {complaint.assignedTo?.name ||
                        (hasAssignedTechnician(complaint)
                          ? "Assigned"
                          : "Not Assigned")}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${badgeStyle(
                          complaint.status,
                        )}`}
                      >
                        {statusText(complaint)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs">
                      {linked.length ? (
                        <button
                          type="button"
                          onClick={() => openComplaint(complaint, "MATERIALS")}
                          className="font-bold text-blue-700 underline"
                        >
                          {readable(linked[0].status)} · View
                        </button>
                      ) : complaint.materialRequired ? (
                        readable(complaint.materialStatus || "PENDING")
                      ) : (
                        "No request"
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openComplaint(complaint)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#102B52] px-3 py-2 text-xs font-bold text-white"
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

        {/* MOBILE AND TABLET CARDS */}

        <div className="grid gap-3 p-3 lg:hidden">
          {visible.map((complaint) => {
            const linked = requestsFor(complaint);

            return (
              <button
                key={complaint._id}
                type="button"
                onClick={() => openComplaint(complaint)}
                className="rounded-xl border border-slate-200 p-4 text-left hover:border-amber-400"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-sm">
                    {complaint.complaintId || "—"}
                  </strong>

                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold ring-1 ${badgeStyle(
                      complaint.status,
                    )}`}
                  >
                    {statusText(complaint)}
                  </span>
                </div>

                <p className="mt-1 text-sm font-medium">
                  {complaint.title || "Untitled"}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {locationLabel(complaint)} · {complaint.category}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Technician: {complaint.assignedTo?.name || "Not Assigned"}
                  {" · "}
                  Materials:{" "}
                  {linked.length ? readable(linked[0].status) : "No request"}
                </p>
              </button>
            );
          })}
        </div>

        {/* EMPTY STATE */}

        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-slate-500">
            No complaints match your filters.
          </div>
        )}

        {/* PAGINATION */}

        {filtered.length > PAGE_SIZE && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4 text-xs text-slate-500">
            <span>
              Showing {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous page"
                disabled={safePage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="rounded-lg border p-2 disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>

              <span>
                {safePage} / {pages}
              </span>

              <button
                type="button"
                aria-label="Next page"
                disabled={safePage >= pages}
                onClick={() => setPage((value) => Math.min(pages, value + 1))}
                className="rounded-lg border p-2 disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ====================================
          COMPLAINT DETAILS DRAWER
      ==================================== */}

      {selected && (
        <div
          className="fixed inset-0 z-[100]"
          role="dialog"
          aria-modal="true"
          aria-label={`Complaint ${selected.complaintId}`}
        >
          <button
            type="button"
            aria-label="Close complaint details"
            onClick={() => setSelectedId("")}
            className="absolute inset-0 w-full bg-slate-950/60"
          />

          <aside className="absolute inset-y-0 right-0 flex w-full max-w-[640px] flex-col bg-white shadow-2xl">
            {/* DRAWER HEADER */}

            <div className="shrink-0 bg-gradient-to-r from-[#071C3C] to-[#204779] p-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
                    Complaint Details
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    {selected.complaintId}
                  </h2>

                  <p className="mt-1 text-sm text-slate-200">
                    {selected.title || "Untitled complaint"}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setSelectedId("")}
                  className="rounded-lg bg-white/10 p-2 hover:bg-white/20"
                >
                  <X size={21} />
                </button>
              </div>

              {/* DRAWER TABS */}

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
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

            {/* DRAWER BODY */}

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              {/* ==========================
                  OVERVIEW
              ========================== */}

              {drawerTab === "OVERVIEW" && (
                <>
                  {/* ISSUE DETAILS */}

                  <div className="rounded-xl border border-slate-200 p-4">
                    <h3 className="flex items-center gap-2 font-bold">
                      <FileText size={17} className="text-[#B48632]" />
                      Issue Details
                    </h3>

                    <p className="mt-3 font-semibold">
                      {selected.title || "—"}
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                      {selected.description || "No description"}
                    </p>

                    {(selected.titleHindi || selected.descriptionHindi) && (
                      <p className="mt-3 whitespace-pre-wrap border-t pt-3 text-sm text-slate-600">
                        {selected.titleHindi} {selected.descriptionHindi}
                      </p>
                    )}
                  </div>

                  {/* DETAILS GRID */}

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* LOCATION */}

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <MapPin size={15} />
                        LOCATION
                      </p>

                      <p className="mt-2 text-sm font-semibold">
                        {locationLabel(selected)}
                      </p>
                    </div>

                    {/* STUDENT */}

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <UserRound size={15} />
                        STUDENT
                      </p>

                      <p className="mt-2 text-sm font-semibold">
                        {selected.createdBy?.name || "—"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {selected.createdBy?.email || ""}
                      </p>
                    </div>

                    {/* CATEGORY */}

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-bold text-slate-500">
                        CATEGORY / PRIORITY
                      </p>

                      <p className="mt-2 text-sm font-semibold">
                        {selected.category || "—"}
                        {" · "}
                        {selected.priority || "—"}
                      </p>
                    </div>

                    {/* STATUS */}

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-bold text-slate-500">
                        COMPLAINT STATUS
                      </p>

                      <p className="mt-2 text-sm font-semibold">
                        {statusText(selected)}
                      </p>
                    </div>
                  </div>

                  {/* TIMELINE */}

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="flex items-center gap-2 text-sm font-bold">
                      <CalendarDays size={17} className="text-[#B48632]" />
                      Timeline
                    </p>

                    <div className="mt-3 space-y-2 text-xs text-slate-600">
                      <div className="flex justify-between gap-3">
                        <span>Created</span>

                        <b>{formatIST(selected.createdAt)}</b>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span>Work Started</span>

                        <b>{formatIST(selected.startedAt)}</b>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span>Technician Work Done</span>

                        <b>{formatIST(selected.completedAt)}</b>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span>Deadline</span>

                        <b>{formatIST(selected.deadline)}</b>
                      </div>
                    </div>
                  </div>

                  {/* QUICK ACTIONS */}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDrawerTab("ASSIGN")}
                      className="rounded-xl bg-[#102B52] px-3 py-3 text-xs font-bold text-white"
                    >
                      Assign Technician
                    </button>

                    <button
                      type="button"
                      onClick={() => setDrawerTab("MATERIALS")}
                      className="rounded-xl bg-amber-100 px-3 py-3 text-xs font-bold text-amber-950"
                    >
                      Request / Track Material
                    </button>
                  </div>

                  {/* EMERGENCY ONLY */}

                  {isEmergency(selected) && (
                    <button
                      type="button"
                      onClick={() => navigate("/maintenance/job-cards")}
                      className="inline-flex items-center gap-2 text-sm font-bold text-blue-700"
                    >
                      <Printer size={16} />
                      Emergency Job Cards
                      <ArrowRight size={15} />
                    </button>
                  )}
                </>
              )}

              {/* ==========================
                  TECHNICIAN ASSIGNMENT
              ========================== */}

              {drawerTab === "ASSIGN" && (
                <div className="space-y-4">
                  {/* CURRENT TECHNICIAN */}

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">
                      Current Technician
                    </p>

                    <p className="mt-2 font-black">
                      {selected.assignedTo?.name ||
                        (alreadyAssigned ? "Assigned" : "Not Assigned")}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {selected.assignedTo?.department ||
                        selected.category ||
                        ""}
                    </p>
                  </div>

                  {/* ALREADY ASSIGNED */}

                  {alreadyAssigned ? (
                    <p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                      This complaint is already assigned. Track work updates
                      here. Reassignment requires the existing approved
                      workflow.
                    </p>
                  ) : eligibleForAssignment ? (
                    /* ASSIGN FORM */

                    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                      <h3 className="font-black">Assign Technician</h3>

                      <p className="mt-1 text-xs text-slate-600">
                        Only active Technicians mapped to{" "}
                        {selected.category || "this category"} are shown.
                      </p>

                      {workerError && (
                        <p className="mt-3 text-xs text-rose-700">
                          {workerError}
                        </p>
                      )}

                      <select
                        value={workerId}
                        onChange={(event) => setWorkerId(event.target.value)}
                        disabled={!!workerError}
                        className="mt-4 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm"
                      >
                        <option value="">Select Technician</option>

                        {eligibleTechnicians.map((worker) => (
                          <option key={worker._id} value={worker._id}>
                            {worker.name} ·{" "}
                            {worker.department || worker.category}
                            {worker.shift ? ` · ${worker.shift}` : ""}
                          </option>
                        ))}
                      </select>

                      {!workerError && eligibleTechnicians.length === 0 && (
                        <p className="mt-2 text-xs text-rose-700">
                          No active category-matched Technician found.
                        </p>
                      )}

                      <button
                        type="button"
                        disabled={!workerId || assigning || !!workerError}
                        onClick={assignOne}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#102B52] py-3 text-sm font-bold text-white disabled:opacity-50"
                      >
                        <UserCheck size={17} />

                        {assigning ? "Assigning..." : "Confirm Assignment"}
                      </button>
                    </div>
                  ) : (
                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                      Assignment is available for unassigned Pending or Reopened
                      complaints.
                    </p>
                  )}

                  <p className="text-xs text-slate-500">
                    Manager assigns the job. The Technician submits work
                    completion; the Student gives final YES/NO confirmation.
                  </p>
                </div>
              )}

              {/* ==========================
                  MATERIAL REQUESTS
              ========================== */}

              {drawerTab === "MATERIALS" && (
                <div className="space-y-4">
                  {requestError && (
                    <p
                      role="alert"
                      className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
                    >
                      {requestError}
                    </p>
                  )}

                  {/* EXISTING REQUESTS */}

                  {selectedRequests.length > 0
                    ? selectedRequests.map((request) => (
                        <div
                          key={request._id || request.requestId}
                          className="overflow-hidden rounded-xl border border-slate-200"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-4">
                            <div>
                              <p className="font-black">
                                {request.requestId || "Material Request"}
                              </p>

                              <p className="text-xs text-slate-500">
                                Sent {formatIST(request.createdAt)}
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${badgeStyle(
                                request.status,
                              )}`}
                            >
                              {readable(request.status)}
                            </span>
                          </div>

                          <div className="space-y-3 p-4">
                            {(request.materials || []).map(
                              (material, index) => {
                                const requested = numberOrNull(
                                  material.quantity,
                                );

                                const issued = numberOrNull(
                                  material.issuedQuantity,
                                );

                                const received = numberOrNull(
                                  material.receivedQuantity,
                                );

                                const pendingIssue =
                                  requested !== null && issued !== null
                                    ? Math.max(0, requested - issued)
                                    : null;

                                return (
                                  <div
                                    key={material._id || index}
                                    className="rounded-lg border border-slate-100 p-3"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-sm font-bold">
                                        {material.itemName}
                                      </p>

                                      <span className="text-[11px] text-slate-500">
                                        {readable(material.status)}
                                      </span>
                                    </div>

                                    {/* QUANTITIES */}

                                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                      {[
                                        ["Requested", requested],
                                        ["Store Issued", issued],
                                        ["Tech Received", received],
                                        ["Pending Issue", pendingIssue],
                                      ].map(([label, quantity]) => (
                                        <div
                                          key={label}
                                          className="rounded-lg bg-slate-50 p-2"
                                        >
                                          <p className="text-[10px] text-slate-500">
                                            {label}
                                          </p>

                                          <p className="mt-1 text-sm font-black">
                                            {displayQuantity(quantity)}
                                          </p>
                                        </div>
                                      ))}
                                    </div>

                                    {/* RECEIPT STATUS */}

                                    {issued !== null && received === null && (
                                      <p className="mt-2 text-xs text-amber-700">
                                        Technician receipt confirmation not yet
                                        available.
                                      </p>
                                    )}

                                    {issued !== null &&
                                      received !== null &&
                                      issued > received && (
                                        <p className="mt-2 text-xs text-amber-700">
                                          {issued - received} item(s) issued but
                                          not yet confirmed as received. Check
                                          reconciliation status.
                                        </p>
                                      )}
                                  </div>
                                );
                              },
                            )}

                            {request.reason && (
                              <p className="text-xs text-slate-600">
                                <b>Reason:</b> {request.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    : !requestError && (
                        <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                          No material request created for this complaint yet.
                        </p>
                      )}

                  {/* NEW REQUEST FORM */}

                  {canCreateRequest ? (
                    <form
                      onSubmit={createMaterialRequest}
                      className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/40 p-4"
                    >
                      <div>
                        <h3 className="flex items-center gap-2 font-black">
                          <Package size={18} />
                          Request Materials
                        </h3>

                        <p className="mt-1 text-xs text-slate-600">
                          You can request materials before assigning a
                          Technician. Store Manager will receive this
                          complaint-linked request.
                        </p>
                      </div>

                      {/* MATERIAL ITEMS */}

                      {materials.map((material, index) => (
                        <div
                          key={index}
                          className="space-y-2 rounded-lg border border-slate-200 bg-white p-3"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold">
                              Item {index + 1}
                            </p>

                            {materials.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setMaterials((current) =>
                                    current.filter((_, i) => i !== index),
                                  )
                                }
                                aria-label="Remove material"
                                className="rounded-lg p-1 text-rose-700 hover:bg-rose-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>

                          <input
                            required
                            value={material.itemName}
                            onChange={(event) =>
                              updateMaterial(
                                index,
                                "itemName",
                                event.target.value,
                              )
                            }
                            placeholder="Material name (e.g. Tube Light)"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              required
                              min="0.01"
                              step="0.01"
                              value={material.quantity}
                              onChange={(event) =>
                                updateMaterial(
                                  index,
                                  "quantity",
                                  event.target.value,
                                )
                              }
                              placeholder="Quantity"
                              className="min-w-0 rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                            />

                            <select
                              value={material.unit}
                              onChange={(event) =>
                                updateMaterial(
                                  index,
                                  "unit",
                                  event.target.value,
                                )
                              }
                              className="min-w-0 rounded-lg border border-slate-200 px-2 py-2.5 text-sm"
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
                          setMaterials((current) => [
                            ...current,
                            INITIAL_MATERIAL(),
                          ])
                        }
                        className="inline-flex items-center gap-2 text-xs font-bold text-blue-700"
                      >
                        <Plus size={16} />
                        Add another material
                      </button>

                      <textarea
                        rows={3}
                        required
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Why are these materials needed?"
                        className="w-full resize-y rounded-lg border border-slate-200 p-3 text-sm"
                      />

                      <button
                        type="submit"
                        disabled={sendingRequest}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#102B52] py-3 text-sm font-bold text-white disabled:opacity-50"
                      >
                        <Send size={16} />

                        {sendingRequest
                          ? "Sending Request..."
                          : "Send Request to Store"}
                      </button>
                    </form>
                  ) : (
                    !requestError &&
                    selectedRequests.length > 0 && (
                      <p className="text-xs text-slate-500">
                        A request already exists for this complaint. Existing
                        backend rules allow one request per complaint; follow-up
                        requests require a backend change.
                      </p>
                    )
                  )}
                </div>
              )}

              {/* ==========================
                  STUDENT CONFIRMATION
              ========================== */}

              {drawerTab === "STUDENT" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="flex items-center gap-2 font-bold">
                      <CheckCircle2 size={18} className="text-[#B48632]" />
                      Student Confirmation
                    </p>

                    <p className="mt-2 text-sm">
                      {selected.studentVerified === true
                        ? "Student has confirmed that the complaint is resolved."
                        : [
                              "COMPLETED",
                              "AWAITING_STUDENT_CONFIRMATION",
                            ].includes(upper(selected.status))
                          ? "Technician marked work done. Awaiting Student YES/NO confirmation."
                          : upper(selected.status) === "REOPENED"
                            ? "Student reported that the issue is not resolved."
                            : `Current status: ${statusText(selected)}`}
                    </p>
                  </div>

                  {/* REOPEN REASON */}

                  {upper(selected.status) === "REOPENED" && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                      <p className="flex items-center gap-2 font-bold text-rose-800">
                        <RotateCcw size={17} />
                        Reopened — Student Reason
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm text-rose-900">
                        {studentReason(selected) ||
                          "Reason not included in the current API response."}
                      </p>
                    </div>
                  )}

                  {/* POLICY */}

                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-bold">Final closure policy</p>

                    <p className="mt-2">
                      Only the Student can confirm YES to resolve the complaint.
                      If NO, a reason is mandatory and the complaint is reopened
                      for rework. Maintenance Manager and Warden do not provide
                      final verification remarks.
                    </p>
                  </div>

                  {/* EMERGENCY CARD */}

                  {isEmergency(selected) && (
                    <button
                      type="button"
                      onClick={() => navigate("/maintenance/job-cards")}
                      className="inline-flex items-center gap-2 text-sm font-bold text-blue-700"
                    >
                      <Printer size={16} />
                      Emergency Job Card
                      <ArrowRight size={15} />
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
