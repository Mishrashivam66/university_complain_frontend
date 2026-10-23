import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import StudentComplaintControls from "./StudentComplaintControls";
import {
  ArrowDown,
  Building2,
  Download,
  Eye,
  FileSpreadsheet,
  GraduationCap,
  Loader2,
  RefreshCcw,
  Search,
  ShieldAlert,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import api from "../../services/api";

// ==============================================
// DATA HELPERS
// ==============================================

const text = (value) => {
  if (value == null) return "";

  if (typeof value === "object") {
    return String(
      value.hostelCode || value.code || value.hostelName || value.name || "",
    ).trim();
  }

  return String(value).trim();
};

const hostelCode = (value) => {
  const input = text(value);
  const match = input.match(/\bH\d+[A-Z]?\b/i);

  return (match ? match[0] : input).toUpperCase();
};

const studentHostel = (student) =>
  text(student.hostelCode || student.hostel || student.assignedHostel);

const isHosteller = (student) => {
  if (student.isHosteller === false) {
    return false;
  }

  return (
    student.isHosteller === true ||
    /^(HOSTELLER|HOSTEL)$/i.test(text(student.studentType)) ||
    Boolean(studentHostel(student))
  );
};

const isBlocked = (student) =>
  student.complaintAccessBlocked === true ||
  student.isComplaintBlocked === true;

const isGraduated = (student) =>
  student.isAlumni === true ||
  ["GRADUATED", "ALUMNI", "PASSED_OUT", "PASS_OUT"].includes(
    text(student.academicStatus).toUpperCase(),
  );

const accountStatus = (student) =>
  student.isActive === false ? "Inactive" : "Active";

const academicStatus = (student) =>
  text(student.academicStatus) || (isGraduated(student) ? "Graduated" : "—");

const errorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

// ==============================================
// SAFE EXCEL VALUES
// ==============================================

// Prevent spreadsheet formula injection
// from student-entered text.

const excelCell = (value) => {
  const str = text(value);

  return /^[\s]*[=+\-@]/.test(str) ? `'${str}` : str;
};

// ==============================================
// STUDENT EXCEL ROW
// ==============================================

const excelRow = (student) => ({
  "Student Name": excelCell(student.name),

  "Enrollment / Amizone ID": excelCell(
    student.enrollmentNumber || student.amizoneId || student.rollNumber,
  ),

  "Official Email": excelCell(student.email),

  Mobile: excelCell(student.phone || student.mobileNumber),

  "Student Type": isHosteller(student) ? "Hosteller" : "Day Scholar",

  "Academic Block": excelCell(
    student.departmentBlock || student.assignedBlock || student.academicBlock,
  ),

  Department: excelCell(student.department),

  Batch: excelCell(student.batch),

  Year: excelCell(student.year),

  "Academic Status": excelCell(academicStatus(student)),

  Hostel: excelCell(studentHostel(student)),

  "Room (Existing Reference)": excelCell(student.roomNumber),

  "Account Status": accountStatus(student),

  "Complaint Permission": isBlocked(student) ? "Blocked" : "Allowed",

  "Block Reason": excelCell(
    isBlocked(student) ? student.complaintBlockReason : "",
  ),
});

// ==============================================
// EXCEL HELPERS
// ==============================================

const safeSheetName = (value) =>
  text(value)
    .replace(/[\\/?*[\]:]/g, "-")
    .slice(0, 31) || "Hostel";

const safeFilePart = (value) =>
  text(value)
    .replace(/[^A-Za-z0-9_-]/g, "_")
    .slice(0, 32);

const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  })
    .format(new Date())
    .replaceAll("/", "-");

// ==============================================
// CREATE & DOWNLOAD WORKBOOK
// ==============================================

