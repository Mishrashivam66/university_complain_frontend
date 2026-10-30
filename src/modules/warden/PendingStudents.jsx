import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Filter,
  Building2,
  Phone,
  Clock3,
  UserCheck,
  Eye,
  CheckCircle2,
  X,
  Mail,
  DoorOpen,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  UserRound,
  CalendarDays,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

// ======================================================
// HELPERS
// ======================================================

const safeText = (value, fallback = "N/A") => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return value.name || value.hostelName || value.code || fallback;
  }

  return String(value);
};

const getHostel = (student) =>
  safeText(student?.hostel || student?.assignedHostel);

const isStudentApproved = (student) => student?.isApproved === true;

const getStudentInitials = (name) => {
  const parts = String(name || "Student")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "ST";

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

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
    {approved ? "Approved" : "Pending Approval"}
  </span>
);

// ======================================================
// STAT CARD
// ======================================================

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  type,
  active,
  onClick,
}) => {
  const styles = {
    blue: {
      icon: "bg-blue-50 text-blue-700",
      line: "bg-blue-600",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700",
      line: "bg-amber-500",
    },
    green: {
      icon: "bg-emerald-50 text-emerald-700",
      line: "bg-emerald-600",
    },
  };

  const style = styles[type] || styles.blue;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative overflow-hidden rounded-2xl border bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
        active
          ? "border-[#D6AC55] ring-1 ring-[#D6AC55]/30"
          : "border-slate-200 hover:border-[#D6AC55]"
      }`}
    >
      <div className={`absolute left-0 top-0 h-full w-1 ${style.line}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{title}</p>

          <h3 className="mt-3 text-3xl font-extrabold tabular-nums text-[#0A2850]">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}
        >
          <Icon size={23} />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">{subtitle}</p>
    </button>
  );
};

// ======================================================
// STUDENT DETAIL MODAL
// ======================================================

