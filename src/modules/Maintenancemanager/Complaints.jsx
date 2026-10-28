import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Layers3,
  Loader2,
  MapPin,
  Package,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  Wrench,
  X,
} from "lucide-react";
import api from "../../services/api";

// =====================================================
// AMI MAINTENANCE — UNIFIED COMPLAINT OPERATIONS
// =====================================================

const PAGE_SIZE = 12;
const CLOSED = ["RESOLVED", "CLOSED"];

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
  ["MATERIAL", "Materials"],
  ["AWAITING", "Awaiting Student"],
  ["REOPENED", "Reopened"],
  ["OVERDUE", "Overdue"],
  ["RESOLVED", "Resolved"],
];

const INPUT =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-[#102B52] outline-none transition focus:border-[#D6AD59] focus:ring-2 focus:ring-amber-100 disabled:opacity-50";

const PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#102B52] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#204779] disabled:cursor-not-allowed disabled:opacity-50";

const SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-[#102B52] transition hover:bg-slate-50 disabled:opacity-50";

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

const newMaterial = () => ({
  itemName: "",
  quantity: "",
  unit: "PIECE",
});

function dateIST(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function locationOf(complaint) {
  return (
    complaint.hostel || complaint.block || complaint.complaintArea || "Other"
  );
}

function locationDetails(complaint) {
  return [
    locationOf(complaint),
    complaint.issueLocation,
    complaint.floor ? `Floor ${complaint.floor}` : "",
    complaint.roomNumber ? `Room ${complaint.roomNumber}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function isAssigned(complaint) {
  return Boolean(complaint.assignedTo || complaint.workerAssigned);
}
function isOverdue(complaint, now) {
  if (
    now === null ||
    !complaint.deadline ||
    ["RESOLVED", "CLOSED"].includes(
      String(complaint.status || "").toUpperCase(),
    )
  ) {
    return false;
  }

  const deadline = new Date(complaint.deadline).getTime();

  return Number.isFinite(deadline) && deadline < now;
}

function isAwaitingStudent(complaint) {
  return (
    ["COMPLETED", "AWAITING_STUDENT_CONFIRMATION"].includes(
      upper(complaint.status),
    ) && complaint.studentVerified !== true
  );
}

function isReopened(complaint) {
  return upper(complaint.status) === "REOPENED";
}

function getReopenReason(record, complaint) {
  return (
    record?.reopenReason ||
    complaint?.studentConfirmation?.reason ||
    complaint?.studentFeedback?.reason ||
    complaint?.studentReopenReason ||
    complaint?.reopenReason ||
    complaint?.reopenNote ||
    ""
  );
}

function getRequestsForComplaint(requests, complaint) {
  const complaintId = idOf(complaint._id);
  const publicId = String(complaint.complaintId || "");

  return requests.filter((request) => {
    const ids = [
      idOf(request.complaint),
      request.complaint?.complaintId,
      idOf(request.complaintId),
    ].filter(Boolean);

    return ids.some((value) => value === complaintId || value === publicId);
  });
}

function technicianMatches(worker, category) {
  const role = upper(worker.role);

  return (
    (!role || role === "TECHNICIAN" || role === "WORKER") &&
    worker.isActive !== false &&
    worker.isDeleted !== true &&
    worker.canScheduleAssignment !== false &&
    !["INACTIVE", "DELETED", "ON_LEAVE"].includes(upper(worker.status)) &&
    upper(worker.department || worker.category) === upper(category)
  );
}

function StatusBadge({ status, children }) {
  const value = upper(status);

  let color = "bg-amber-50 text-amber-800 ring-amber-200";

  if (["RESOLVED", "CLOSED", "ISSUED"].includes(value)) {
    color = "bg-emerald-50 text-emerald-700 ring-emerald-200";
  } else if (["REOPENED", "REJECTED", "EMERGENCY"].includes(value)) {
    color = "bg-rose-50 text-rose-700 ring-rose-200";
  } else if (["ASSIGNED", "IN_PROGRESS", "REASSIGNED"].includes(value)) {
    color = "bg-blue-50 text-blue-700 ring-blue-200";
  } else if (["COMPLETED", "AWAITING_STUDENT_CONFIRMATION"].includes(value)) {
    color = "bg-indigo-50 text-indigo-700 ring-indigo-200";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-extrabold ring-1 ring-inset ${color}`}
    >
      {children || readable(status)}
    </span>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <ClipboardList size={28} />
      </div>

      <p className="mt-4 text-sm font-bold text-[#102B52]">{message}</p>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <p className="text-[10px] font-semibold uppercase text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-xs font-bold text-[#102B52]">
        {value || "—"}
      </p>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function Complaints() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reopens, setReopens] = useState([]);
  const [overdueRecords, setOverdueRecords] = useState([]);
  const [jobCards, setJobCards] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [available, setAvailable] = useState({
    complaints: false,
    workers: false,
    requests: false,
    reopens: false,
    overdueRecords: false,
    jobCards: false,
  });

  const [tab, setTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

  const [groupMode, setGroupMode] = useState(false);
  const [groupSelections, setGroupSelections] = useState({});
  const [groupWorkers, setGroupWorkers] = useState({});
  const [bulkBusy, setBulkBusy] = useState("");

  const [selectedId, setSelectedId] = useState("");
  const [drawerTab, setDrawerTab] = useState("DETAILS");

  const [workerId, setWorkerId] = useState("");
  const [reassignWorkerId, setReassignWorkerId] = useState("");

  const [working, setWorking] = useState(false);

  const [materials, setMaterials] = useState([newMaterial()]);
  const [reason, setReason] = useState("");

  const [now, setNow] = useState(null);

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchAll = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    const endpoints = {
      complaints: "/maintenance/worker/complaints",
      workers: "/maintenance/worker/workers",
      requests: "/maintenance/material-requests",
      reopens: "/maintenance/reopen-complaints",
      overdueRecords: "/maintenance/overdue-complaints",
      jobCards: "/maintenance/job-cards",
    };

    const setters = {
      complaints: setComplaints,
      workers: setWorkers,
      requests: setRequests,
      reopens: setReopens,
      overdueRecords: setOverdueRecords,
      jobCards: setJobCards,
    };

    try {
      const entries = Object.entries(endpoints);

      const results = await Promise.allSettled(
        entries.map(([, endpoint]) => api.get(endpoint)),
      );

      const nextAvailability = {};

      results.forEach((result, index) => {
        const key = entries[index][0];

        if (result.status === "rejected") {
          nextAvailability[key] = false;
          console.error(`AMI MAINTENANCE ${key} API ERROR:`, result.reason);
          return;
        }

        const body = result.value?.data || {};

        const items = {
          complaints: body.complaints,
          workers: body.workers,
          requests: body.requests || body.materialRequests,
          reopens: body.reopenComplaints,
          overdueRecords: body.complaints,
          jobCards: body.jobCards,
        }[key];

        if (!Array.isArray(items)) {
          nextAvailability[key] = false;
          return;
        }

        nextAvailability[key] = true;
        setters[key](items);
      });

      setAvailable(nextAvailability);
      setNow(Date.now());

      if (silent) {
        if (nextAvailability.complaints) {
          toast.success("Complaints refreshed", {
            duration: 1000,
          });
        } else {
          toast.error("Unable to refresh complaints");
        }
      }
    } catch (error) {
      console.error("COMPLAINT FETCH ERROR:", error);
      toast.error("Unable to load complaint data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();

    const updateTime = () => {
      setNow(Date.now());
    };

    updateTime();

    const timer = window.setInterval(updateTime, 30000);

    return () => window.clearInterval(timer);
  }, [fetchAll]);

  useEffect(() => {
    if (!selectedId) return undefined;

    const onEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedId("");
      }
    };

    window.addEventListener("keydown", onEscape);

    return () => window.removeEventListener("keydown", onEscape);
  }, [selectedId]);

  // =====================================================
  // REOPEN LOOKUP
  // =====================================================

  const reopenMap = useMemo(() => {
    const map = new Map();

    const sorted = [...reopens].sort(
      (a, b) =>
        new Date(b.reopenedAt || b.createdAt || 0) -
        new Date(a.reopenedAt || a.createdAt || 0),
    );

    sorted.forEach((record) => {
      const key = idOf(record.complaint);

      if (key && !map.has(key)) {
        map.set(key, record);
      }
    });

    return map;
  }, [reopens]);

  const selected = useMemo(
    () =>
      complaints.find((complaint) => idOf(complaint._id) === selectedId) ||
      null,
    [complaints, selectedId],
  );

  const selectedReopen = selected
    ? reopenMap.get(idOf(selected._id)) || null
    : null;

  const selectedRequests = selected
    ? getRequestsForComplaint(requests, selected)
    : [];

  const selectedOverdue = selected
    ? overdueRecords.find(
        (record) =>
          idOf(record._id) === idOf(selected._id) ||
          record.complaintId === selected.complaintId,
      )
    : null;

  const matchingWorkers = selected
    ? workers.filter((worker) => technicianMatches(worker, selected.category))
    : [];

  const cardFor = (complaint) =>
    jobCards.find((job) => {
      if (idOf(job.complaint) === idOf(complaint._id)) {
        return true;
      }

      return (job.complaints || []).some(
        (item) => idOf(item.complaint) === idOf(complaint._id),
      );
    });

  // =====================================================
  // COUNTS
  // =====================================================

  const stats = useMemo(() => {
    const count = (predicate) => complaints.filter(predicate).length;

    return {
      ALL: complaints.length,

      PENDING: count(
        (complaint) =>
          upper(complaint.status) === "PENDING" && !isAssigned(complaint),
      ),

      ASSIGNED: count(
        (complaint) =>
          isAssigned(complaint) && !CLOSED.includes(upper(complaint.status)),
      ),

      IN_PROGRESS: count(
        (complaint) => upper(complaint.status) === "IN_PROGRESS",
      ),

      MATERIAL: count(
        (complaint) =>
          complaint.materialRequired ||
          getRequestsForComplaint(requests, complaint).length > 0,
      ),

      AWAITING: count(isAwaitingStudent),

      REOPENED: count(isReopened),

      OVERDUE: count((complaint) => isOverdue(complaint, now)),

      RESOLVED: count((complaint) => CLOSED.includes(upper(complaint.status))),
    };
  }, [complaints, requests, now]);

  const locations = useMemo(
    () => [...new Set(complaints.map(locationOf))].filter(Boolean).sort(),
    [complaints],
  );

  const categories = useMemo(
    () =>
      [
        ...new Set(
          complaints.map((complaint) => complaint.category).filter(Boolean),
        ),
      ].sort(),
    [complaints],
  );

  // =====================================================
  // FILTER COMPLAINTS
  // =====================================================

  const filtered = useMemo(() => {
    const query = lower(search);

    return complaints
      .filter((complaint) => {
        const status = upper(complaint.status);

        const matchesTab =
          tab === "ALL" ||
          (tab === "PENDING" &&
            status === "PENDING" &&
            !isAssigned(complaint)) ||
          (tab === "ASSIGNED" &&
            isAssigned(complaint) &&
            !CLOSED.includes(status)) ||
          (tab === "IN_PROGRESS" && status === "IN_PROGRESS") ||
          (tab === "MATERIAL" &&
            (complaint.materialRequired ||
              getRequestsForComplaint(requests, complaint).length > 0)) ||
          (tab === "AWAITING" && isAwaitingStudent(complaint)) ||
          (tab === "REOPENED" && isReopened(complaint)) ||
          (tab === "OVERDUE" && isOverdue(complaint, now)) ||
          (tab === "RESOLVED" && CLOSED.includes(status));

        const searchable = [
          complaint.complaintId,
          complaint.title,
          complaint.description,
          complaint.category,
          locationOf(complaint),
          complaint.roomNumber,
          complaint.createdBy?.name,
          complaint.assignedTo?.name,
        ]
          .map(lower)
          .join(" ");

        return (
          matchesTab &&
          (!query || searchable.includes(query)) &&
          (!locationFilter || locationOf(complaint) === locationFilter) &&
          (!categoryFilter || complaint.category === categoryFilter)
        );
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [complaints, requests, tab, search, locationFilter, categoryFilter, now]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const safePage = Math.min(page, totalPages);

  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // =====================================================
  // SMART LOCATION + CATEGORY GROUPING
  // NO FRONTEND 10-COMPLAINT LIMIT
  // =====================================================

  const groups = useMemo(() => {
    const map = new Map();

    complaints
      .filter(
        (complaint) =>
          upper(complaint.status) === "PENDING" &&
          !isAssigned(complaint) &&
          (!locationFilter || locationOf(complaint) === locationFilter) &&
          (!categoryFilter || complaint.category === categoryFilter),
      )
      .forEach((complaint) => {
        const location = locationOf(complaint);
        const category = complaint.category || "Uncategorized";

        const key = `${lower(location)}::${lower(category)}`;

        if (!map.has(key)) {
          map.set(key, {
            key,
            location,
            category,
            complaints: [],
          });
        }

        map.get(key).complaints.push(complaint);
      });

    return [...map.values()].sort(
      (a, b) => b.complaints.length - a.complaints.length,
    );
  }, [complaints, locationFilter, categoryFilter]);

  function selectedGroupIds(group) {
    if (groupSelections[group.key] === undefined) {
      return group.complaints.map((complaint) => idOf(complaint._id));
    }

    const validIds = new Set(
      group.complaints.map((complaint) => idOf(complaint._id)),
    );

    return groupSelections[group.key].filter((id) => validIds.has(id));
  }

  function toggleGroupComplaint(group, complaintId) {
    const current = selectedGroupIds(group);

    const next = current.includes(complaintId)
      ? current.filter((id) => id !== complaintId)
      : [...current, complaintId];

    setGroupSelections((previous) => ({
      ...previous,
      [group.key]: next,
    }));
  }

  function toggleGroupAll(group) {
    const current = selectedGroupIds(group);

    const allIds = group.complaints.map((complaint) => idOf(complaint._id));

    setGroupSelections((previous) => ({
      ...previous,
      [group.key]: current.length === allIds.length ? [] : allIds,
    }));
  }

  // =====================================================
  // ASSIGN SINGLE TECHNICIAN
  // =====================================================

  async function assignSingle() {
    if (!selected || !workerId || working) return;

    if (!available.workers) {
      toast.error("Technician data unavailable");
      return;
    }

    const technician = matchingWorkers.find(
      (worker) => idOf(worker._id) === workerId,
    );

    if (!technician) {
      toast.error("Select a matching Technician");
      return;
    }

    setWorking(true);

    try {
      await api.put("/maintenance/worker/assign-worker", {
        complaintId: selected._id,
        workerId,
      });

      toast.success("Technician assigned successfully", {
        duration: 1200,
      });

      setWorkerId("");
      await fetchAll();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Technician assignment failed",
      );
    } finally {
      setWorking(false);
    }
  }

  // =====================================================
  // BULK ASSIGNMENT
  // =====================================================

  async function assignGroup(group) {
    const selectedWorker = groupWorkers[group.key];
    const complaintIds = selectedGroupIds(group);

    if (!selectedWorker || complaintIds.length === 0 || bulkBusy) {
      return;
    }

    const technician = workers.find(
      (worker) =>
        idOf(worker._id) === selectedWorker &&
        technicianMatches(worker, group.category),
    );

    if (!technician) {
      toast.error("Select a matching Technician");
      return;
    }

    setBulkBusy(group.key);

    let completed = 0;
    const failed = [];

    try {
      // Existing API supports single assignment.
      // Requests are sequential to avoid flooding the backend.

      for (const complaintId of complaintIds) {
        try {
          await api.put("/maintenance/worker/assign-worker", {
            complaintId,
            workerId: selectedWorker,
          });

          completed += 1;
        } catch (error) {
          failed.push({
            complaintId,
            message: error?.response?.data?.message || "Assignment failed",
          });
        }
      }

      if (completed > 0) {
        toast.success(`${completed} complaints assigned successfully`, {
          duration: 1600,
        });
      }

      if (failed.length > 0) {
        toast.error(
          `${failed.length} assignments failed: ${failed[0].message}`,
          { duration: 3000 },
        );
      }

      // Refresh live data. Successful complaints
      // will no longer be eligible for bulk assignment.
      await fetchAll();

      setGroupSelections((previous) => {
        const next = { ...previous };
        delete next[group.key];
        return next;
      });
    } finally {
      setBulkBusy("");
    }
  }

  // =====================================================
  // MATERIAL YES / NO
  // =====================================================

  async function saveMaterialDecision(decision) {
    if (!selected || working) return;

    if (decision === "NOT_REQUIRED" && selectedRequests.length > 0) {
      toast.error("Material request already exists");
      return;
    }

    setWorking(true);

    try {
      await api.put(
        `/maintenance/assign-worker/material-decision/${selected._id}`,
        { decision },
      );

      toast.success(
        decision === "REQUIRED" ? "Material required" : "No material required",
        { duration: 1200 },
      );

      await fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Material decision failed");
    } finally {
      setWorking(false);
    }
  }

  function updateMaterial(index, field, value) {
    setMaterials((previous) =>
      previous.map((material, i) =>
        i === index ? { ...material, [field]: value } : material,
      ),
    );
  }

  // =====================================================
  // MATERIAL REQUEST TO STORE MANAGER
  // =====================================================

  async function createMaterialRequest(event) {
    event.preventDefault();

    if (!selected || working || !available.requests) {
      return;
    }

    if (selectedRequests.length > 0) {
      toast.error("Existing request found for this complaint");
      return;
    }

    if (!reason.trim()) {
      toast.error("Material reason is required");
      return;
    }

    const invalid = materials.some(
      (material) =>
        !material.itemName.trim() ||
        !Number.isFinite(Number(material.quantity)) ||
        Number(material.quantity) <= 0,
    );

    if (invalid) {
      toast.error("Enter valid material details");
      return;
    }

    setWorking(true);

    try {
      await api.post("/maintenance/material-requests/create", {
        complaintId: selected._id,
        materials: materials.map((material) => ({
          itemName: material.itemName.trim(),
          quantity: Number(material.quantity),
          unit: material.unit,
        })),
        reason: reason.trim(),
      });

      toast.success("Request sent to Store Manager", {
        duration: 1300,
      });

      setReason("");
      setMaterials([newMaterial()]);

      await fetchAll();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create material request",
      );
    } finally {
      setWorking(false);
    }
  }

  // =====================================================
  // MANUAL JOB CARD GENERATION
  // =====================================================

  async function createJobCard() {
    if (!selected || working) return;

    if (!isAssigned(selected)) {
      toast.error("Assign Technician first");
      return;
    }

    if (!available.jobCards) {
      toast.error("Job Card service unavailable");
      return;
    }

    if (cardFor(selected)) {
      navigate("/maintenance/job-cards");
      return;
    }

    setWorking(true);

    try {
      await api.post("/maintenance/job-cards/create", {
        complaintIds: [selected._id],
      });

      toast.success("Job Card generated", {
        duration: 1300,
      });

      await fetchAll();
      navigate("/maintenance/job-cards");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to generate Job Card",
      );
    } finally {
      setWorking(false);
    }
  }

  // =====================================================
  // REOPEN REASSIGNMENT
  // =====================================================

  async function reassignReopened() {
    if (!selected || !selectedReopen || !reassignWorkerId || working) {
      return;
    }

    const technician = matchingWorkers.find(
      (worker) => idOf(worker._id) === reassignWorkerId,
    );

    if (!technician) {
      toast.error("Choose matching Technician");
      return;
    }

    setWorking(true);

    try {
      await api.put(
        `/maintenance/reopen-complaints/reassign/${selectedReopen._id}`,
        {
          workerId: reassignWorkerId,
        },
      );

      toast.success("Complaint reassigned for rework", { duration: 1300 });

      setReassignWorkerId("");
      await fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reassignment failed");
    } finally {
      setWorking(false);
    }
  }

  // =====================================================
  // OVERDUE ESCALATION
  // =====================================================

  async function escalateComplaint() {
    if (!selectedOverdue || !selected || working) {
      return;
    }

    setWorking(true);

    try {
      await api.put(
        `/maintenance/overdue-complaints/escalate/${selectedOverdue._id}`,
        {},
      );

      toast.success("Complaint escalated", {
        duration: 1300,
      });

      await fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Escalation failed");
    } finally {
      setWorking(false);
    }
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  function openComplaint(complaint, section = "DETAILS") {
    setSelectedId(idOf(complaint._id));
    setDrawerTab(section);
    setWorkerId("");
    setReassignWorkerId("");
    setMaterials([newMaterial()]);
    setReason("");
  }

  function changeTab(value) {
    setTab(value);
    setPage(1);
    setGroupMode(false);
  }

  // =====================================================
  // INITIAL LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center gap-3 text-[#102B52]">
        <Loader2 size={27} className="animate-spin" />
        <p className="text-sm font-semibold">Loading Complaint Operations...</p>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-w-0 space-y-6 pb-8 text-[#102B52]">
      {/* PREMIUM HEADER */}

      <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#081B35] via-[#102E55] to-[#204779] p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-52 w-52 rounded-full border-[35px] border-white/[0.04]" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D6AD59]/30 bg-[#D6AD59]/10 px-3 py-1.5">
              <Wrench size={13} className="text-[#E8C477]" />

              <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#E8C477]">
                AMI MAINTENANCE · OPERATIONS CENTER
              </p>
            </div>

            <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
              Complaint Management
            </h1>

            <p className="mt-3 max-w-2xl text-[13px] leading-6 text-slate-300">
              Manage Technician assignments, material requests, optional Job
              Cards, reopened cases, overdue complaints and student confirmation
              from one centralized workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchAll(true)}
            disabled={refreshing || Boolean(bulkBusy)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-white transition hover:bg-white/20 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>

      {/* COMPLAINT API ERROR ONLY */}

      {!available.complaints && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-4"
        >
          <p className="text-sm font-bold text-rose-700">
            Unable to load complaints.
          </p>

          <button
            type="button"
            onClick={() => fetchAll(true)}
            className="mt-2 text-xs font-bold text-rose-700 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* STATISTICS */}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {[
          ["Total", stats.ALL, "ALL", ClipboardList],
          ["Pending", stats.PENDING, "PENDING", Clock3],
          ["In Progress", stats.IN_PROGRESS, "IN_PROGRESS", Wrench],
          ["Materials", stats.MATERIAL, "MATERIAL", Package],
          ["Awaiting Student", stats.AWAITING, "AWAITING", UserCheck],
        ].map(([label, value, filter, Icon]) => (
          <button
            key={filter}
            type="button"
            onClick={() => changeTab(filter)}
            className={`group rounded-[22px] border bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
              tab === filter
                ? "border-[#D6AD59] ring-2 ring-amber-100"
                : "border-slate-200"
            }`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-[#B88A36]">
              <Icon size={21} />
            </div>

            <p className="mt-4 text-[29px] font-black">{value}</p>

            <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
          </button>
        ))}
      </div>

      {/* COMPLAINT WORKSPACE */}

      <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="space-y-5 border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">All Maintenance Complaints</h2>

              <p className="mt-1 text-xs text-slate-500">
                Complaint-based management without mandatory Job Cards
              </p>
            </div>

            <button
              type="button"
              onClick={() => setGroupMode((value) => !value)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold ${
                groupMode
                  ? "bg-[#102B52] text-white"
                  : "bg-amber-50 text-amber-900"
              }`}
            >
              <Layers3 size={16} />
              {groupMode ? "View Complaints" : "Smart Bulk Assignment"}
            </button>
          </div>

          {/* TABS */}

          <div className="flex gap-2 overflow-x-auto pb-2">
            {TABS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => changeTab(key)}
                className={`shrink-0 rounded-xl px-3.5 py-2.5 text-[11px] font-extrabold transition ${
                  tab === key
                    ? "bg-[#102B52] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}

                <span className="ml-1">{stats[key]}</span>
              </button>
            ))}
          </div>

          {/* SEARCH AND FILTERS */}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                className={`${INPUT} pl-10`}
                value={search}
                placeholder="Search ID, issue, student..."
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <select
              className={INPUT}
              value={locationFilter}
              onChange={(event) => {
                setLocationFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All Locations</option>

              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <select
              className={INPUT}
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All Categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SMART BULK ASSIGNMENT */}

        {groupMode ? (
          <div className="space-y-4 bg-[#F8FAFD] p-4 sm:p-6">
            {groups.length === 0 && (
              <EmptyState message="No pending complaint groups found" />
            )}

            {groups.map((group) => {
              const chosen = selectedGroupIds(group);

              const technicians = workers.filter((worker) =>
                technicianMatches(worker, group.category),
              );

              return (
                <div
                  key={group.key}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-black">
                        <MapPin size={17} className="text-[#B88A36]" />
                        {group.location}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {group.category} · {group.complaints.length} Pending
                      </p>
                    </div>

                    <StatusBadge status="PENDING">
                      {chosen.length} Selected
                    </StatusBadge>
                  </div>

                  <div className="space-y-4 p-4">
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={chosen.length === group.complaints.length}
                        onChange={() => toggleGroupAll(group)}
                      />
                      Select All Complaints
                    </label>

                    <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-slate-100 p-3">
                      {group.complaints.map((complaint) => (
                        <label
                          key={complaint._id}
                          className="flex cursor-pointer items-start gap-3 rounded-lg p-2 text-xs hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={chosen.includes(idOf(complaint._id))}
                            onChange={() =>
                              toggleGroupComplaint(group, idOf(complaint._id))
                            }
                          />

                          <span>
                            <b>{complaint.complaintId}</b>

                            <span className="ml-2 text-slate-500">
                              {complaint.title}
                            </span>

                            <span className="mt-1 block text-slate-400">
                              {locationDetails(complaint)}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <select
                        className={`${INPUT} flex-1`}
                        value={groupWorkers[group.key] || ""}
                        disabled={!available.workers || Boolean(bulkBusy)}
                        onChange={(event) =>
                          setGroupWorkers((previous) => ({
                            ...previous,
                            [group.key]: event.target.value,
                          }))
                        }
                      >
                        <option value="">Select Matching Technician</option>

                        {technicians.map((worker) => (
                          <option key={worker._id} value={worker._id}>
                            {worker.name} ·{" "}
                            {worker.department || worker.category}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        className={PRIMARY}
                        disabled={
                          !groupWorkers[group.key] ||
                          !chosen.length ||
                          Boolean(bulkBusy) ||
                          !available.workers
                        }
                        onClick={() => assignGroup(group)}
                      >
                        {bulkBusy === group.key ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Users size={16} />
                        )}
                        Assign {chosen.length}
                      </button>
                    </div>

                    {technicians.length === 0 && (
                      <p className="text-xs text-slate-500">
                        No matching Technician available.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px] text-left text-xs">
                <thead className="bg-[#F8FAFD] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="p-4">Complaint</th>
                    <th className="p-4">Location / Category</th>
                    <th className="p-4">Technician</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Materials</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {visible.map((complaint) => {
                    const linkedRequests = getRequestsForComplaint(
                      requests,
                      complaint,
                    );

                    return (
                      <tr key={complaint._id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <p className="font-black">{complaint.complaintId}</p>

                          <p className="mt-1 text-slate-500">
                            {complaint.title}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {dateIST(complaint.createdAt)}
                          </p>
                        </td>

                        <td className="p-4">
                          <p>{locationDetails(complaint)}</p>

                          <p className="mt-1 font-bold">{complaint.category}</p>
                        </td>

                        <td className="p-4">
                          {complaint.assignedTo?.name ||
                            (isAssigned(complaint)
                              ? "Assigned"
                              : "Not Assigned")}
                        </td>

                        <td className="p-4">
                          <StatusBadge status={complaint.status} />
                        </td>

                        <td className="p-4">
                          {linkedRequests.length > 0
                            ? readable(linkedRequests[0].status)
                            : complaint.materialRequired
                              ? "Required"
                              : "No Request"}
                        </td>

                        <td className="p-4">
                          <button
                            type="button"
                            className={PRIMARY}
                            onClick={() =>
                              openComplaint(
                                complaint,
                                tab === "REOPENED" ? "FOLLOWUP" : "DETAILS",
                              )
                            }
                          >
                            Open
                            <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}

            <div className="space-y-3 p-3 lg:hidden">
              {visible.map((complaint) => (
                <button
                  key={complaint._id}
                  type="button"
                  onClick={() =>
                    openComplaint(
                      complaint,
                      tab === "REOPENED" ? "FOLLOWUP" : "DETAILS",
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <b className="text-sm">{complaint.complaintId}</b>

                    <StatusBadge status={complaint.status} />
                  </div>

                  <p className="mt-3 text-sm font-semibold">
                    {complaint.title}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {locationDetails(complaint)}
                  </p>

                  <p className="mt-2 text-xs">{complaint.category}</p>

                  <p className="mt-3 text-xs font-bold text-[#B88A36]">
                    View Details →
                  </p>
                </button>
              ))}
            </div>

            {filtered.length === 0 && (
              <EmptyState message="No matching complaints found" />
            )}

            {/* PAGINATION */}

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 p-4">
                <p className="text-xs text-slate-500">
                  Page {safePage} of {totalPages}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={safePage === 1}
                    className={SECONDARY}
                    onClick={() => setPage(safePage - 1)}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <button
                    type="button"
                    disabled={safePage === totalPages}
                    className={SECONDARY}
                    onClick={() => setPage(safePage + 1)}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* COMPLAINT DETAILS DRAWER */}

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
            className="absolute inset-0 h-full w-full bg-slate-950/65"
          />

          <aside className="absolute inset-y-0 right-0 flex w-full max-w-[680px] flex-col bg-[#F8FAFD] shadow-2xl">
            {/* DRAWER HEADER */}

            <div className="shrink-0 bg-gradient-to-br from-[#081B35] to-[#204779] p-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#E8C477]">
                    AMI MAINTENANCE
                  </p>

                  <h2 className="mt-2 text-xl font-black">
                    {selected.complaintId}
                  </h2>

                  <p className="mt-2 text-sm text-slate-300">
                    {selected.title}
                  </p>

                  <div className="mt-3">
                    <StatusBadge status={selected.status} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedId("")}
                  aria-label="Close"
                  className="rounded-xl bg-white/10 p-2.5 hover:bg-white/20"
                >
                  <X size={20} />
                </button>
              </div>

              {/* DRAWER TABS */}

              <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                {[
                  ["DETAILS", "Details"],
                  ["TECHNICIAN", "Technician"],
                  ["MATERIAL", "Materials"],
                  ["JOBCARD", "Job Card"],
                  ["FOLLOWUP", "Reopen / Overdue"],
                  ["STUDENT", "Student Status"],
                ].map(([key, label]) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setDrawerTab(key)}
                    className={`shrink-0 rounded-lg px-3 py-2.5 text-[11px] font-bold ${
                      drawerTab === key
                        ? "bg-[#D6AD59] text-[#102B52]"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* DRAWER BODY */}

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              {/* DETAILS TAB */}

              {drawerTab === "DETAILS" && (
                <>
                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-black">
                      Complaint Description
                    </h3>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {selected.description || "No description"}
                    </p>

                    {(selected.titleHindi || selected.descriptionHindi) && (
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="text-xs font-bold text-slate-400">
                          Hindi Translation
                        </p>

                        <p className="mt-2 text-sm">{selected.titleHindi}</p>

                        <p className="mt-1 text-sm">
                          {selected.descriptionHindi}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <InfoItem
                      label="Student"
                      value={selected.createdBy?.name}
                    />

                    <InfoItem
                      label="Location"
                      value={locationDetails(selected)}
                    />

                    <InfoItem label="Category" value={selected.category} />

                    <InfoItem label="Priority" value={selected.priority} />

                    <InfoItem
                      label="Technician"
                      value={
                        selected.assignedTo?.name ||
                        (isAssigned(selected) ? "Assigned" : "Not Assigned")
                      }
                    />

                    <InfoItem
                      label="Status"
                      value={readable(selected.status)}
                    />

                    <InfoItem
                      label="Registered"
                      value={dateIST(selected.createdAt)}
                    />

                    <InfoItem
                      label="Deadline"
                      value={dateIST(selected.deadline)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className={PRIMARY}
                      onClick={() => setDrawerTab("TECHNICIAN")}
                    >
                      <Users size={15} />
                      Technician
                    </button>

                    <button
                      type="button"
                      className={SECONDARY}
                      onClick={() => setDrawerTab("MATERIAL")}
                    >
                      <Package size={15} />
                      Materials
                    </button>

                    <button
                      type="button"
                      className={SECONDARY}
                      onClick={() => setDrawerTab("JOBCARD")}
                    >
                      <Printer size={15} />
                      Job Card
                    </button>

                    <button
                      type="button"
                      className={SECONDARY}
                      onClick={() => setDrawerTab("FOLLOWUP")}
                    >
                      <RotateCcw size={15} />
                      Follow-up
                    </button>
                  </div>
                </>
              )}

              {/* TECHNICIAN TAB */}

              {drawerTab === "TECHNICIAN" && (
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-black">Technician Assignment</h3>

                  <p className="mt-3 text-sm text-slate-600">
                    Assigned Technician:{" "}
                    <b className="text-[#102B52]">
                      {selected.assignedTo?.name ||
                        (isAssigned(selected) ? "Assigned" : "Not Assigned")}
                    </b>
                  </p>

                  {isAssigned(selected) && (
                    <div className="mt-4 rounded-xl bg-blue-50 p-4 text-xs leading-6 text-blue-800">
                      Technician can complete this complaint individually
                      without a mandatory Job Card.
                    </div>
                  )}

                  {!isAssigned(selected) &&
                    upper(selected.status) === "PENDING" && (
                      <div className="mt-4 space-y-3">
                        <p className="text-xs text-slate-500">
                          Matching Category: <b>{selected.category}</b>
                        </p>

                        <select
                          className={INPUT}
                          value={workerId}
                          disabled={!available.workers}
                          onChange={(event) => setWorkerId(event.target.value)}
                        >
                          <option value="">Select Technician</option>

                          {matchingWorkers.map((worker) => (
                            <option key={worker._id} value={worker._id}>
                              {worker.name} ·{" "}
                              {worker.department || worker.category}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          className={`${PRIMARY} w-full`}
                          disabled={!workerId || working || !available.workers}
                          onClick={assignSingle}
                        >
                          {working ? "Assigning..." : "Confirm Assignment"}
                        </button>
                      </div>
                    )}

                  {isReopened(selected) && (
                    <button
                      type="button"
                      className={`${SECONDARY} mt-4 w-full`}
                      onClick={() => setDrawerTab("FOLLOWUP")}
                    >
                      <RotateCcw size={15} />
                      Open Rework Assignment
                    </button>
                  )}
                </div>
              )}

              {/* MATERIAL TAB */}

              {drawerTab === "MATERIAL" && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-black">Material Requirement</h3>

                    <p className="mt-2 text-xs text-slate-500">
                      Manager can decide whether materials are required for this
                      complaint.
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={working || !available.requests}
                        className={PRIMARY}
                        onClick={() => saveMaterialDecision("REQUIRED")}
                      >
                        <CheckCircle2 size={15} />
                        YES
                      </button>

                      <button
                        type="button"
                        disabled={
                          working ||
                          !available.requests ||
                          selectedRequests.length > 0
                        }
                        className={SECONDARY}
                        onClick={() => saveMaterialDecision("NOT_REQUIRED")}
                      >
                        NO
                      </button>
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      Current Decision:{" "}
                      <b>{readable(selected.materialDecision || "NOT_SET")}</b>
                    </p>
                  </div>

                  {selectedRequests.map((request, index) => (
                    <div
                      key={request._id || index}
                      className="rounded-2xl bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black">
                            {request.requestId || "Material Request"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {dateIST(request.createdAt)}
                          </p>
                        </div>

                        <StatusBadge status={request.status} />
                      </div>

                      <div className="mt-4 space-y-2">
                        {(request.materials || []).map((material, i) => (
                          <div
                            key={material._id || i}
                            className="rounded-xl bg-slate-50 p-3 text-xs"
                          >
                            <p className="font-bold">{material.itemName}</p>

                            <p className="mt-1 text-slate-500">
                              Requested: {material.quantity} {material.unit}
                            </p>

                            <p className="mt-1 text-slate-500">
                              Status: {readable(material.status)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {request.reason && (
                        <p className="mt-3 text-xs text-slate-600">
                          <b>Reason:</b> {request.reason}
                        </p>
                      )}
                    </div>
                  ))}

                  {selectedRequests.length === 0 &&
                    available.requests &&
                    !CLOSED.includes(upper(selected.status)) && (
                      <form
                        onSubmit={createMaterialRequest}
                        className="space-y-4 rounded-2xl bg-white p-5 shadow-sm"
                      >
                        <h3 className="text-sm font-black">
                          Request Materials from Store Manager
                        </h3>

                        {materials.map((material, index) => (
                          <div
                            key={index}
                            className="space-y-3 rounded-xl border border-slate-200 p-3"
                          >
                            <div className="flex justify-between">
                              <p className="text-xs font-bold">
                                Material {index + 1}
                              </p>

                              {materials.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setMaterials((previous) =>
                                      previous.filter((_, i) => i !== index),
                                    )
                                  }
                                  aria-label="Remove material"
                                >
                                  <Trash2 size={16} className="text-rose-600" />
                                </button>
                              )}
                            </div>

                            <input
                              required
                              className={INPUT}
                              placeholder="Material Name"
                              value={material.itemName}
                              onChange={(event) =>
                                updateMaterial(
                                  index,
                                  "itemName",
                                  event.target.value,
                                )
                              }
                            />

                            <div className="grid grid-cols-2 gap-2">
                              <input
                                required
                                type="number"
                                min="0.01"
                                step="0.01"
                                className={INPUT}
                                placeholder="Quantity"
                                value={material.quantity}
                                onChange={(event) =>
                                  updateMaterial(
                                    index,
                                    "quantity",
                                    event.target.value,
                                  )
                                }
                              />

                              <select
                                className={INPUT}
                                value={material.unit}
                                onChange={(event) =>
                                  updateMaterial(
                                    index,
                                    "unit",
                                    event.target.value,
                                  )
                                }
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
                          className={SECONDARY}
                          onClick={() =>
                            setMaterials((previous) => [
                              ...previous,
                              newMaterial(),
                            ])
                          }
                        >
                          <Plus size={15} />
                          Add Material
                        </button>

                        <textarea
                          required
                          rows={3}
                          className={INPUT}
                          value={reason}
                          placeholder="Reason for requesting materials..."
                          onChange={(event) => setReason(event.target.value)}
                        />

                        <button
                          type="submit"
                          disabled={working}
                          className={`${PRIMARY} w-full`}
                        >
                          <Send size={15} />
                          {working ? "Sending..." : "Send to Store Manager"}
                        </button>
                      </form>
                    )}
                </div>
              )}

              {/* OPTIONAL JOB CARD */}

              {drawerTab === "JOBCARD" && (
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Printer size={25} className="text-[#B88A36]" />

                    <div>
                      <h3 className="text-sm font-black">Optional Job Card</h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Emergency or Manual Printing
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-xs text-emerald-800">
                    Job Card is optional. Normal complaint processing does not
                    require a Job Card.
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <p>
                      Complaint ID: <b>{selected.complaintId}</b>
                    </p>

                    <p>
                      Technician:{" "}
                      <b>{selected.assignedTo?.name || "Not Assigned"}</b>
                    </p>
                  </div>

                  {cardFor(selected) ? (
                    <div className="mt-5 space-y-3">
                      <p className="text-xs font-bold text-emerald-700">
                        Job Card Already Created
                      </p>

                      <p className="text-xs">
                        {cardFor(selected).jobCardId || "Existing Job Card"}
                      </p>

                      <button
                        type="button"
                        className={`${PRIMARY} w-full`}
                        onClick={() => navigate("/maintenance/job-cards")}
                      >
                        <Printer size={15} />
                        Open Job Card Printing
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={`${PRIMARY} mt-5 w-full`}
                      disabled={
                        !isAssigned(selected) || working || !available.jobCards
                      }
                      onClick={createJobCard}
                    >
                      <Printer size={15} />
                      Generate Manual Job Card
                    </button>
                  )}
                </div>
              )}

              {/* REOPEN / OVERDUE */}

              {drawerTab === "FOLLOWUP" && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <h3 className="flex items-center gap-2 text-sm font-black">
                      <RotateCcw size={18} className="text-rose-600" />
                      Reopened Complaint
                    </h3>

                    {isReopened(selected) ? (
                      <>
                        <p className="mt-3 text-xs text-slate-500">
                          Student's Not Satisfied Reason
                        </p>

                        <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50 p-4">
                          <p className="whitespace-pre-wrap text-sm leading-6 text-rose-900">
                            {getReopenReason(selectedReopen, selected) ||
                              "Student reason unavailable in complaint response."}
                          </p>
                        </div>

                        {selectedReopen && (
                          <div className="mt-4 space-y-2 text-xs text-slate-600">
                            <p>
                              Reopen Case:{" "}
                              <b>{selectedReopen.reopenId || "—"}</b>
                            </p>

                            <p>
                              Reopened At:{" "}
                              <b>
                                {dateIST(
                                  selectedReopen.reopenedAt ||
                                    selectedReopen.createdAt,
                                )}
                              </b>
                            </p>

                            <p>
                              Previous Technician:{" "}
                              <b>
                                {selectedReopen.previousWorker?.name || "—"}
                              </b>
                            </p>
                          </div>
                        )}

                        {selectedReopen && !selectedReopen.reassignedWorker && (
                          <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                            <p className="text-xs font-bold">
                              Reassign for Rework
                            </p>

                            <select
                              value={reassignWorkerId}
                              disabled={!available.workers}
                              onChange={(event) =>
                                setReassignWorkerId(event.target.value)
                              }
                              className={INPUT}
                            >
                              <option value="">Select Technician</option>

                              {matchingWorkers.map((worker) => (
                                <option key={worker._id} value={worker._id}>
                                  {worker.name}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              className={`${PRIMARY} w-full`}
                              disabled={
                                !reassignWorkerId ||
                                working ||
                                !available.workers
                              }
                              onClick={reassignReopened}
                            >
                              <UserCheck size={15} />
                              Reassign Technician
                            </button>
                          </div>
                        )}

                        {selectedReopen?.reassignedWorker && (
                          <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-xs text-emerald-800">
                            Reassigned to:{" "}
                            <b>
                              {selectedReopen.reassignedWorker.name ||
                                "Technician"}
                            </b>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="mt-3 text-xs text-slate-500">
                        This complaint is not currently reopened.
                      </p>
                    )}
                  </div>

                  {/* OVERDUE */}

                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <h3 className="flex items-center gap-2 text-sm font-black">
                      <AlertTriangle size={18} className="text-rose-600" />
                      Overdue Monitoring
                    </h3>

                    {isOverdue(selected, now) ? (
                      <>
                        <p className="mt-3 text-xs text-rose-700">
                          This complaint has exceeded its deadline.
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          Deadline: {dateIST(selected.deadline)}
                        </p>

                        {selectedOverdue && (
                          <>
                            <p className="mt-2 text-xs text-slate-500">
                              Escalation Level:{" "}
                              {selectedOverdue.escalationLevel || "—"}
                            </p>

                            <button
                              type="button"
                              className={`${PRIMARY} mt-4 w-full`}
                              disabled={working}
                              onClick={escalateComplaint}
                            >
                              Escalate Complaint
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <p className="mt-3 text-xs text-slate-500">
                        No active overdue condition.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* STUDENT STATUS */}

              {drawerTab === "STUDENT" && (
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-black">
                    <ShieldCheck size={18} className="text-[#B88A36]" />
                    Student Confirmation
                  </h3>

                  <div className="mt-4 rounded-xl bg-[#F8FAFD] p-4 text-xs leading-6 text-slate-700">
                    {selected.studentVerified === true
                      ? "Student confirmed that the complaint is resolved."
                      : isAwaitingStudent(selected)
                        ? "Technician has marked Work Done. Awaiting Student YES/NO confirmation."
                        : isReopened(selected)
                          ? "Student selected NOT SATISFIED. Complaint has been reopened for rework."
                          : `Current Status: ${readable(selected.status)}`}
                  </div>

                  {isReopened(selected) && (
                    <div className="mt-4 rounded-xl bg-rose-50 p-4">
                      <p className="text-xs font-bold text-rose-800">
                        Student's Reason
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-rose-900">
                        {getReopenReason(selectedReopen, selected) ||
                          "Reason unavailable in API response."}
                      </p>
                    </div>
                  )}

                  <p className="mt-4 text-xs leading-6 text-slate-500">
                    Only the Student can submit the final YES/NO confirmation.
                    Maintenance Manager can monitor the result but cannot
                    confirm on behalf of the Student.
                  </p>
                </div>
              )}
            </div>

            {/* DRAWER FOOTER */}

            <div className="shrink-0 border-t border-slate-200 bg-white p-3 text-right">
              <button
                type="button"
                className={SECONDARY}
                onClick={() => setSelectedId("")}
              >
                Close Details
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* FOOTER */}

      <footer className="flex items-center gap-2 border-t border-slate-200 pt-4 text-xs text-slate-400">
        <ShieldCheck size={14} />
        AMI MAINTENANCE · Unified Complaint Operations
      </footer>
    </div>
  );
}
