import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import PrintableJobCard from "./PrintableJobCard";
import BulkPrintableJobCards from "./BulkPrintableJobCards";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Eye,
  FileText,
  Layers3,
  Loader2,
  Package,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

// ======================================================
// AMI MAINT. — PREMIUM JOB CARD MANAGEMENT
// ======================================================

const API_URL = "/maintenance/job-cards";
const PAGE_SIZE = 10;

const TABS = [
  {
    id: "PRINT_QUEUE",
    label: "Print Queue",
    icon: Printer,
  },
  {
    id: "PRINTED",
    label: "Printed / Active",
    icon: Activity,
  },
  {
    id: "VERIFICATION",
    label: "Verification",
    icon: ShieldCheck,
  },
  {
    id: "COMPLETED",
    label: "Completed",
    icon: CheckCircle2,
  },
];

const INPUT =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#102B52] outline-none transition focus:border-[#D6AD59] focus:ring-2 focus:ring-amber-100";

const PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#102B52] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#204779] disabled:cursor-not-allowed disabled:opacity-50";

const GOLD =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#D6AD59] px-4 py-3 text-xs font-extrabold text-[#081B35] transition hover:bg-[#E7C477] disabled:cursor-not-allowed disabled:opacity-50";

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

const isCompleted = (job) =>
  ["COMPLETED", "CLOSED"].includes(upper(job.status));

const isPrinted = (job) => upper(job.printStatus) === "PRINTED";

const isPrintQueue = (job) => !isPrinted(job) && !isCompleted(job);

const isPrintedActive = (job) => isPrinted(job) && !isCompleted(job);

const formatNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getLocation(job) {
  return job.hostel || job.block || "—";
}

function getTotal(job) {
  return formatNumber(job.totalComplaints ?? job.complaints?.length ?? 0);
}

function getCompleted(job) {
  return formatNumber(job.completedComplaints ?? 0);
}

function getProgress(job) {
  const total = getTotal(job);

  const value =
    job.completionPercentage != null
      ? Number(job.completionPercentage)
      : total > 0
        ? (getCompleted(job) / total) * 100
        : 0;

  return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
}

function statusColor(status) {
  const value = upper(status);

  if (["COMPLETED", "CLOSED", "ISSUED", "APPROVED"].includes(value)) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (["REJECTED", "REOPENED"].includes(value)) {
    return "bg-rose-50 text-rose-700 ring-rose-200";
  }

  if (["IN_PROGRESS", "ASSIGNED", "PRINTED"].includes(value)) {
    return "bg-blue-50 text-blue-700 ring-blue-200";
  }

  if (
    ["WAITING_MATERIAL", "PENDING", "READY_FOR_VERIFICATION"].includes(value)
  ) {
    return "bg-amber-50 text-amber-800 ring-amber-200";
  }

  return "bg-slate-100 text-slate-600 ring-slate-200";
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-extrabold ring-1 ring-inset ${statusColor(
        status,
      )}`}
    >
      {String(status || "UNKNOWN").replaceAll("_", " ")}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, tone }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    gold: "bg-amber-50 text-amber-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="group rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D6AD59]/40 hover:shadow-md">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
          tones[tone] || tones.blue
        }`}
      >
        <Icon size={23} />
      </div>

      <p className="mt-4 text-[30px] font-black tracking-tight text-[#102B52]">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold text-slate-500">{title}</p>
    </div>
  );
}

