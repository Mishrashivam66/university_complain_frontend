import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Users,
  Search,
  Filter,
  UserCheck,
  ShieldCheck,
  Building2,
  Phone,
  Trash2,
  BedDouble,
  Lock,
  Unlock,
  Home,
  CheckCircle2,
  Mail,
  GraduationCap,
  RefreshCw,
  Eye,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  UserRound,
} from "lucide-react";

import api from "../../services/api";

// ======================================================
// HELPERS
// ======================================================

const displayValue = (value, fallback = "N/A") => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return value.name || value.hostelName || value.code || fallback;
  }

  return String(value);
};

const initials = (name) => {
  return String(name || "Student")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};

const getHostel = (student) =>
  displayValue(student.hostel || student.assignedHostel);

const requestConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// ======================================================
// STATUS BADGE
// ======================================================

const StatusBadge = ({ approved }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
      approved
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-amber-200 bg-amber-50 text-amber-700"
    }`}
  >
    <span
      className={`h-2 w-2 rounded-full ${
        approved ? "bg-emerald-500" : "bg-amber-500"
      }`}
    />
    {approved ? "ACTIVE" : "PENDING"}
  </span>
);

// ======================================================
// KPI CARD
// ======================================================

const KPI = ({
  title,
  count,
  description,
  icon: Icon,
  variant,
  active,
  onClick,
}) => {
  const variants = {
    blue: {
      icon: "bg-blue-50 text-blue-700",
      bar: "bg-blue-600",
    },
    green: {
      icon: "bg-emerald-50 text-emerald-700",
      bar: "bg-emerald-600",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700",
      bar: "bg-amber-500",
    },
  };

  const style = variants[variant] || variants.blue;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative overflow-hidden rounded-2xl border bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        active
          ? "border-[#D8B663] ring-1 ring-[#D8B663]/40"
          : "border-slate-200 hover:border-[#D8B663]"
      }`}
    >
      <div className={`absolute inset-y-0 left-0 w-1 ${style.bar}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{title}</p>

          <h3 className="mt-3 text-3xl font-black tabular-nums text-[#092750]">
            {count}
          </h3>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}
        >
          <Icon size={23} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">{description}</p>

        <ArrowUpRight size={16} className="shrink-0 text-slate-400" />
      </div>
    </button>
  );
};

// ======================================================
// STUDENT DETAILS MODAL
// ======================================================

const DetailsModal = ({ student, onClose }) => {
  if (!student) return null;

  const details = [
    ["Full Name", displayValue(student.name), UserRound],
    ["Email", displayValue(student.email), Mail],
    ["Phone", displayValue(student.phone), Phone],
    ["Hostel", getHostel(student), Building2],
    ["Room Number", displayValue(student.roomNumber), BedDouble],
    ["Course", displayValue(student.course), GraduationCap],
    [
      "Profile Editing",
      student.profileEditLocked ? "Locked" : "Unlocked",
      student.profileEditLocked ? Lock : Unlock,
    ],
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06162C]/70 p-3 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Student details"
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-[#071C3A] to-[#104574] p-5 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-black">
              {initials(student.name)}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-[#E8C877]">
                Student Profile
              </p>

              <h3 className="mt-1 break-words text-xl font-extrabold">
                {displayValue(student.name)}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="rounded-xl p-2 hover:bg-white/15"
          >
            <X size={21} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-600">
              Hostel Access
            </span>

            <StatusBadge approved={student.isApproved} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {details.map(([label, value, Icon]) => (
              <div
                key={label}
                className="min-w-0 rounded-xl border border-slate-200 bg-[#F8FAFD] p-4"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Icon size={15} />
                  {label}
                </div>

                <p className="mt-2 break-words text-sm font-bold text-[#092750]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 p-4 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#092750] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#143D72]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ======================================================
// ACTION CONFIRMATION MODAL
// ======================================================

const ConfirmModal = ({ action, busy, onCancel, onConfirm }) => {
  if (!action) return null;

  const isDelete = action.type === "DELETE";
  const isRemove = action.type === "REMOVE_HOSTEL";

  const title = isDelete
    ? "Delete Student?"
    : isRemove
      ? "Remove Student From Hostel?"
      : "Confirm Action";

  const description = isDelete
    ? "This will call the permanent delete endpoint. The operation may not be reversible."
    : "This will remove the student's current hostel association. Verify the student has left the hostel before proceeding.";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#06162C]/70 p-4 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-2xl"
      >
        <div className="p-6">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
              isDelete
                ? "bg-red-100 text-red-600"
                : "bg-orange-100 text-orange-600"
            }`}
          >
            {isDelete ? <Trash2 size={25} /> : <AlertTriangle size={25} />}
          </div>

          <h3 className="mt-5 text-xl font-extrabold text-[#092750]">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            <strong>{displayValue(action.student?.name)}</strong>
            {" — "}
            {description}
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={busy}
              onClick={onCancel}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={onConfirm}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white disabled:opacity-50 ${
                isDelete
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {busy ? (
                <RefreshCw size={17} className="animate-spin" />
              ) : isDelete ? (
                <Trash2 size={17} />
              ) : (
                <Home size={17} />
              )}

              {busy
                ? "Processing..."
                : isDelete
                  ? "Delete Student"
                  : "Remove Hostel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ======================================================
// MAIN COMPONENT
// ======================================================

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const pageSize = 8;

  // ====================================================
  // FETCH STUDENTS
  // ====================================================

  const fetchStudents = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

      const res = await api.get("/warden/manage-students", requestConfig());

      setStudents(Array.isArray(res.data?.students) ? res.data.students : []);
    } catch (error) {
      console.error("FETCH STUDENTS ERROR:", error);

      const message =
        error.response?.data?.message || "Failed to fetch students.";

      setErrorMessage(message);
      toast.error(message, { duration: 2000 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ====================================================
  // APPROVE
  // ====================================================

  const approveStudent = async (id) => {
    if (busyId) return;

    try {
      setBusyId(id);

      await api.put(
        `/warden/student-profile/approve/${id}`,
        {},
        requestConfig(),
      );

      toast.success("Student approved successfully", {
        duration: 1500,
      });

      await fetchStudents(true);
    } catch (error) {
      console.error("APPROVE STUDENT ERROR:", error);

      toast.error(
        error.response?.data?.message || "Failed to approve student.",
        { duration: 2000 },
      );
    } finally {
      setBusyId(null);
    }
  };

  // ====================================================
  // PROFILE LOCK / UNLOCK
  // ====================================================

  const toggleProfileLock = async (student) => {
    if (busyId) return;

    try {
      setBusyId(student._id);

      const endpoint = student.profileEditLocked ? "unlock" : "lock";

      await api.put(
        `/warden/student-profile/${endpoint}/${student._id}`,
        {},
        requestConfig(),
      );

      toast.success(
        student.profileEditLocked
          ? "Profile unlocked successfully"
          : "Profile locked successfully",
        { duration: 1500 },
      );

      await fetchStudents(true);
    } catch (error) {
      console.error("PROFILE LOCK ERROR:", error);

      toast.error(
        error.response?.data?.message || "Failed to change profile lock.",
        { duration: 2000 },
      );
    } finally {
      setBusyId(null);
    }
  };

  // ====================================================
  // REMOVE HOSTEL / DELETE
  // Original API endpoints preserved
  // ====================================================

  const executeConfirmedAction = async () => {
    if (!confirmAction || busyId) return;

    const { type, student } = confirmAction;

    try {
      setBusyId(student._id);

      if (type === "REMOVE_HOSTEL") {
        await api.put(
          `/warden/student-profile/remove-hostel/${student._id}`,
          {},
          requestConfig(),
        );

        toast.success("Student removed from hostel", {
          duration: 1500,
        });
      } else if (type === "DELETE") {
        await api.delete(
          `/warden/student-profile/delete/${student._id}`,
          requestConfig(),
        );

        toast.success("Student deleted successfully", {
          duration: 1500,
        });
      }

      setConfirmAction(null);
      setSelectedStudent(null);

      await fetchStudents(true);
    } catch (error) {
      console.error("STUDENT ACTION ERROR:", error);

      toast.error(
        error.response?.data?.message || "Unable to complete the action.",
        { duration: 2000 },
      );
    } finally {
      setBusyId(null);
    }
  };

  // ====================================================
  // FILTERS
  // ====================================================

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const fields = [
        student.name,
        student.email,
        student.course,
        student.phone,
        student.roomNumber,
        getHostel(student),
      ]
        .map((value) => displayValue(value, ""))
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || fields.includes(query);

      const status = student.isApproved ? "ACTIVE" : "PENDING";

      const matchesStatus = filter === "ALL" || status === filter;

      return matchesSearch && matchesStatus;
    });
  }, [students, search, filter]);

  // ====================================================
  // COUNTS
  // ====================================================

  const totalStudents = students.length;

  const activeStudents = students.filter(
    (student) => student.isApproved,
  ).length;

  const pendingStudents = totalStudents - activeStudents;

  // ====================================================
  // PAGINATION
  // ====================================================

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));

  const currentPage = Math.min(page, totalPages);

  const displayedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const updateSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const updateFilter = (value) => {
    setFilter(value);
    setPage(1);
  };

  // ====================================================
  // STUDENT ACTION BUTTONS
  // ====================================================

  const renderStudentActions = (student) => {
    const isBusy = busyId === student._id;
    const anyBusy = Boolean(busyId);

    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedStudent(student)}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
        >
          <Eye size={16} />
          View
        </button>

        {!student.isApproved && (
          <button
            type="button"
            disabled={anyBusy}
            onClick={() => approveStudent(student._id)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isBusy ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            Approve
          </button>
        )}

        <button
          type="button"
          disabled={anyBusy}
          onClick={() => toggleProfileLock(student)}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
        >
          {student.profileEditLocked ? (
            <Unlock size={16} />
          ) : (
            <Lock size={16} />
          )}
          {student.profileEditLocked ? "Unlock" : "Lock"}
        </button>

        <button
          type="button"
          disabled={anyBusy}
          onClick={() =>
            setConfirmAction({
              type: "REMOVE_HOSTEL",
              student,
            })
          }
          className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-xs font-bold text-orange-700 hover:bg-orange-100 disabled:opacity-50"
        >
          <Home size={16} />
          Remove Hostel
        </button>

        <button
          type="button"
          disabled={anyBusy}
          onClick={() =>
            setConfirmAction({
              type: "DELETE",
              student,
            })
          }
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    );
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-200 border-t-[#D8B663]" />

            <Users size={26} className="text-[#092750]" />
          </div>

          <h2 className="text-lg font-bold text-[#092750]">
            Loading Student Records...
          </h2>
        </div>
      </div>
    );
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="min-w-0 space-y-6 pb-8">
      {/* ================================================
          HEADER
      ================================================ */}

      <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#061B3B] via-[#0B3264] to-[#14517B] p-5 text-white shadow-lg sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[30px] border-white/5" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E8C877]/30 bg-[#E8C877]/10 px-3 py-1.5">
              <ShieldCheck size={15} className="text-[#E8C877]" />

              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8C877]">
                Hostel Student Management
              </span>
            </div>

            <h1 className="text-2xl font-extrabold sm:text-3xl">
              Manage Students
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100/90">
              Monitor hostel residents, authorize student access and manage
              hostel membership and profile security.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchStudents(true)}
            disabled={refreshing}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/20 disabled:opacity-50"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>

      {/* ================================================
          STATISTICS
      ================================================ */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPI
          title="Total Students"
          count={totalStudents}
          description="All listed records"
          icon={Users}
          variant="blue"
          active={filter === "ALL"}
          onClick={() => updateFilter("ALL")}
        />

        <KPI
          title="Active Students"
          count={activeStudents}
          description="Approved hostel students"
          icon={UserCheck}
          variant="green"
          active={filter === "ACTIVE"}
          onClick={() => updateFilter("ACTIVE")}
        />

        <KPI
          title="Pending Students"
          count={pendingStudents}
          description="Awaiting authorization"
          icon={ShieldCheck}
          variant="amber"
          active={filter === "PENDING"}
          onClick={() => updateFilter("PENDING")}
        />
      </section>

      {/* ================================================
          SEARCH / FILTER
      ================================================ */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#092750]">
              Student Directory
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Search and manage assigned hostel students
            </p>
          </div>

          <span className="rounded-full bg-[#EDF2F9] px-3 py-1.5 text-xs font-bold text-[#092750]">
            {filteredStudents.length} Records
          </span>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Search name, email, course, phone, hostel..."
              className="w-full min-w-0 rounded-xl border border-slate-200 bg-[#F8FAFD] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#D8B663] focus:ring-2 focus:ring-[#D8B663]/20"
            />
          </div>

          <div className="relative">
            <Filter
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={filter}
              onChange={(event) => updateFilter(event.target.value)}
              className="w-full min-w-[170px] appearance-none rounded-xl border border-slate-200 bg-[#F8FAFD] py-3 pl-11 pr-9 text-sm font-semibold text-[#092750] outline-none focus:border-[#D8B663] md:w-auto"
            >
              <option value="ALL">All Students</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </section>

      {/* ================================================
          ERROR
      ================================================ */}

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={19} className="shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* ================================================
          STUDENT CARDS
      ================================================ */}

      {displayedStudents.length > 0 ? (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {displayedStudents.map((student) => (
            <article
              key={student._id}
              className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-[#D8B663] hover:shadow-lg"
            >
              {/* TOP */}
              <div className="p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF0F8] text-lg font-extrabold text-[#092750]">
                      {initials(student.name)}
                    </div>

                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-extrabold text-[#092750]">
                        {displayValue(student.name)}
                      </h3>

                      <p className="mt-1 flex items-start gap-2 break-all text-xs text-slate-500">
                        <Mail size={14} className="mt-0.5 shrink-0" />
                        {displayValue(student.email)}
                      </p>

                      <p className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                        <Phone size={14} />
                        {displayValue(student.phone)}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <StatusBadge approved={student.isApproved} />
                  </div>
                </div>

                {/* DETAILS */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Hostel",
                      value: getHostel(student),
                      icon: Building2,
                    },
                    {
                      label: "Room",
                      value: displayValue(student.roomNumber),
                      icon: BedDouble,
                    },
                    {
                      label: "Course",
                      value: displayValue(student.course),
                      icon: GraduationCap,
                    },
                    {
                      label: "Profile",
                      value: student.profileEditLocked ? "Locked" : "Unlocked",
                      icon: student.profileEditLocked ? Lock : Unlock,
                    },
                  ].map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="min-w-0 rounded-xl bg-[#F7F9FC] p-3"
                    >
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Icon size={15} />
                        {label}
                      </div>

                      <p className="mt-2 break-words text-sm font-bold text-[#092750]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="border-t border-slate-100 bg-[#FAFBFD] p-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Student Actions
                </p>

                {renderStudentActions(student)}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center">
          <Users size={37} className="mx-auto text-slate-300" />

          <h3 className="mt-4 font-bold text-[#092750]">No Students Found</h3>

          <p className="mt-2 text-sm text-slate-500">
            Try changing your search or status filter.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFilter("ALL");
              setPage(1);
            }}
            className="mt-4 rounded-xl bg-[#EDF2F9] px-4 py-2.5 text-sm font-bold text-[#092750]"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* ================================================
          PAGINATION
      ================================================ */}

      {filteredStudents.length > 0 && (
        <section className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:flex-row">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <strong className="text-[#092750]">
              {(currentPage - 1) * pageSize + 1}
            </strong>
            {" – "}
            <strong className="text-[#092750]">
              {Math.min(currentPage * pageSize, filteredStudents.length)}
            </strong>
            {" of "}
            <strong className="text-[#092750]">
              {filteredStudents.length}
            </strong>
            {" students"}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-slate-200 p-2 text-[#092750] hover:bg-slate-100 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="px-2 text-xs font-bold text-[#092750]">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
              className="rounded-lg border border-slate-200 p-2 text-[#092750] hover:bg-slate-100 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </section>
      )}

      {/* ================================================
          DETAILS MODAL
      ================================================ */}

      {selectedStudent && (
        <DetailsModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* ================================================
          CONFIRMATION MODAL
      ================================================ */}

      {confirmAction && (
        <ConfirmModal
          action={confirmAction}
          busy={Boolean(busyId)}
          onCancel={() => {
            if (!busyId) setConfirmAction(null);
          }}
          onConfirm={executeConfirmedAction}
        />
      )}
    </div>
  );
};

export default ManageStudents;