function saveWorkbook(sheets, fileName) {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(({ title, students }) => {
    const rows = students.map(excelRow);

    const worksheet = XLSX.utils.json_to_sheet(
      rows.length ? rows : [excelRow({})],
    );

    worksheet["!cols"] = [
      { wch: 25 },
      { wch: 25 },
      { wch: 32 },
      { wch: 18 },
      { wch: 16 },
      { wch: 20 },
      { wch: 24 },
      { wch: 16 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
      { wch: 24 },
      { wch: 18 },
      { wch: 22 },
      { wch: 42 },
    ];

    if (worksheet["!ref"]) {
      worksheet["!autofilter"] = {
        ref: worksheet["!ref"],
      };
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName(title));
  });

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    fileName,
  );
}

// ==============================================
// MANAGE STUDENTS
// ==============================================

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [hostels, setHostels] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedHostel, setSelectedHostel] = useState("ALL");

  const [studentFilter, setStudentFilter] = useState("ALL");

  const [viewStudent, setViewStudent] = useState(null);

  const listRef = useRef(null);

  // ==========================================
  // FETCH STUDENTS + DYNAMIC HOSTELS
  // ==========================================

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const [studentResult, hostelResult] = await Promise.allSettled([
        api.get("/admin/students"),

        api.get("/admin/hostels/all", {
          params: {
            includeArchived: "true",
          },
        }),
      ]);

      if (studentResult.status !== "fulfilled") {
        throw studentResult.reason;
      }

      const raw = studentResult.value.data?.students;

      if (!Array.isArray(raw)) {
        throw new Error("Student API returned an invalid list");
      }

      // Only student accounts.
      // Staff members belong to Manage Users.

      setStudents(
        raw.filter((student) => !student.role || student.role === "STUDENT"),
      );

      // Fetch Admin-created hostel master.

      if (hostelResult.status === "fulfilled") {
        setHostels(
          Array.isArray(hostelResult.value.data?.hostels)
            ? hostelResult.value.data.hostels
            : [],
        );
      } else {
        setHostels([]);
      }
    } catch (error) {
      toast.error(errorMessage(error, "Students could not be loaded"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ==========================================
  // DYNAMIC HOSTEL OPTIONS
  // ==========================================

  const hostelOptions = useMemo(() => {
    const map = new Map();

    hostels.forEach((hostel) => {
      const code = hostelCode(hostel.hostelCode || hostel.hostelName);

      if (code) {
        map.set(code, {
          code,
          label: text(hostel.hostelName) || code,
        });
      }
    });

    // Preserve hostels referenced by
    // historical student records as well.

    students.forEach((student) => {
      const raw = studentHostel(student);
      const code = hostelCode(raw);

      if (code && !map.has(code)) {
        map.set(code, {
          code,
          label: raw,
        });
      }
    });

    return [...map.values()].sort((a, b) =>
      a.code.localeCompare(b.code, undefined, { numeric: true }),
    );
  }, [hostels, students]);

  // ==========================================
  // LIVE STUDENT COUNTS
  // ==========================================

  const stats = useMemo(
    () => ({
      ALL: students.length,

      HOSTELLER: students.filter(isHosteller).length,

      DAY_SCHOLAR: students.filter((student) => !isHosteller(student)).length,

      BLOCKED: students.filter(isBlocked).length,

      GRADUATED: students.filter(isGraduated).length,

      ACTIVE: students.filter((student) => student.isActive !== false).length,
    }),
    [students],
  );

  // ==========================================
  // FILTER STUDENTS
  // ==========================================

  const visibleStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesType =
        studentFilter === "ALL" ||
        (studentFilter === "HOSTELLER" && isHosteller(student)) ||
        (studentFilter === "DAY_SCHOLAR" && !isHosteller(student)) ||
        (studentFilter === "BLOCKED" && isBlocked(student)) ||
        (studentFilter === "GRADUATED" && isGraduated(student)) ||
        (studentFilter === "ACTIVE" && student.isActive !== false);

      const matchesHostel =
        selectedHostel === "ALL" ||
        hostelCode(studentHostel(student)) === selectedHostel;

      const matchesSearch =
        !term ||
        [
          student.name,
          student.email,
          student.amizoneId,
          student.enrollmentNumber,
          student.rollNumber,
          studentHostel(student),
          student.department,
          student.batch,
        ].some((field) => text(field).toLowerCase().includes(term));

      return matchesType && matchesHostel && matchesSearch;
    });
  }, [students, search, selectedHostel, studentFilter]);

  // ==========================================
  // STAT CARD CLICK + SMOOTH SCROLL
  // ==========================================

  const applyStatFilter = (next) => {
    setStudentFilter(next);
    setSelectedHostel("ALL");
    setSearch("");

    requestAnimationFrame(() => {
      listRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  // ==========================================
  // EXCEL DOWNLOAD
  // ==========================================

  const download = (mode) => {
    if (loading || !students.length) {
      toast.error("No student data available for export");

      return;
    }

    // OPTION 1:
    // ALL STUDENTS, REGARDLESS OF FILTERS

    if (mode === "ALL") {
      saveWorkbook(
        [
          {
            title: "All Students",
            students,
          },
        ],

        `AmiMaintain_All_Students_${today()}.xlsx`,
      );
    }

    // OPTION 2:
    // ONE SELECTED HOSTEL
    else if (mode === "HOSTEL") {
      if (selectedHostel === "ALL") {
        toast.error("Please select a hostel first");

        return;
      }

      const matched = students.filter(
        (student) =>
          isHosteller(student) &&
          hostelCode(studentHostel(student)) === selectedHostel,
      );

      if (!matched.length) {
        toast.error("No students found in this hostel");

        return;
      }

      saveWorkbook(
        [
          {
            title: selectedHostel,
            students: matched,
          },
        ],

        `AmiMaintain_Hostel_${safeFilePart(selectedHostel)}_${today()}.xlsx`,
      );
    }

    // OPTION 3:
    // ALL HOSTELS, ONE SHEET PER HOSTEL
    else if (mode === "ALL_HOSTELS") {
      const sheets = hostelOptions
        .map(({ code }) => ({
          title: code,

          students: students.filter(
            (student) =>
              isHosteller(student) &&
              hostelCode(studentHostel(student)) === code,
          ),
        }))
        .filter((sheet) => sheet.students.length);

      if (!sheets.length) {
        toast.error("No hostel students available");

        return;
      }

      saveWorkbook(
        sheets,

        `AmiMaintain_All_Hostels_${today()}.xlsx`,
      );
    }

    // OPTION 4:
    // EXPORT CURRENT FILTERED VIEW
    else if (mode === "VIEW") {
      if (!visibleStudents.length) {
        toast.error("Current view is empty");

        return;
      }

      saveWorkbook(
        [
          {
            title: "Filtered Students",
            students: visibleStudents,
          },
        ],

        `AmiMaintain_Filtered_Students_${today()}.xlsx`,
      );
    }

    toast.success("Excel exported successfully");
  };

  // ==========================================
  // SUMMARY CARDS
  // ==========================================

  const statisticCards = [
    {
      key: "ALL",
      label: "All Students",
      icon: GraduationCap,
    },
    {
      key: "HOSTELLER",
      label: "Hostellers",
      icon: Building2,
    },
    {
      key: "DAY_SCHOLAR",
      label: "Day Scholars",
      icon: Users,
    },
    {
      key: "ACTIVE",
      label: "Active Accounts",
      icon: UserCheck,
    },
    {
      key: "BLOCKED",
      label: "Complaint Blocked",
      icon: ShieldAlert,
    },
    {
      key: "GRADUATED",
      label: "Graduated / Alumni",
      icon: GraduationCap,
    },
  ];

  // ==========================================
  // UI
  // ==========================================

  return (
    <main className="min-h-full bg-[#F5F7FC] px-3 py-5 text-[#10264B] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* HEADER */}

        <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-[#071B3B] to-[#173B71] p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#F2C66C]">
              AmiMaintain · Users & Access
            </p>

            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Manage Students
            </h1>

            <p className="mt-2 text-sm text-slate-200">
              All students, hostel-wise records, academic batches and complaint
              permissions.
            </p>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-3 text-sm font-bold disabled:opacity-50"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </header>

        {/* CLICKABLE STATISTICS */}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {statisticCards.map(({ key, label, icon: Icon }) => (
            <button
              type="button"
              key={key}
              onClick={() => applyStatFilter(key)}
              className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-amber-400 hover:shadow-md ${
                studentFilter === key ? "border-amber-400" : "border-slate-200"
              }`}
            >
              <Icon size={20} className="text-[#1A4177]" />

              <span className="mt-3 block text-2xl font-black tabular-nums">
                {stats[key]}
              </span>

              <span className="mt-1 block text-xs font-semibold text-slate-500">
                {label}
              </span>

              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                View records
                <ArrowDown size={12} />
              </span>
            </button>
          ))}
        </section>

        {/* EXCEL REPORTS */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="flex items-center gap-2 text-base font-extrabold">
            <FileSpreadsheet size={19} className="text-[#1A4177]" />
            Excel Reports
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            All Students aur All Hostels reports screen filters se independent
            hain.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* ALL STUDENTS */}

            <button
              type="button"
              disabled={loading || !students.length}
              onClick={() => download("ALL")}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#0B2B56] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              <Download size={16} />
              All Students Excel
            </button>

            {/* SELECTED HOSTEL */}

            <button
              type="button"
              disabled={loading || !students.length || selectedHostel === "ALL"}
              onClick={() => download("HOSTEL")}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#E7BB62] px-4 py-3 text-sm font-bold text-[#0C244A] disabled:opacity-50"
            >
              <Download size={16} />
              Selected Hostel Excel
            </button>

            {/* ALL HOSTELS */}

            <button
              type="button"
              disabled={loading || !students.length}
              onClick={() => download("ALL_HOSTELS")}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#193D75] px-4 py-3 text-sm font-bold text-[#113568] disabled:opacity-50"
            >
              <Download size={16} />
              All Hostels (Sheets)
            </button>

            {/* CURRENT VIEW */}

            <button
              type="button"
              disabled={loading || !visibleStudents.length}
              onClick={() => download("VIEW")}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold disabled:opacity-50"
            >
              <Download size={16} />
              Current View Excel
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Hostel-wise Excel ke liye neeche hostel filter se hostel select
            karo.
          </p>
        </section>

        {/* STUDENT RECORDS */}

        <section
          ref={listRef}
          className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black">Student Records</h2>

              <p className="text-sm text-slate-500">
                {visibleStudents.length} matching students
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedHostel("ALL");
                setStudentFilter("ALL");
              }}
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold"
            >
              Clear Filters
            </button>
          </div>

          {/* FILTERS */}

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_240px]">
            <label className="relative block">
              <Search
                size={17}
                className="absolute left-3.5 top-3.5 text-slate-400"
              />

              <input
                type="search"
                aria-label="Search students"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, email, Amizone ID, department, batch..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-amber-500"
              />
            </label>

            <select
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
              aria-label="Filter by hostel"
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-amber-500"
            >
              <option value="ALL">All Hostels / Day Scholars</option>

              {hostelOptions.map(({ code, label }) => (
                <option key={code} value={code}>
                  {label} ({code})
                </option>
              ))}
            </select>
          </div>

          {/* COMPACT STUDENT LIST */}

          {loading ? (
            <div className="flex justify-center py-16 text-[#193D75]">
              <Loader2 className="animate-spin" size={30} />
            </div>
          ) : visibleStudents.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              No students match these filters.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {visibleStudents.map((student) => (
                <article
                  key={student._id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center"
                >
                  {/* AVATAR */}

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDF2FB] font-extrabold text-[#153A70]">
                    {text(student.name).charAt(0).toUpperCase() || "S"}
                  </span>

                  {/* BASIC DETAILS */}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold">
                      {student.name || "Student"}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {student.email || "No email"}
                      {" · "}
                      {student.amizoneId || student.enrollmentNumber || "No ID"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {isHosteller(student)
                        ? studentHostel(student) || "Hosteller"
                        : "Day Scholar"}

                      {student.batch ? ` · Batch ${student.batch}` : ""}

                      {student.year ? ` · Year ${student.year}` : ""}
                    </p>
                  </div>

                  {/* STATUSES & ACTIONS */}

                  <div className="flex flex-wrap items-center gap-2">
                    {isBlocked(student) && (
                      <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-700">
                        Complaint Blocked
                      </span>
                    )}

                    {isGraduated(student) && (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                        Graduated
                      </span>
                    )}

                    <span
                      className={`rounded-full px-2 py-1 text-xs font-bold ${
                        student.isActive === false
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {accountStatus(student)}
                    </span>

                    <button
                      type="button"
                      onClick={() => setViewStudent(student)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#102D56] px-3 py-2 text-xs font-bold text-white"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* STUDENT DETAILS MODAL */}

      {/* ==========================================
    STUDENT DETAILS MODAL
    WITH ADMIN COMPLAINT BLOCK / UNBLOCK
========================================== */}

      {viewStudent && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#06142A]/75 p-3">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-details-title"
            className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* ======================================
          HEADER
      ====================================== */}

            <header className="flex shrink-0 items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2
                  id="student-details-title"
                  className="text-xl font-extrabold text-[#102D56]"
                >
                  Student Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {viewStudent.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewStudent(null)}
                aria-label="Close details"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </header>

            {/* ======================================
          SCROLLABLE CONTENT
      ====================================== */}

            <div className="min-h-0 flex-1 overflow-y-auto">
              {/* STUDENT INFORMATION */}

              <div className="grid gap-3 p-5 sm:grid-cols-2">
                {[
                  ["Name", viewStudent.name],

                  ["Email", viewStudent.email],

                  [
                    "Amizone / Enrollment",
                    viewStudent.amizoneId || viewStudent.enrollmentNumber,
                  ],

                  [
                    "Student Type",
                    isHosteller(viewStudent) ? "Hosteller" : "Day Scholar",
                  ],

                  [
                    "Academic Block",
                    viewStudent.departmentBlock ||
                      viewStudent.academicBlock ||
                      viewStudent.block,
                  ],

                  ["Department", viewStudent.department],

                  ["Batch", viewStudent.batch],

                  ["Year", viewStudent.year],

                  ["Academic Status", academicStatus(viewStudent)],

                  ["Hostel", studentHostel(viewStudent) || "—"],

                  ["Room (existing reference)", viewStudent.roomNumber],

                  ["Account Status", accountStatus(viewStudent)],

                  [
                    "Complaint Access",
                    isBlocked(viewStudent) ? "Blocked" : "Allowed",
                  ],

                  [
                    "Complaint Block Reason",
                    isBlocked(viewStudent)
                      ? viewStudent.complaintBlockReason
                      : "—",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <p className="text-xs font-semibold text-slate-500">
                      {label}
                    </p>

                    <p className="mt-1 break-words text-sm font-bold text-[#102D56]">
                      {text(value) || "—"}
                    </p>
                  </div>
                ))}
              </div>

              {/* ======================================
            ADMIN COMPLAINT ACCESS CONTROL
            BLOCK / UNBLOCK + REASON + HISTORY
        ====================================== */}

              <StudentComplaintControls
                student={viewStudent}
                onChanged={(updatedAccess) => {
                  const studentId = viewStudent._id;

                  // Update selected student modal
                  setViewStudent((previous) =>
                    previous && previous._id === studentId
                      ? {
                          ...previous,
                          ...updatedAccess,
                        }
                      : previous,
                  );

                  // Update main student list
                  setStudents((previous) =>
                    previous.map((student) =>
                      student._id === studentId
                        ? {
                            ...student,
                            ...updatedAccess,
                          }
                        : student,
                    ),
                  );
                }}
              />
            </div>

            {/* ======================================
          FOOTER
      ====================================== */}

            <footer className="flex shrink-0 justify-end border-t border-slate-200 bg-white p-4">
              <button
                type="button"
                onClick={() => setViewStudent(null)}
                className="rounded-xl bg-[#102D56] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#173D73]"
              >
                Close
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
