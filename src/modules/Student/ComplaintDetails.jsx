import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CalendarCheck2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  FileImage,
  FileText,
  Hash,
  Loader2,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

import api from "../../services/api";

import { getComplaintById } from "../../services/studentService";

import useRealtimeRefresh from "../notifications/hooks/useRealtimeRefresh";

// ============================================================
// AMI MAINTENANCE
// PREMIUM STUDENT COMPLAINT DETAILS
//
// Separate page: /complaints/:id
// ============================================================

// ============================================================
// STATUS STYLING
// ============================================================

const STATUS_STYLE = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",

  ASSIGNED: "border-sky-200 bg-sky-50 text-sky-800",

  IN_PROGRESS: "border-blue-200 bg-blue-50 text-blue-800",

  WAITING_MATERIAL: "border-violet-200 bg-violet-50 text-violet-800",

  COMPLETED: "border-teal-200 bg-teal-50 text-teal-800",

  RESOLVED: "border-emerald-200 bg-emerald-50 text-emerald-800",

  CLOSED: "border-slate-200 bg-slate-100 text-slate-700",

  REOPENED: "border-orange-200 bg-orange-50 text-orange-800",
};

// ============================================================
// PRIORITY STYLING
// ============================================================

const PRIORITY_STYLE = {
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-700",

  MEDIUM: "border-amber-200 bg-amber-50 text-amber-800",

  HIGH: "border-orange-200 bg-orange-50 text-orange-800",

  URGENT: "border-rose-200 bg-rose-50 text-rose-700",
};

// ============================================================
// PROGRESS STAGES
// ============================================================

const STAGES = [
  "Submitted",
  "Assigned",
  "In Progress",
  "Work Completed",
  "Student Verified",
];

// ============================================================
// COMMON HELPERS
// ============================================================

const clean = (value) => String(value ?? "").trim();

const label = (value) => clean(value).replace(/_/g, " ") || "Not available";

const valueOrDash = (value) => clean(value) || "—";

// ============================================================
// DATE FORMATTER (IST)
// ============================================================

function dateTime(value, withTime = true) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",

    day: "2-digit",
    month: "short",
    year: "numeric",

    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  });
}

// ============================================================
// VISIT DATE FORMAT
// ============================================================

function visitDate(value) {
  if (!value) {
    return "Not scheduled";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return dateTime(`${value}T12:00:00+05:30`, false);
  }

  return dateTime(value, false);
}

// ============================================================
// PERSON NAME
// ============================================================

function personName(value, fallback = "Not assigned yet") {
  if (!value) {
    return fallback;
  }

  if (typeof value === "object") {
    return clean(value.name || value.fullName) || fallback;
  }

  return fallback;
}

// ============================================================
// LOCATION DISPLAY
// ============================================================

function formatLocation(complaint) {
  if (!complaint) {
    return "—";
  }

  if (complaint.complaintArea === "HOSTEL") {
    return (
      [
        complaint.hostel,

        complaint.roomNumber ? `Room ${complaint.roomNumber}` : "",
      ]
        .filter(Boolean)
        .join(" · ") || "Hostel"
    );
  }

  if (complaint.complaintArea === "DEPARTMENT") {
    const code = clean(complaint.block);

    const block = code ? (/^block\b/i.test(code) ? code : `Block ${code}`) : "";

    return (
      [block, complaint.issueLocation].filter(Boolean).join(" · ") ||
      "Academic Block"
    );
  }

  return clean(complaint.issueLocation) || "Campus";
}

// ============================================================
// STATUS PROGRESS POSITION
// ============================================================

function getStage(status) {
  switch (status) {
    case "PENDING":
      return 0;

    case "ASSIGNED":
      return 1;

    case "IN_PROGRESS":
    case "WAITING_MATERIAL":
      return 2;

    case "COMPLETED":
      return 3;

    case "RESOLVED":
    case "CLOSED":
      return 4;

    case "REOPENED":
      return 2;

    default:
      return 0;
  }
}