function InfoItem({ title, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-[#F8FAFD] p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-1 break-words text-xs font-bold text-[#102B52]">
        {value ?? "—"}
      </p>
    </div>
  );
}

function SectionHeading({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#102B52]/[0.07] text-[#102B52]">
        <Icon size={17} />
      </div>

      <h3 className="text-sm font-extrabold text-[#102B52]">{title}</h3>
    </div>
  );
}

function VerificationItem({ title, verified, date, signature }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-extrabold text-[#102B52]">{title}</p>

      <div className="mt-3">
        <StatusBadge status={verified ? "COMPLETED" : "PENDING"} />
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {date ? formatDate(date) : "Not yet verified"}
      </p>

      <div className="mt-3 flex min-h-12 items-center border-t border-slate-100 pt-2">
        {signature ? (
          <img
            src={signature}
            alt={`${title} signature`}
            className="max-h-12 max-w-full object-contain"
          />
        ) : (
          <p className="text-xs text-slate-400">Signature pending</p>
        )}
      </div>
    </div>
  );
}

function getMaterials(job) {
  const result = [];

  (job.complaints || []).forEach((item) => {
    const request = item.materialRequest;

    (request?.materials || []).forEach((material) => {
      result.push({
        ...material,
        complaintId: item.complaint?.complaintId || "—",
        requestId: request.requestId || "—",
        storeSlipNo: request.storeSlipNo || item.storeSlipNo || "—",
      });
    });
  });

  return result;
}

// ======================================================
// JOB CARD DETAILS
// ======================================================

function JobDetails({ job }) {
  const materials = getMaterials(job);

  return (
    <div className="space-y-5">
      {/* BASIC INFORMATION */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <SectionHeading icon={FileText} title="Job Card Information" />

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <InfoItem title="Job Card ID" value={job.jobCardId} />

          <InfoItem title="Location" value={getLocation(job)} />

          <InfoItem title="Category" value={job.category} />

          <InfoItem title="Priority" value={job.priority} />

          <InfoItem title="Created" value={formatDate(job.createdAt)} />

          <InfoItem
            title="Current Status"
            value={String(job.status || "—").replaceAll("_", " ")}
          />
        </div>
      </div>

      {/* TECHNICIAN INFORMATION */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <SectionHeading icon={UserRound} title="Assigned Technician" />

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <InfoItem title="Name" value={job.assignedWorker?.name} />

          <InfoItem title="Department" value={job.assignedWorker?.department} />

          <InfoItem title="Phone" value={job.assignedWorker?.phone} />

          <InfoItem title="Assigned By" value={job.assignedBy?.name} />

          <InfoItem
            title="Assigned Date"
            value={formatDate(job.assignedDate)}
          />

          <InfoItem title="Worker Status" value={job.workerStatus} />
        </div>
      </div>

      {/* WORK PROGRESS */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <SectionHeading icon={Activity} title="Work Progress" />

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoItem title="Total Complaints" value={getTotal(job)} />

          <InfoItem title="Completed" value={getCompleted(job)} />

          <InfoItem
            title="Pending"
            value={
              job.pendingComplaints ??
              Math.max(0, getTotal(job) - getCompleted(job))
            }
          />

          <InfoItem
            title="Floors Covered"
            value={job.floorsCovered?.join(", ") || "—"}
          />
        </div>

        <div className="mt-5">
          <div className="flex justify-between text-xs font-bold">
            <span>Completion Progress</span>
            <span>{getProgress(job).toFixed(0)}%</span>
          </div>

          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#D6AD59]"
              style={{
                width: `${getProgress(job)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* COMPLAINT DETAILS */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <SectionHeading
          icon={ClipboardList}
          title="Complaints Included in Job Card"
        />

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-xs">
            <thead className="bg-[#F8FAFD] text-slate-500">
              <tr>
                {[
                  "S.No",
                  "Complaint ID",
                  "Room / Floor",
                  "Issue (English)",
                  "Issue (Hindi)",
                  "Priority",
                  "Material",
                  "Store Status",
                  "Verification",
                  "Status",
                ].map((title) => (
                  <th key={title} className="px-3 py-3 font-bold">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {(job.complaints || []).map((item, index) => (
                <tr key={item._id || index}>
                  <td className="px-3 py-3">
                    {item.serialNumber || index + 1}
                  </td>

                  <td className="px-3 py-3 font-bold">
                    {item.complaint?.complaintId || "—"}
                  </td>

                  <td className="px-3 py-3">
                    {item.roomNumber || "—"} / {item.floor || "—"}
                  </td>

                  <td className="px-3 py-3">
                    {item.title || item.complaint?.title || "—"}
                  </td>

                  <td className="px-3 py-3">
                    {item.titleHindi || item.complaint?.titleHindi || "—"}
                  </td>

                  <td className="px-3 py-3">{item.priority || "—"}</td>

                  <td className="px-3 py-3">
                    {item.materialRequired ? "YES" : "NO"}
                  </td>

                  <td className="px-3 py-3">{item.materialStatus || "—"}</td>

                  <td className="px-3 py-3">
                    {item.studentVerified ? "VERIFIED" : "PENDING"}
                  </td>

                  <td className="px-3 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!job.complaints?.length && (
            <p className="py-5 text-center text-xs text-slate-400">
              No complaint details available.
            </p>
          )}
        </div>
      </div>

      {/* MATERIAL DETAILS */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <SectionHeading icon={Package} title="Material Summary" />

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {["PENDING", "APPROVED", "ISSUED", "REJECTED", "NOT_REQUIRED"].map(
            (status) => {
              const count = (job.complaints || []).filter(
                (item) =>
                  upper(item.materialStatus || "NOT_REQUIRED") === status,
              ).length;

              return (
                <InfoItem
                  key={status}
                  title={status.replaceAll("_", " ")}
                  value={count}
                />
              );
            },
          )}
        </div>

        {materials.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-xs">
              <thead className="bg-[#F8FAFD] text-slate-500">
                <tr>
                  {[
                    "Complaint",
                    "Request",
                    "Item",
                    "Requested",
                    "Approved",
                    "Issued",
                    "Unit",
                    "Status",
                    "Store Slip",
                  ].map((title) => (
                    <th key={title} className="px-3 py-3 font-bold">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {materials.map((material, index) => (
                  <tr key={material._id || index}>
                    <td className="px-3 py-3">{material.complaintId}</td>
                    <td className="px-3 py-3">{material.requestId}</td>
                    <td className="px-3 py-3 font-bold">{material.itemName}</td>
                    <td className="px-3 py-3">{material.quantity ?? "—"}</td>
                    <td className="px-3 py-3">
                      {material.approvedQuantity ?? "—"}
                    </td>
                    <td className="px-3 py-3">
                      {material.issuedQuantity ?? "—"}
                    </td>
                    <td className="px-3 py-3">{material.unit}</td>
                    <td className="px-3 py-3">{material.status || "—"}</td>
                    <td className="px-3 py-3">{material.storeSlipNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REMARKS */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <SectionHeading icon={FileText} title="Work Remarks" />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoItem
            title="Technician Remarks"
            value={job.workerRemarks || "—"}
          />

          <InfoItem
            title="Maintenance Manager Remarks"
            value={job.managerRemarks || "—"}
          />
        </div>
      </div>

      {/* VERIFICATION */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <SectionHeading
          icon={ShieldCheck}
          title="Existing Job Card Signatures"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <VerificationItem
            title="Technician"
            verified={job.workerSigned}
            date={job.workerSignedAt}
            signature={job.workerSignature}
          />

          <VerificationItem
            title="Warden"
            verified={job.wardenVerified}
            date={job.wardenSignedAt}
            signature={job.wardenSignature}
          />

          <VerificationItem
            title="Maintenance Manager"
            verified={job.managerVerified}
            date={job.managerSignedAt}
            signature={job.managerSignature}
          />
        </div>

        <p className="mt-4 text-[11px] leading-5 text-slate-500">
          These are existing Job Card records. Student complaint YES/NO
          confirmation remains a separate Student-controlled workflow.
        </p>
      </div>
    </div>
  );
}

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function JobCards() {
  const navigate = useNavigate();
  const [jobCards, setJobCards] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("PRINT_QUEUE");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [selectedJobCard, setSelectedJobCard] = useState(null);

  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const [printJob, setPrintJob] = useState(null);
  const [bulkPrintJobs, setBulkPrintJobs] = useState([]);

  const [markingIds, setMarkingIds] = useState([]);

  // ====================================================
  // FETCH JOB CARDS
  // ====================================================

  const fetchJobCards = useCallback(async ({ silent = false, signal } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.get(API_URL, {
        signal,
      });

      const items = response?.data?.jobCards;

      if (!Array.isArray(items)) {
        throw new Error("Invalid Job Card response");
      }

      if (!signal?.aborted) {
        setJobCards(items);
        setError("");

        if (silent) {
          toast.success("Job Cards refreshed", {
            duration: 1200,
          });
        }
      }
    } catch (err) {
      if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
        return;
      }

      console.error("JOB CARD FETCH ERROR:", err);

      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to load Job Cards";

      setError(message);

      if (!silent) {
        toast.error(message, {
          duration: 2000,
        });
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

  const stats = useMemo(() => {
    return {
      total: jobCards.length,

      active: jobCards.filter(
        (job) =>
          !isCompleted(job) &&
          [
            "ASSIGNED",
            "IN_PROGRESS",
            "PARTIALLY_COMPLETED",
            "WAITING_MATERIAL",
          ].includes(upper(job.status)),
      ).length,

      waiting: jobCards.filter(
        (job) => upper(job.status) === "WAITING_MATERIAL",
      ).length,

      completed: jobCards.filter(isCompleted).length,

      queue: jobCards.filter(isPrintQueue).length,

      printed: jobCards.filter(isPrintedActive).length,
    };
  }, [jobCards]);

  const tabJobCards = useMemo(() => {
    if (activeTab === "PRINT_QUEUE") {
      return jobCards.filter(isPrintQueue);
    }

    if (activeTab === "PRINTED") {
      return jobCards.filter(isPrintedActive);
    }

    if (activeTab === "COMPLETED") {
      return jobCards.filter(isCompleted);
    }

    return jobCards;
  }, [jobCards, activeTab]);

  const filtered = useMemo(() => {
    const query = lower(search);

    return tabJobCards.filter((job) => {
      const searchable = [
        job.jobCardId,
        job.category,
        job.hostel,
        job.block,
        job.assignedWorker?.name,
      ]
        .map(lower)
        .join(" ");

      const matchStatus =
        statusFilter === "ALL" || upper(job.status) === statusFilter;

      return (!query || searchable.includes(query)) && matchStatus;
    });
  }, [tabJobCards, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const safePage = Math.min(page, totalPages);

  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const selectedJobs = useMemo(() => {
    const selected = new Set(selectedIds);

    return jobCards.filter((job) => selected.has(job._id) && isPrintQueue(job));
  }, [jobCards, selectedIds]);

  const allVisibleSelected =
    visible.length > 0 && visible.every((job) => selectedIds.includes(job._id));

  // ====================================================
  // TABS AND SELECTION
  // ====================================================
  function changeTab(next) {
    if (next === "VERIFICATION") {
      navigate("/maintenance/verification");
      return;
    }

    setActiveTab(next);
    setSearch("");
    setStatusFilter("ALL");
    setPage(1);
    setBulkMode(false);
    setSelectedIds([]);
  }

  function toggleBulkMode() {
    setBulkMode((current) => !current);
    setSelectedIds([]);
  }

  function toggleSelection(id) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function selectAllVisible() {
    const visibleIds = visible.map((job) => job._id);

    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }

      return [...new Set([...current, ...visibleIds])];
    });
  }

  // ====================================================
  // PRINTING
  // ====================================================

  function handlePrint(job) {
    setBulkPrintJobs([]);
    setPrintJob(job);

    // Allow React to mount the print portal.
    window.setTimeout(() => {
      window.print();
    }, 500);
  }

  function handleBulkPrint() {
    if (!selectedJobs.length) {
      toast.error("Select at least one Job Card");
      return;
    }

    setPrintJob(null);
    setBulkPrintJobs([]);

    if (selectedJobs.length === 1) {
      handlePrint(selectedJobs[0]);
      return;
    }

    setBulkPrintJobs(selectedJobs);

    window.setTimeout(() => {
      window.print();
    }, 800);
  }

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintJob(null);
      setBulkPrintJobs([]);
    };

    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  // ====================================================
  // MARK PRINTED
  // ====================================================

  async function markPrinted(job) {
    if (markingIds.includes(job._id)) return;

    setMarkingIds((current) => [...current, job._id]);

    try {
      await api.put(`${API_URL}/${job._id}/mark-printed`, {});

      setJobCards((current) =>
        current.map((item) =>
          item._id === job._id
            ? {
                ...item,
                printStatus: "PRINTED",
                printedAt: new Date().toISOString(),
              }
            : item,
        ),
      );

      toast.success("Job Card marked as printed", {
        duration: 1200,
      });

      setSelectedJobCard(null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to mark Job Card as printed",
      );
    } finally {
      setMarkingIds((current) => current.filter((id) => id !== job._id));
    }
  }

  async function markSelectedPrinted() {
    if (!selectedJobs.length || markingIds.length) {
      return;
    }

    const jobs = [...selectedJobs];
    const ids = jobs.map((job) => job._id);

    setMarkingIds(ids);

    try {
      const results = await Promise.allSettled(
        jobs.map((job) => api.put(`${API_URL}/${job._id}/mark-printed`, {})),
      );

      const successIds = jobs
        .filter((_, index) => results[index].status === "fulfilled")
        .map((job) => job._id);

      const failedCount = jobs.length - successIds.length;

      if (successIds.length) {
        const printedAt = new Date().toISOString();

        setJobCards((current) =>
          current.map((job) =>
            successIds.includes(job._id)
              ? {
                  ...job,
                  printStatus: "PRINTED",
                  printedAt,
                }
              : job,
          ),
        );

        setSelectedIds((current) =>
          current.filter((id) => !successIds.includes(id)),
        );

        toast.success(`${successIds.length} Job Cards marked printed`, {
          duration: 1500,
        });
      }

      if (failedCount) {
        toast.error(`${failedCount} Job Cards could not be updated`);
      }
    } finally {
      setMarkingIds([]);
    }
  }

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-[#102B52]" />

        <p className="text-sm font-semibold text-[#102B52]">
          Loading Job Cards...
        </p>
      </div>
    );
  }

  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <>
      <div className="min-w-0 space-y-6 pb-8 text-[#102B52] print:hidden">
        {/* PREMIUM HEADER */}

        <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#081B35] via-[#102E55] to-[#204779] p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-14 -top-24 h-64 w-64 rounded-full border-[42px] border-white/[0.04]" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D6AD59]/30 bg-[#D6AD59]/10 px-3 py-1.5">
                <Sparkles size={13} className="text-[#E8C477]" />

                <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#F0D494]">
                  AMI MAINT. · OPERATIONS
                </span>
              </div>

              <h1 className="mt-4 text-[27px] font-black tracking-tight sm:text-[34px]">
                Job Card Management
              </h1>

              <p className="mt-3 max-w-2xl text-[13px] leading-6 text-slate-300">
                Manage optional and emergency Job Cards, print work documents,
                track progress and monitor completion in one workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {activeTab === "PRINT_QUEUE" && (
                <button
                  type="button"
                  onClick={toggleBulkMode}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold ${
                    bulkMode
                      ? "bg-[#D6AD59] text-[#081B35]"
                      : "border border-white/20 bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <Layers3 size={16} />

                  {bulkMode ? "Exit Bulk Selection" : "Bulk Select"}
                </button>
              )}

              <button
                type="button"
                disabled={refreshing}
                onClick={() => fetchJobCards({ silent: true })}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold text-white hover:bg-white/20 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* LOAD ERROR */}

        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4"
          >
            <p className="flex items-center gap-2 text-xs font-semibold text-rose-700">
              <AlertCircle size={17} />
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

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Job Cards"
            value={stats.total}
            icon={ClipboardList}
            tone="blue"
          />

          <StatCard
            title="Active Jobs"
            value={stats.active}
            icon={Activity}
            tone="purple"
          />

          <StatCard
            title="Waiting Material"
            value={stats.waiting}
            icon={Package}
            tone="gold"
          />

          <StatCard
            title="Completed Job Cards"
            value={stats.completed}
            icon={CheckCircle2}
            tone="green"
          />
        </div>

        {/* WORKFLOW TABS */}

        {/* ==========================================
    JOB CARD WORKFLOW TABS
    ========================================== */}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {TABS.map((item) => {
            const Icon = item.icon;

            const count =
              item.id === "PRINT_QUEUE"
                ? stats.queue
                : item.id === "PRINTED"
                  ? stats.printed
                  : item.id === "COMPLETED"
                    ? stats.completed
                    : null;

            const active = activeTab === item.id;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => changeTab(item.id)}
                className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                  active
                    ? "border-[#D6AD59] bg-[#102B52] text-white shadow-lg"
                    : "border-slate-200 bg-white text-[#102B52] hover:border-[#D6AD59]/50 hover:shadow-md"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Icon size={20} className="shrink-0" />

                  <span className="text-xs font-extrabold">{item.label}</span>
                </div>

                {count !== null ? (
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-black ${
                      active
                        ? "bg-[#D6AD59] text-[#102B52]"
                        : "bg-slate-100 text-[#102B52]"
                    }`}
                  >
                    {count}
                  </span>
                ) : (
                  <ArrowRight size={18} className="shrink-0 text-[#B88A36]" />
                )}
              </button>
            );
          })}
        </div>

        {/* SEARCH / FILTER */}

        <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold">Job Card Records</h2>

              <p className="mt-1 text-xs text-slate-500">
                Search and filter existing Job Cards
              </p>
            </div>

            <span className="text-xs font-bold text-slate-500">
              {filtered.length} Records
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_240px]">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                className={`${INPUT} pl-10`}
                placeholder="Search Job ID, location, category, Technician..."
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <select
              className={INPUT}
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="CREATED">Created</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_MATERIAL">Waiting Material</option>
              <option value="PARTIALLY_COMPLETED">Partially Completed</option>
              <option value="READY_FOR_VERIFICATION">
                Ready for Verification
              </option>
              <option value="COMPLETED">Completed</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </section>

        {/* BULK TOOLBAR */}

        {bulkMode && activeTab === "PRINT_QUEUE" && (
          <section className="sticky top-3 z-30 rounded-[22px] border border-[#D6AD59]/40 bg-white p-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase text-slate-500">
                  Bulk Selection
                </p>

                <p className="mt-1 text-lg font-black">
                  {selectedJobs.length} Selected
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={SECONDARY}
                  onClick={selectAllVisible}
                  disabled={!visible.length}
                >
                  {allVisibleSelected ? "Unselect Visible" : "Select Visible"}
                </button>

                <button
                  type="button"
                  className={SECONDARY}
                  onClick={() => setSelectedIds([])}
                  disabled={!selectedIds.length}
                >
                  Clear
                </button>

                <button
                  type="button"
                  className={GOLD}
                  disabled={!selectedJobs.length}
                  onClick={handleBulkPrint}
                >
                  <Printer size={15} />
                  Print ({selectedJobs.length})
                </button>

                <button
                  type="button"
                  className={PRIMARY}
                  disabled={!selectedJobs.length || markingIds.length > 0}
                  onClick={markSelectedPrinted}
                >
                  {markingIds.length ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Check size={15} />
                  )}
                  Mark Printed
                </button>
              </div>
            </div>
          </section>
        )}

        {/* JOB CARD LIST */}

        <div className="grid items-start gap-4 xl:grid-cols-2">
          {visible.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center xl:col-span-2">
              <ClipboardList size={40} className="mx-auto text-slate-300" />

              <h3 className="mt-4 text-sm font-bold">No Job Cards Found</h3>

              <p className="mt-2 text-xs text-slate-500">
                Job Cards will appear here when created by the Maintenance
                Manager.
              </p>
            </div>
          ) : (
            visible.map((job) => {
              const selected = selectedIds.includes(job._id);

              const canSelect = bulkMode && activeTab === "PRINT_QUEUE";

              return (
                <article
                  key={job._id}
                  className={`overflow-hidden rounded-[22px] border bg-white shadow-sm transition-all hover:shadow-md ${
                    selected
                      ? "border-[#D6AD59] ring-2 ring-amber-100"
                      : "border-slate-200"
                  }`}
                >
                  {/* CARD HEADER */}

                  <div className="bg-gradient-to-r from-[#081B35] to-[#204779] p-5 text-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        {canSelect && (
                          <input
                            type="checkbox"
                            aria-label={`Select ${job.jobCardId}`}
                            checked={selected}
                            onChange={() => toggleSelection(job._id)}
                            className="mt-1 h-4 w-4 accent-[#D6AD59]"
                          />
                        )}

                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wide text-slate-300">
                            Job Card Reference
                          </p>

                          <h3 className="mt-1 break-all text-lg font-black">
                            {job.jobCardId}
                          </h3>
                        </div>
                      </div>

                      <StatusBadge status={job.status} />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Clock3 size={13} />
                        {formatDate(job.createdAt)}
                      </span>

                      {isPrinted(job) && (
                        <span className="flex items-center gap-1.5 text-[#E8C477]">
                          <CheckCircle2 size={13} />
                          Printed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CARD BODY */}

                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-3">
                      <InfoItem title="Location" value={getLocation(job)} />

                      <InfoItem title="Category" value={job.category} />

                      <InfoItem
                        title="Technician"
                        value={job.assignedWorker?.name || "Not Assigned"}
                      />

                      <InfoItem
                        title="Complaints Completed"
                        value={`${getCompleted(job)} / ${getTotal(job)}`}
                      />
                    </div>

                    {/* PROGRESS */}

                    <div className="mt-5">
                      <div className="flex justify-between text-xs font-bold">
                        <span>Work Progress</span>

                        <span>{getProgress(job).toFixed(0)}%</span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#D6AD59] transition-all"
                          style={{
                            width: `${getProgress(job)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={`${PRIMARY} flex-1`}
                        onClick={() => setSelectedJobCard(job)}
                      >
                        <Eye size={15} />
                        View Details
                      </button>

                      {activeTab === "PRINT_QUEUE" && !bulkMode && (
                        <>
                          <button
                            type="button"
                            className={GOLD}
                            onClick={() => handlePrint(job)}
                          >
                            <Printer size={15} />
                            Print
                          </button>

                          <button
                            type="button"
                            className={SECONDARY}
                            disabled={markingIds.includes(job._id)}
                            onClick={() => markPrinted(job)}
                          >
                            {markingIds.includes(job._id) ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Check size={15} />
                            )}
                            Mark Printed
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* PAGINATION */}

        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">
              Page {safePage} of {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                className={SECONDARY}
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
              >
                <ChevronLeft size={15} />
              </button>

              <button
                type="button"
                className={SECONDARY}
                disabled={safePage === totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        <footer className="flex items-center gap-2 border-t border-slate-200 pt-4 text-[11px] text-slate-400">
          <ShieldCheck size={14} />
          AMI MAINT. · Job Card Operations
        </footer>
      </div>

      {/* ===================================================
          DETAILS MODAL — SCREEN ONLY
      =================================================== */}

      {selectedJobCard && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Job Card ${selectedJobCard.jobCardId}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm print:hidden sm:p-5"
        >
          <div className="flex max-h-[95vh] w-full max-w-[1050px] flex-col overflow-hidden rounded-[22px] bg-[#F8FAFD] shadow-2xl">
            {/* MODAL HEADER */}

            <div className="shrink-0 bg-[#102B52] p-4 text-white sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#E8C477]">
                    AMI MAINT. · JOB CARD
                  </p>

                  <h2 className="mt-2 break-all text-xl font-black">
                    {selectedJobCard.jobCardId}
                  </h2>

                  <p className="mt-1 text-xs text-slate-300">
                    Complete Job Card Information
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedJobCard(null)}
                  aria-label="Close Job Card details"
                  className="rounded-xl bg-white/10 p-2.5 hover:bg-white/20"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            {/* MODAL BODY */}

            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
              <JobDetails job={selectedJobCard} />
            </div>

            {/* MODAL ACTIONS */}

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-white p-4">
              <button
                type="button"
                className={SECONDARY}
                onClick={() => setSelectedJobCard(null)}
              >
                Close
              </button>

              {activeTab === "PRINT_QUEUE" && (
                <>
                  <button
                    type="button"
                    className={GOLD}
                    onClick={() => handlePrint(selectedJobCard)}
                  >
                    <Printer size={15} />
                    Print Job Card
                  </button>

                  <button
                    type="button"
                    className={PRIMARY}
                    disabled={markingIds.includes(selectedJobCard._id)}
                    onClick={() => markPrinted(selectedJobCard)}
                  >
                    <Check size={15} />
                    Mark Printed
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          ORIGINAL PRINTABLE COMPONENTS
          Actual document formatting remains unchanged.
      =================================================== */}

      {printJob &&
        createPortal(
          <div id="job-card-print-root">
            <PrintableJobCard job={printJob} />
          </div>,
          document.body,
        )}

      {bulkPrintJobs.length > 0 &&
        createPortal(
          <BulkPrintableJobCards jobs={bulkPrintJobs} />,
          document.body,
        )}
    </>
  );
}