const StudentDetailsModal = ({ student, onClose, onApprove, approving }) => {
  useEffect(() => {
    if (!student) return;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !approving) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [student, onClose, approving]);

  if (!student) return null;

  const approved = isStudentApproved(student);

  const details = [
    {
      label: "Full Name",
      value: safeText(student.name),
      icon: UserRound,
    },
    {
      label: "Email Address",
      value: safeText(student.email),
      icon: Mail,
    },
    {
      label: "Phone Number",
      value: safeText(student.phone),
      icon: Phone,
    },
    {
      label: "Hostel",
      value: getHostel(student),
      icon: Building2,
    },
    {
      label: "Room Number",
      value: safeText(student.roomNumber),
      icon: DoorOpen,
    },
    {
      label: "Block",
      value: safeText(student.block),
      icon: Building2,
    },
  ];

  if (student.createdAt) {
    details.push({
      label: "Registration Date",
      value: formatDate(student.createdAt),
      icon: CalendarDays,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06152B]/70 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !approving) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Student details"
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-[26px] bg-white shadow-2xl"
      >
        <div className="shrink-0 bg-gradient-to-r from-[#071D3B] to-[#114477] p-5 text-white sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-xl font-extrabold">
                {getStudentInitials(student.name)}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#E8C877]">
                  Student Verification
                </p>

                <h2 className="mt-1 break-words text-xl font-extrabold">
                  {safeText(student.name)}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={approving}
              className="rounded-xl p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-50"
              aria-label="Close details"
            >
              <X size={21} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-600">
              Hostel Access Status
            </span>

            <StatusBadge approved={approved} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {details.map(({ label, value, icon: Icon }) => (
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

          {!approved && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <ShieldAlert
                size={19}
                className="mt-0.5 shrink-0 text-amber-700"
              />

              <p className="text-xs leading-6 text-amber-800">
                Verify the student's identity and hostel details before granting
                one-time hostel authorization.
              </p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-slate-200 bg-white p-4 sm:p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={approving}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
          >
            Close
          </button>

          {!approved && (
            <button
              type="button"
              onClick={() => onApprove(student._id)}
              disabled={approving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {approving ? (
                <RefreshCw size={17} className="animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
              {approving ? "Approving..." : "Approve Student"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ======================================================
// MAIN PAGE
// ======================================================

const PendingStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  // ====================================================
  // FETCH STUDENTS
  // ORIGINAL ENDPOINT PRESERVED
  // ====================================================

  const fetchStudents = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

      const token = localStorage.getItem("token");

      const res = await api.get("/warden/students/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data?.data;

      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("FETCH PENDING STUDENTS ERROR:", error);

      const message =
        error.response?.data?.message || "Failed to load students.";

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
  // APPROVE STUDENT
  // ORIGINAL ENDPOINT PRESERVED
  // ====================================================

  const approveStudent = async (id) => {
    if (!id || approvingId) return;

    try {
      setApprovingId(id);

      const token = localStorage.getItem("token");

      await api.put(
        `/warden/students/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Student approved successfully", {
        duration: 1500,
      });

      setStudents((previous) =>
        previous.map((student) =>
          student._id === id ? { ...student, isApproved: true } : student,
        ),
      );

      setSelectedStudent((previous) =>
        previous?._id === id ? { ...previous, isApproved: true } : previous,
      );

      await fetchStudents(true);
    } catch (error) {
      console.error("APPROVE STUDENT ERROR:", error);

      toast.error(error.response?.data?.message || "Student approval failed", {
        duration: 2000,
      });
    } finally {
      setApprovingId(null);
    }
  };

  // ====================================================
  // SEARCH / FILTER
  // ====================================================

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const hostel = getHostel(student);

      const searchableText = [
        student.name,
        student.email,
        hostel,
        student.roomNumber,
        student.phone,
        student.block,
      ]
        .map((value) => safeText(value, ""))
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      const approved = isStudentApproved(student);

      const matchesFilter =
        filter === "ALL" ||
        (filter === "APPROVED" && approved) ||
        (filter === "PENDING" && !approved);

      return matchesSearch && matchesFilter;
    });
  }, [students, search, filter]);

  // ====================================================
  // COUNTS
  // ====================================================

  const totalStudents = students.length;

  const approvedStudents = students.filter(isStudentApproved).length;

  const pendingStudents = students.filter(
    (student) => !isStudentApproved(student),
  ).length;

  // ====================================================
  // PAGINATION
  // ====================================================

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));

  const currentPage = Math.min(page, totalPages);

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const changeFilter = (nextFilter) => {
    setFilter(nextFilter);
    setPage(1);
  };

  const changeSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setFilter("ALL");
    setPage(1);
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-200 border-t-[#D4AA57]" />

            <ShieldCheck size={26} className="text-[#082650]" />
          </div>

          <div className="text-center">
            <h2 className="text-lg font-extrabold text-[#082650]">
              Loading Student Requests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Fetching hostel authorization records...
            </p>
          </div>
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

        <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E8C877]/30 bg-[#E8C877]/10 px-3 py-1.5">
              <ShieldCheck size={15} className="text-[#E8C877]" />

              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#E8C877]">
                Hostel Access Control
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Pending Students
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100/90">
              Review student details and authorize hostel access. Manage pending
              and approved student records securely from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchStudents(true)}
            disabled={refreshing}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />

            {refreshing ? "Refreshing..." : "Refresh Records"}
          </button>
        </div>
      </section>

      {/* ================================================
          STATS
      ================================================ */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtitle="Records returned by this page"
          icon={Users}
          type="blue"
          active={filter === "ALL"}
          onClick={() => changeFilter("ALL")}
        />

        <StatCard
          title="Pending Approval"
          value={pendingStudents}
          subtitle="Awaiting Warden authorization"
          icon={Clock3}
          type="amber"
          active={filter === "PENDING"}
          onClick={() => changeFilter("PENDING")}
        />

        <StatCard
          title="Approved Students"
          value={approvedStudents}
          subtitle="Already authorized"
          icon={UserCheck}
          type="green"
          active={filter === "APPROVED"}
          onClick={() => changeFilter("APPROVED")}
        />
      </section>

      {/* ================================================
          SEARCH + FILTER
      ================================================ */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-[#092750]">
              Student Requests
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Search and review hostel access requests
            </p>
          </div>

          <span className="rounded-full bg-[#EDF2F9] px-3 py-1.5 text-xs font-bold text-[#092750]">
            {filteredStudents.length} Records
          </span>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search name, email, hostel, room, phone..."
              value={search}
              onChange={(event) => changeSearch(event.target.value)}
              className="w-full min-w-0 rounded-xl border border-slate-200 bg-[#F8FAFD] py-3 pl-11 pr-4 text-sm text-[#092750] outline-none transition-all placeholder:text-slate-400 focus:border-[#D4AA57] focus:ring-2 focus:ring-[#D4AA57]/20"
            />
          </div>

          <div className="relative">
            <Filter
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <select
              value={filter}
              onChange={(event) => changeFilter(event.target.value)}
              className="w-full min-w-[180px] appearance-none rounded-xl border border-slate-200 bg-[#F8FAFD] py-3 pl-11 pr-9 text-sm font-semibold text-[#092750] outline-none focus:border-[#D4AA57] focus:ring-2 focus:ring-[#D4AA57]/20 md:w-auto"
            >
              <option value="ALL">All Students</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
            </select>
          </div>
        </div>
      </section>

      {/* ================================================
          FETCH ERROR
      ================================================ */}

      {errorMessage && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={19} />
            <span>{errorMessage}</span>
          </div>

          <button
            type="button"
            onClick={() => fetchStudents(true)}
            className="rounded-lg bg-red-100 px-3 py-2 font-bold hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* ================================================
          DESKTOP TABLE
      ================================================ */}

      <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-[#F5F8FC]">
                {[
                  "Student",
                  "Hostel",
                  "Room",
                  "Contact",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.map((student) => {
                const approved = isStudentApproved(student);
                const isApproving = approvingId === student._id;

                return (
                  <tr
                    key={student._id}
                    className="transition-colors hover:bg-[#F8FAFD]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF0F8] text-sm font-extrabold text-[#0A2850]">
                          {getStudentInitials(student.name)}
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[210px] truncate text-sm font-bold text-[#092750]">
                            {safeText(student.name)}
                          </p>

                          <p className="mt-1 max-w-[210px] truncate text-xs text-slate-500">
                            {safeText(student.email)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {getHostel(student)}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {safeText(student.roomNumber)}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {safeText(student.phone)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge approved={approved} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(student)}
                          title="View Student"
                          aria-label={`View ${safeText(student.name)} details`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 transition-colors hover:bg-blue-100"
                        >
                          <Eye size={17} />
                        </button>

                        {!approved && (
                          <button
                            type="button"
                            onClick={() => approveStudent(student._id)}
                            disabled={Boolean(approvingId)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isApproving ? (
                              <RefreshCw size={15} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={15} />
                            )}

                            {isApproving ? "Approving" : "Approve"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {paginatedStudents.length === 0 && (
          <div className="flex flex-col items-center px-4 py-14 text-center">
            <Users size={36} className="text-slate-300" />

            <h3 className="mt-3 font-bold text-[#092750]">
              No Student Records Found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try another search or change the status filter.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-lg bg-[#EDF2F9] px-4 py-2 text-sm font-bold text-[#092750]"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* ================================================
          MOBILE + TABLET CARDS
      ================================================ */}

      <section className="space-y-4 lg:hidden">
        {paginatedStudents.map((student) => {
          const approved = isStudentApproved(student);
          const isApproving = approvingId === student._id;

          return (
            <article
              key={student._id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF0F8] font-extrabold text-[#0A2850]">
                    {getStudentInitials(student.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-base font-extrabold text-[#092750]">
                      {safeText(student.name)}
                    </h3>

                    <p className="mt-1 break-all text-xs text-slate-500">
                      {safeText(student.email)}
                    </p>

                    <div className="mt-3">
                      <StatusBadge approved={approved} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Hostel",
                      value: getHostel(student),
                      icon: Building2,
                    },
                    {
                      label: "Room",
                      value: safeText(student.roomNumber),
                      icon: DoorOpen,
                    },
                    {
                      label: "Contact",
                      value: safeText(student.phone),
                      icon: Phone,
                    },
                    {
                      label: "Access",
                      value: approved ? "Authorized" : "Pending",
                      icon: ShieldCheck,
                    },
                  ].map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="min-w-0 rounded-xl bg-[#F7F9FC] p-3"
                    >
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Icon size={14} />
                        {label}
                      </div>

                      <p className="mt-2 break-words text-sm font-bold text-[#092750]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-100 bg-[#FAFBFD] p-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(student)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#092750] transition-colors hover:bg-slate-100"
                >
                  <Eye size={17} />
                  View Details
                </button>

                {!approved && (
                  <button
                    type="button"
                    onClick={() => approveStudent(student._id)}
                    disabled={Boolean(approvingId)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isApproving ? (
                      <RefreshCw size={17} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={17} />
                    )}

                    {isApproving ? "Approving..." : "Approve Student"}
                  </button>
                )}
              </div>
            </article>
          );
        })}

        {paginatedStudents.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
            <Users size={35} className="mx-auto text-slate-300" />

            <h3 className="mt-3 font-bold text-[#092750]">
              No Student Records Found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try adjusting your search or filter.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-lg bg-[#EDF2F9] px-4 py-2 text-sm font-bold text-[#092750]"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* ================================================
          PAGINATION
      ================================================ */}

      {filteredStudents.length > 0 && (
        <section className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:px-5">
          <p className="text-center text-xs text-slate-500 sm:text-left">
            Showing{" "}
            <span className="font-bold text-[#092750]">
              {(currentPage - 1) * pageSize + 1}
            </span>
            {" – "}
            <span className="font-bold text-[#092750]">
              {Math.min(currentPage * pageSize, filteredStudents.length)}
            </span>
            {" of "}
            <span className="font-bold text-[#092750]">
              {filteredStudents.length}
            </span>
            {" students"}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((previous) => Math.max(1, previous - 1))}
              disabled={currentPage <= 1}
              aria-label="Previous page"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-[#092750] hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="px-3 text-xs font-bold text-[#092750]">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((previous) => Math.min(totalPages, previous + 1))
              }
              disabled={currentPage >= totalPages}
              aria-label="Next page"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-[#092750] hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </section>
      )}

      {/* ================================================
          STUDENT DETAILS MODAL
      ================================================ */}

      {selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onApprove={approveStudent}
          approving={approvingId === selectedStudent._id}
        />
      )}
    </div>
  );
};

export default PendingStudents;