// ============================================================
// STATUS / PRIORITY PILL
// ============================================================

function Pill({ value, priority = false, dark = false }) {
  const color = (priority ? PRIORITY_STYLE : STATUS_STYLE)[
    clean(value).toUpperCase()
  ];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide ${
        color ||
        (dark
          ? "border-white/25 bg-white/10 text-white"
          : "border-slate-200 bg-slate-100 text-slate-700")
      }`}
    >
      {label(value)}
    </span>
  );
}

// ============================================================
// REUSABLE PREMIUM SECTION
// ============================================================

function Section({ icon: Icon, title, subtitle, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_7px_28px_rgba(14,39,73,0.04)] ${className}`}
    >
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF6E4] text-[#B38226]">
          <Icon size={21} />
        </span>

        <div className="min-w-0">
          <h2 className="text-base font-black text-[#102746] sm:text-lg">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

// ============================================================
// REUSABLE DETAIL FIELD
// ============================================================

function DetailItem({ label: fieldName, children }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-[#F7F9FC] px-4 py-3.5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {fieldName}
      </p>

      <div className="mt-1.5 break-words text-sm font-bold leading-6 text-[#142D4C]">
        {children === undefined || children === null || children === ""
          ? "—"
          : children}
      </div>
    </div>
  );
}

// ============================================================
// TOP METRIC
// ============================================================

function Metric({ icon: Icon, label: fieldName, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F6F8FC] text-[#B88831]">
        <Icon size={20} />
      </span>

      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
          {fieldName}
        </p>

        <p className="mt-1 break-words text-sm font-extrabold text-[#102746]">
          {valueOrDash(value)}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ComplaintDetails() {
  const { id } = useParams();

  const submitLock = useRef(false);

  // ==========================================================
  // STATE
  // ==========================================================

  const [complaint, setComplaint] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // SATISFIED | NOT_SATISFIED

  const [modal, setModal] = useState(null);

  const [reason, setReason] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // ==========================================================
  // FETCH COMPLAINT FROM BACKEND
  // ==========================================================

  const fetchComplaint = useCallback(
    async (initial = false) => {
      if (!id) {
        return;
      }

      if (initial === true) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const response = await getComplaintById(id);

        const record = response?.data?.complaint || response?.complaint;

        if (!record) {
          throw new Error("Complaint not found");
        }

        setComplaint(record);
        setError("");
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load complaint details",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  // ==========================================================
  // INITIAL FETCH
  // ==========================================================

  useEffect(() => {
    setComplaint(null);
    fetchComplaint(true);
  }, [fetchComplaint]);

  // ==========================================================
  // EXISTING NOTIFICATION REFRESH
  // ==========================================================

  const onComplaintUpdated = useCallback(
    () => fetchComplaint(false),
    [fetchComplaint],
  );

  useRealtimeRefresh("complaintUpdated", onComplaintUpdated);

  // ==========================================================
  // STATUS HISTORY
  // ==========================================================

  const history = useMemo(() => {
    const rows = Array.isArray(complaint?.statusHistory)
      ? [...complaint.statusHistory]
      : [];

    rows.sort(
      (a, b) => new Date(a.changedAt || 0) - new Date(b.changedAt || 0),
    );

    return rows;
  }, [complaint]);

  // ==========================================================
  // ASSIGNED TECHNICIAN
  // ==========================================================

  const worker =
    complaint?.assignedTo && typeof complaint.assignedTo === "object"
      ? complaint.assignedTo
      : complaint?.assignedWorker &&
          typeof complaint.assignedWorker === "object"
        ? complaint.assignedWorker
        : null;

  // ==========================================================
  // VISIT PREFERENCES
  // ==========================================================

  const preferences = Array.isArray(complaint?.preferredVisitSlots)
    ? complaint.preferredVisitSlots
    : [];

  const visit = complaint?.scheduledVisit || {};

  const verification = complaint?.studentVerification || {};

  // ==========================================================
  // PROGRESS STAGE
  // ==========================================================

  const rawStage = getStage(complaint?.status);

  const stage =
    rawStage === 4 && verification.decision !== "SATISFIED" ? 3 : rawStage;

  const canVerify = complaint?.status === "COMPLETED";

  const isSatisfied =
    ["RESOLVED", "CLOSED"].includes(complaint?.status) &&
    verification.decision === "SATISFIED";

  const isReopened = complaint?.status === "REOPENED";

  // ==========================================================
  // OPEN VERIFICATION MODAL
  // ==========================================================

  const openVerification = (decision) => {
    if (!canVerify) {
      return;
    }

    setReason("");
    setModal(decision);
  };

  // ==========================================================
  // SUBMIT STUDENT SATISFACTION
  //
  // SATISFIED -> RESOLVED
  // NOT_SATISFIED -> REOPENED
  // ==========================================================

  const submitVerification = async (event) => {
    event.preventDefault();

    if (submitLock.current || submitting || !canVerify || !modal) {
      return;
    }

    const trimmed = reason.trim();

    if (
      modal === "NOT_SATISFIED" &&
      (trimmed.length < 5 || trimmed.length > 800)
    ) {
      toast.error("Please enter a reason between 5 and 800 characters.");

      return;
    }

    submitLock.current = true;
    setSubmitting(true);

    try {
      const response = await api.post(`/student/complaints/${id}/verify`, {
        decision: modal,

        reason: modal === "NOT_SATISFIED" ? trimmed : "",
      });

      if (response?.data?.success === false) {
        throw new Error(response.data.message || "Verification failed");
      }

      if (response?.data?.complaint) {
        setComplaint(response.data.complaint);
      }

      toast.success(
        response?.data?.message || "Feedback recorded successfully",
      );

      setModal(null);
      setReason("");

      await fetchComplaint(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          "Unable to submit feedback",
      );

      if (err?.response?.status === 409) {
        await fetchComplaint(false);
      }
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white">
        <Loader2 size={32} className="animate-spin text-[#B88932]" />

        <p className="mt-4 text-sm font-medium text-slate-500">
          Loading complaint details...
        </p>
      </div>
    );
  }

  // ==========================================================
  // ERROR SCREEN
  // ==========================================================

  if (!complaint) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <AlertCircle size={40} className="mx-auto text-rose-500" />

        <h2 className="mt-4 text-xl font-black text-[#102746]">
          Complaint not available
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {error || "Complaint not found"}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/complaints"
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold"
          >
            Back to My Complaints
          </Link>

          <button
            type="button"
            onClick={() => fetchComplaint(true)}
            className="rounded-xl bg-[#102746] px-5 py-3 text-sm font-bold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PREMIUM PAGE
  // ==========================================================

  return (
    <main className="mx-auto max-w-7xl space-y-5 pb-12 text-[#102746]">
      {/* ===============================================
          BREADCRUMB AND REFRESH
      =============================================== */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Link
            to="/complaints"
            className="inline-flex items-center gap-2 font-bold text-slate-500 hover:text-[#102746]"
          >
            <ArrowLeft size={17} />
            My Complaints
          </Link>

          <ChevronRight size={15} className="text-slate-300" />

          <span className="font-extrabold text-[#102746]">
            Complaint Details
          </span>
        </div>

        <button
          type="button"
          disabled={refreshing}
          onClick={() => fetchComplaint(false)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ===============================================
          PREMIUM HERO HEADER
      =============================================== */}

      <header className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#091E3A] via-[#11345B] to-[#1C4C7D] p-6 text-white shadow-[0_18px_38px_rgba(10,35,70,0.16)] sm:p-9">
        {/* Decorative background */}

        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border border-white/10 bg-white/5" />

        <div className="pointer-events-none absolute bottom-[-110px] right-40 h-52 w-52 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-white/5 px-3 py-1.5 text-[11px] font-black tracking-[0.16em] text-amber-200">
              <ShieldCheck size={15} />
              AMI MAINTENANCE
            </span>

            <p className="mt-6 flex items-center gap-2 text-xs font-bold tracking-[0.17em] text-[#EEC46A]">
              <Hash size={14} />

              {complaint.complaintId || "COMPLAINT RECORD"}
            </p>

            <h1 className="mt-2 break-words text-3xl font-black tracking-tight sm:text-4xl">
              {complaint.title || complaint.subCategory || "Maintenance Issue"}
            </h1>

            <p className="mt-3 max-w-2xl whitespace-pre-wrap break-words text-sm leading-7 text-slate-200">
              {complaint.description ||
                "Complete maintenance request and progress details."}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Pill value={complaint.priority || "MEDIUM"} priority dark />

            <Pill value={complaint.status || "PENDING"} dark />
          </div>
        </div>

        <div className="relative mt-7 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/15 pt-5 text-xs text-slate-200">
          <span className="flex items-center gap-2">
            <CalendarDays size={16} className="text-[#EEC46A]" />
            Submitted {dateTime(complaint.createdAt)}
          </span>

          <span className="flex items-center gap-2">
            <MapPin size={16} className="text-[#EEC46A]" />

            {formatLocation(complaint)}
          </span>
        </div>
      </header>

      {/* ===============================================
          REFRESH ERROR
      =============================================== */}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle size={18} className="shrink-0" />
          {error} — showing the last loaded record.
        </div>
      )}

      {/* ===============================================
          COMPLAINT PROGRESS TRACKER
      =============================================== */}

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black">Complaint Progress</h2>

            <p className="mt-1 text-xs text-slate-500">
              Current status of your maintenance request
            </p>
          </div>

          {complaint.status === "REOPENED" && (
            <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
              Rework requested
            </span>
          )}

          {complaint.status === "WAITING_MATERIAL" && (
            <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
              Waiting for materials
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {STAGES.map((item, index) => {
            const active = stage === index;

            const done = stage > index;

            return (
              <div key={item} className="min-w-0">
                <div
                  className={`flex h-2 rounded-full ${
                    done
                      ? "bg-emerald-500"
                      : active
                        ? "bg-[#D9A946]"
                        : "bg-slate-100"
                  }`}
                />

                <div className="mt-3 flex flex-col items-start gap-1 sm:flex-row sm:items-center">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                      done
                        ? "bg-emerald-100 text-emerald-700"
                        : active
                          ? "bg-[#102746] text-amber-200"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {done ? <Check size={13} /> : index + 1}
                  </span>

                  <span
                    className={`text-[10px] font-bold leading-4 sm:text-xs ${
                      active || done ? "text-[#102746]" : "text-slate-400"
                    }`}
                  >
                    {item}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {complaint.status === "COMPLETED" && (
          <p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">
            Technician work completed. Your satisfaction confirmation is
            pending.
          </p>
        )}
      </div>

      {/* ===============================================
          TOP QUICK INFORMATION
      =============================================== */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric icon={Wrench} label="Category" value={complaint.category} />

        <Metric
          icon={MapPin}
          label="Location"
          value={formatLocation(complaint)}
        />

        <Metric
          icon={CalendarDays}
          label="Submitted On"
          value={dateTime(complaint.createdAt)}
        />

        <Metric
          icon={UserRound}
          label="Assigned Technician"
          value={personName(worker)}
        />
      </div>

      {/* ===============================================
          STUDENT SATISFACTION VERIFICATION
      =============================================== */}

      {canVerify && (
        <section className="overflow-hidden rounded-3xl border border-[#EAD4A1] bg-gradient-to-r from-[#FFFAED] to-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#B38730] shadow-sm">
                <ClipboardCheck size={25} />
              </span>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#A97D24]">
                  Action required
                </p>

                <h2 className="mt-1 text-lg font-black sm:text-xl">
                  Are you satisfied with the repair?
                </h2>

                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
                  The Technician has finished the work. Confirm whether your
                  complaint is resolved or needs further attention.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              {/* SATISFIED */}

              <button
                type="button"
                onClick={() => openVerification("SATISFIED")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-emerald-700"
              >
                <CheckCircle2 size={19} />
                Satisfied
              </button>

              {/* NOT SATISFIED */}

              <button
                type="button"
                onClick={() => openVerification("NOT_SATISFIED")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-5 py-3 text-sm font-extrabold text-rose-700 hover:bg-rose-50"
              >
                <AlertTriangle size={19} />
                Not Satisfied
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ===============================================
          SATISFIED CONFIRMATION
      =============================================== */}

      {isSatisfied && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
          <BadgeCheck size={22} className="shrink-0" />

          <div>
            <p className="font-black">Repair accepted by Student</p>

            <p className="mt-1">
              You verified the repair as satisfactory
              {verification.verifiedAt
                ? ` on ${dateTime(verification.verifiedAt)}`
                : ""}
              .
            </p>
          </div>
        </div>
      )}

      {/* ===============================================
          REOPENED MESSAGE
      =============================================== */}

      {isReopened && (
        <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm text-orange-900">
          <RotateCcw size={21} className="shrink-0" />

          <div>
            <p className="font-black">
              Complaint reopened — further work required
            </p>

            <p className="mt-1 whitespace-pre-wrap">
              {verification.reason ||
                complaint.reopenReason ||
                "Your request has been sent for further attention."}
            </p>
          </div>
        </div>
      )}

      {/* ===============================================
          COMPLETE COMPLAINT DETAILS GRID
      =============================================== */}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,1fr)]">
        {/* ============================================
            MAIN CONTENT - LEFT COLUMN
        ============================================ */}

        <div className="space-y-5">
          {/* COMPLAINT INFORMATION */}

          <Section
            icon={ClipboardList}
            title="Complaint Information"
            subtitle="All submitted details of this request"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem label="Complaint ID">
                {valueOrDash(complaint.complaintId)}
              </DetailItem>

              <DetailItem label="Complaint Area">
                {label(complaint.complaintArea)}
              </DetailItem>

              <DetailItem label="Category">
                {valueOrDash(complaint.category)}
              </DetailItem>

              <DetailItem label="Subcategory">
                {valueOrDash(complaint.subCategory)}
              </DetailItem>

              <DetailItem label="Priority">
                <Pill value={complaint.priority} priority />
              </DetailItem>

              <DetailItem label="Current Status">
                <Pill value={complaint.status} />
              </DetailItem>

              <DetailItem label="Issue Location">
                {valueOrDash(complaint.issueLocation)}
              </DetailItem>

              <DetailItem label="Assigned Department">
                {valueOrDash(complaint.assignedDepartment)}
              </DetailItem>

              {/* HOSTEL DETAILS */}

              {complaint.complaintArea === "HOSTEL" && (
                <>
                  <DetailItem label="Hostel">
                    {valueOrDash(complaint.hostel)}
                  </DetailItem>

                  <DetailItem label="Room Number">
                    {valueOrDash(complaint.roomNumber)}
                  </DetailItem>

                  <DetailItem label="Floor">
                    {valueOrDash(complaint.floor)}
                  </DetailItem>
                </>
              )}

              {/* ACADEMIC BLOCK DETAILS */}

              {complaint.complaintArea === "DEPARTMENT" && (
                <DetailItem label="Academic Block">
                  {valueOrDash(complaint.block)}
                </DetailItem>
              )}
            </div>
          </Section>

          {/* ============================================
              PROBLEM DESCRIPTION
          ============================================ */}

          <Section
            icon={FileText}
            title="Problem Description"
            subtitle="Issue reported by the Student"
          >
            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
              {valueOrDash(complaint.description)}
            </p>

            {/* HINDI TRANSLATION */}

            {(complaint.titleHindi || complaint.descriptionHindi) && (
              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Hindi Translation
                </p>

                {complaint.titleHindi && (
                  <p className="mt-2 font-bold">{complaint.titleHindi}</p>
                )}

                {complaint.descriptionHindi && (
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {complaint.descriptionHindi}
                  </p>
                )}
              </div>
            )}

            {/* ATTACHED IMAGE */}

            {complaint.image && /^https?:\/\//i.test(complaint.image) && (
              <a
                href={complaint.image}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#E5D4AC] bg-[#FFFAEE] px-4 py-2.5 text-sm font-bold text-[#996E20] hover:bg-amber-50"
              >
                <FileImage size={17} />
                View Attached Image
              </a>
            )}
          </Section>

          {/* ============================================
              VISIT AVAILABILITY
          ============================================ */}

          <Section
            icon={CalendarCheck2}
            title="Visit Availability & Schedule"
            subtitle="Student preferences and Manager confirmation"
          >
            {/* STUDENT PREFERRED SLOTS */}

            {preferences.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {preferences.map((slot, index) => (
                  <div
                    key={slot._id || `${slot.date}-${slot.startTime}-${index}`}
                    className="relative overflow-hidden rounded-2xl border border-[#F1DDAF] bg-[#FFFBF1] p-4"
                  >
                    <p className="text-[11px] font-black uppercase tracking-wider text-[#A67B27]">
                      Preference {slot.preference || index + 1}
                    </p>

                    <p className="mt-3 text-sm font-extrabold">
                      {visitDate(slot.date)}
                    </p>

                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                      <Clock3 size={14} />

                      {valueOrDash(slot.startTime)}

                      {" – "}

                      {valueOrDash(slot.endTime)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem label="Available From">
                  {valueOrDash(complaint.availableFrom)}
                </DetailItem>

                <DetailItem label="Available To">
                  {valueOrDash(complaint.availableTo)}
                </DetailItem>
              </div>
            )}

            {/* MANAGER CONFIRMED VISIT */}

            {visit.date && visit.startTime ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="flex items-center gap-2 text-sm font-black text-emerald-800">
                  <CheckCircle2 size={18} />
                  Manager-confirmed Visit
                </p>

                <p className="mt-2 text-sm font-semibold text-emerald-900">
                  {visitDate(visit.date)}

                  {" · "}

                  {visit.startTime}
                  {" – "}
                  {visit.endTime || "—"}
                </p>

                {visit.scheduledAt && (
                  <p className="mt-1 text-xs text-emerald-700">
                    Scheduled on {dateTime(visit.scheduledAt)}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <Clock3 size={15} />
                Final visit time not yet confirmed by the Manager.
              </p>
            )}
          </Section>

          {/* ============================================
              STATUS TIMELINE
          ============================================ */}

          <Section
            icon={ClipboardList}
            title="Complaint Activity Timeline"
            subtitle="Recorded status changes in chronological order"
          >
            <div className="space-y-0">
              {/* CREATED */}

              <div className="flex gap-4 pb-6">
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check size={19} />
                  </span>

                  {history.length > 0 && (
                    <span className="mt-2 w-px flex-1 bg-slate-200" />
                  )}
                </div>

                <div className="min-w-0 pb-1">
                  <p className="text-sm font-black">Complaint Submitted</p>

                  <p className="mt-1 text-xs text-slate-500">
                    {dateTime(complaint.createdAt)}
                  </p>
                </div>
              </div>

              {/* HISTORY EVENTS */}

              {history.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Current status: {label(complaint.status)}
                </p>
              ) : (
                history.map((event, index) => (
                  <div
                    key={event._id || `${event.status}-${index}`}
                    className="flex gap-4 pb-6 last:pb-0"
                  >
                    <div className="flex flex-col items-center">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF1D4] text-[#AD7F2D]">
                        <ChevronRight size={19} />
                      </span>

                      {index < history.length - 1 && (
                        <span className="mt-2 w-px flex-1 bg-slate-200" />
                      )}
                    </div>

                    <div className="min-w-0 pb-1">
                      <p className="text-sm font-black">
                        {label(event.status)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {dateTime(event.changedAt || event.updatedAt)}
                      </p>

                      {typeof event.changedBy === "object" &&
                        event.changedBy?.name && (
                          <p className="mt-1 text-xs text-slate-500">
                            Updated by {event.changedBy.name}
                          </p>
                        )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Section>
        </div>

        {/* ============================================
            RIGHT SIDEBAR
        ============================================ */}

        <aside className="space-y-5">
          {/* TECHNICIAN AND ASSIGNMENT */}

          <Section
            icon={UserRound}
            title="Technician & Assignment"
            subtitle="Assigned maintenance personnel"
          >
            {/* TECHNICIAN PROFILE */}

            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-[#F8FAFD] p-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#102746] text-[#F0C15E]">
                <UserRound size={23} />
              </span>

              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400">
                  Assigned Technician
                </p>

                <p className="truncate text-base font-black">
                  {personName(worker)}
                </p>

                {worker?.department && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {typeof worker.department === "object"
                      ? valueOrDash(worker.department.name)
                      : worker.department}
                  </p>
                )}
              </div>
            </div>

            {/* TECHNICIAN DETAILS */}

            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <DetailItem label="Created By">
                {personName(complaint.createdBy, "Student")}
              </DetailItem>

              <DetailItem label="Worker Assigned">
                {complaint.workerAssigned ? "Yes" : "Not yet"}
              </DetailItem>

              {worker?.phone && (
                <DetailItem label="Technician Contact">
                  <span className="inline-flex items-center gap-2">
                    <Phone size={15} />

                    {worker.phone}
                  </span>
                </DetailItem>
              )}

              <DetailItem label="Work Started">
                {dateTime(complaint.startedAt)}
              </DetailItem>

              <DetailItem label="Work Completed">
                {dateTime(complaint.completedAt)}
              </DetailItem>

              <DetailItem label="Student Resolution">
                {dateTime(complaint.resolvedAt)}
              </DetailItem>
            </div>

            {/* WORKER REMARKS */}

            <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                Worker Remarks
              </p>

              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                {valueOrDash(complaint.workerRemarks)}
              </p>
            </div>
          </Section>

          {/* ============================================
              MATERIALS AND MAINTENANCE
          ============================================ */}

          <Section
            icon={Package}
            title="Materials & Maintenance"
            subtitle="Repair materials and escalation information"
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <DetailItem label="Material Required">
                {complaint.materialRequired === true
                  ? "Yes"
                  : complaint.materialRequired === false
                    ? "No"
                    : "—"}
              </DetailItem>

              <DetailItem label="Material Decision">
                {label(complaint.materialDecision)}
              </DetailItem>

              <DetailItem label="Deadline">
                {dateTime(complaint.deadline)}
              </DetailItem>

              <DetailItem label="Last Updated">
                {dateTime(complaint.updatedAt)}
              </DetailItem>

              <DetailItem label="Escalated">
                {complaint.isEscalated ? "Yes" : "No"}
              </DetailItem>

              {complaint.isEscalated && (
                <DetailItem label="Escalation Reason">
                  {valueOrDash(complaint.escalationReason)}
                </DetailItem>
              )}
            </div>

            {/* MAINTENANCE REMARKS */}

            {(complaint.managerRemarks ||
              complaint.maintenanceRemarks ||
              complaint.remarks) && (
              <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Maintenance Remarks
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {complaint.managerRemarks ||
                    complaint.maintenanceRemarks ||
                    complaint.remarks}
                </p>
              </div>
            )}
          </Section>

          {/* ============================================
              STUDENT VERIFICATION HISTORY
          ============================================ */}

          <Section
            icon={ShieldCheck}
            title="Student Verification"
            subtitle="Satisfaction decision and reopen record"
          >
            <div className="space-y-3">
              <DetailItem label="Student Decision">
                {verification.decision
                  ? label(verification.decision)
                  : "Awaiting verification"}
              </DetailItem>

              <DetailItem label="Verified On">
                {dateTime(verification.verifiedAt)}
              </DetailItem>

              <DetailItem label="Reopen Count">
                {complaint.reopenCount ?? 0}
              </DetailItem>

              {verification.reason && (
                <DetailItem label="Student Feedback">
                  {verification.reason}
                </DetailItem>
              )}

              {complaint.reopenReason && (
                <DetailItem label="Last Reopen Reason">
                  {complaint.reopenReason}
                </DetailItem>
              )}

              {complaint.closedAt && (
                <DetailItem label="Closed On">
                  {dateTime(complaint.closedAt)}
                </DetailItem>
              )}
            </div>
          </Section>
        </aside>
      </div>

      {/* ===============================================
          BACK BUTTON
      =============================================== */}

      <div className="flex justify-end">
        <Link
          to="/complaints"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold hover:bg-slate-50"
        >
          <ArrowLeft size={17} />
          Back to My Complaints
        </Link>
      </div>

      {/* ===============================================
          STUDENT VERIFICATION MODAL
      =============================================== */}

      {modal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-verify-title"
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#06192E]/75 p-4 backdrop-blur-[3px]"
        >
          <form
            onSubmit={submitVerification}
            className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl"
          >
            {/* TOP ACCENT */}

            <div
              className={`h-1.5 ${
                modal === "SATISFIED" ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />

            <div className="p-6 sm:p-8">
              {/* MODAL HEADER */}

              <div className="flex items-start justify-between gap-4">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    modal === "SATISFIED"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {modal === "SATISFIED" ? (
                    <CheckCircle2 size={26} />
                  ) : (
                    <AlertTriangle size={26} />
                  )}
                </span>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setModal(null)}
                  aria-label="Close verification"
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X size={21} />
                </button>
              </div>

              {/* MODAL TITLE */}

              <h2
                id="student-verify-title"
                className="mt-4 text-xl font-black text-[#102746]"
              >
                {modal === "SATISFIED"
                  ? "Confirm Satisfactory Repair"
                  : "Tell Us What Is Still Wrong"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {complaint.complaintId}

                {" · "}

                {complaint.title || complaint.subCategory}
              </p>

              {/* SATISFIED CONFIRMATION */}

              {modal === "SATISFIED" ? (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                  By confirming, you accept the completed repair. The complaint
                  will be marked <strong>RESOLVED</strong>.
                </div>
              ) : (
                /* NOT SATISFIED REASON */

                <div className="mt-5">
                  <label
                    htmlFor="verification-reason"
                    className="block text-sm font-extrabold text-[#102746]"
                  >
                    Reason for Not Satisfied{" "}
                    <span className="text-rose-600">*</span>
                  </label>

                  <textarea
                    id="verification-reason"
                    autoFocus
                    required
                    rows={5}
                    maxLength={800}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Explain what is still not working and what needs to be fixed..."
                    className="mt-2 w-full resize-y rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-[#C99D46]"
                  />

                  <p className="mt-1 text-xs text-slate-500">
                    {reason.length}/800 · Minimum 5 characters. Manager will
                    receive your reason.
                  </p>
                </div>
              )}

              {/* MODAL ACTION BUTTONS */}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setModal(null)}
                  className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    (modal === "NOT_SATISFIED" && reason.trim().length < 5)
                  }
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50 ${
                    modal === "SATISFIED"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-[#102746] hover:bg-[#1B416D]"
                  }`}
                >
                  {submitting && <Loader2 size={17} className="animate-spin" />}

                  {submitting
                    ? "Submitting..."
                    : modal === "SATISFIED"
                      ? "Confirm Satisfied"
                      : "Submit & Reopen"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
