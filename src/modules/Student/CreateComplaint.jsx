import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  House,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import api from "../../services/api";
import { createComplaint } from "../../services/studentService";

// ==========================================
// AMI MAINTENANCE - CREATE COMPLAINT
// ==========================================

const WORK_START = 10 * 60;
const WORK_END = 17 * 60;
const MIN_DURATION = 120;
const TIME_STEP = 30;

const fieldStyle =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#102746] outline-none transition focus:border-[#C49A45] focus:ring-4 focus:ring-[#C49A45]/10";

const labelStyle = "mb-2 block text-sm font-semibold text-[#102746]";

const text = (value) => String(value ?? "").trim();

const normalized = (value) =>
  text(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

const toMinutes = (clock) => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(clock || "")) {
    return null;
  }

  const [hours, minutes] = clock.split(":").map(Number);
  return hours * 60 + minutes;
};

const toClock = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const formatTime = (clock) => {
  const minutes = toMinutes(clock);

  if (minutes === null) return "Not selected";

  const hour24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const hour12 = hour24 % 12 || 12;

  return `${hour12}:${String(mins).padStart(2, "0")} ${
    hour24 >= 12 ? "PM" : "AM"
  }`;
};

const makeOptions = (start, end) => {
  const result = [];

  for (let minute = start; minute <= end; minute += TIME_STEP) {
    const value = toClock(minute);

    result.push({
      value,
      label: formatTime(value),
    });
  }

  return result;
};

const START_OPTIONS = makeOptions(WORK_START, WORK_END - MIN_DURATION);

// ==========================================
// VISIT TIME VALIDATION
// ==========================================

function validateVisitTime(startTime, endTime) {
  if (!startTime || !endTime) {
    return "Please select both Start Time and End Time";
  }

  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  if (start === null || end === null) {
    return "Invalid maintenance visit time";
  }

  if (start < WORK_START || start > WORK_END - MIN_DURATION) {
    return "Start time must be between 10 AM and 3 PM";
  }

  if (end > WORK_END || end - start < MIN_DURATION) {
    return "Minimum 2 hours required, ending no later than 5 PM";
  }

  if (
    (start - WORK_START) % TIME_STEP !== 0 ||
    (end - WORK_START) % TIME_STEP !== 0
  ) {
    return "Please select time in 30-minute intervals";
  }

  return "";
}

// ==========================================
// PROFILE HELPERS
// ==========================================

function hostelCode(value) {
  const raw = text(value).toUpperCase();
  const detected = raw.match(/\bH\d+[A-Z]?\b/);

  if (detected) return detected[0];

  return normalized(value).replace(/^(BOYS|GIRLS|FACULTY|STAFF)?HOSTEL/, "");
}

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function studentHostel(user) {
  const value = user?.hostel;

  if (typeof value === "object" && value !== null) {
    return text(
      value.hostelCode || value.hostelName || value.name || value._id,
    );
  }

  return text(value);
}

function matchedHostel(hostel, user) {
  const own = hostelCode(studentHostel(user));

  if (!own) return false;

  return [hostel.code, hostel.name].some(
    (value) => !!value && hostelCode(value) === own,
  );
}

function departmentName(user) {
  const value = user?.department || user?.branch;

  if (typeof value === "object" && value !== null) {
    return text(value.departmentName || value.name);
  }

  return text(value);
}

function detectFloor(roomNumber) {
  const value = normalized(roomNumber);

  if (value.startsWith("G")) return "Ground Floor";
  if (value.startsWith("F")) return "First Floor";
  if (/^S[23]/.test(value)) return "Second Floor";

  return "";
}

// ==========================================
// INITIAL FORM
// NO DEFAULT TIME
// ==========================================

const initialForm = () => ({
  locationKey: "",
  complaintArea: "",
  hostel: "",
  block: "",
  roomNumber: "",
  floor: "",
  department: "",
  category: "",
  subCategory: "",
  customTitle: "",
  issueLocation: "",
  extraLocation: "",
  description: "",

  // Student must select both manually.
  preferredStartTime: "",
  preferredEndTime: "",
});

const emptyMaster = () => ({
  hostels: [],
  academicBlocks: [],
  otherLocations: [],
  categories: [],
});

// ==========================================
// REUSABLE SECTION
// ==========================================

function Section({ number, title, help, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(16,39,70,.05)] sm:p-8">
      <div className="mb-7 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#102746] font-extrabold text-[#F3C971]">
          {number}
        </span>

        <div>
          <h2 className="text-xl font-black text-[#102746] sm:text-2xl">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-relaxed text-slate-500">{help}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function CreateComplaint() {
  const navigate = useNavigate();
  const inFlight = useRef(false);

  const [user, setUser] = useState(readUser);
  const [master, setMaster] = useState(emptyMaster);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const isHosteller = user?.isHosteller === true;

  // ======================================
  // LOAD ADMIN CONFIGURATION
  // ======================================

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const [config, profile] = await Promise.allSettled([
      api.get("/student/complaint-form-config"),
      api.get("/auth/profile"),
    ]);

    if (config.status === "fulfilled" && config.value.data?.success !== false) {
      const data = config.value.data || {};

      const arr = (value) => (Array.isArray(value) ? [...value] : []);

      const byName = (a, b) =>
        text(a.name).localeCompare(text(b.name), undefined, {
          numeric: true,
          sensitivity: "base",
        });

      const byBlockCode = (a, b) =>
        text(a.code || a.name).localeCompare(
          text(b.code || b.name),
          undefined,
          {
            numeric: true,
            sensitivity: "base",
          },
        );

      setMaster({
        hostels: arr(data.hostels).sort(byName),
        academicBlocks: arr(data.academicBlocks).sort(byBlockCode),
        otherLocations: arr(data.otherLocations).sort(byName),
        categories: arr(data.categories).sort(byName),
      });
    } else {
      setError(
        config.status === "rejected"
          ? config.reason?.response?.data?.message ||
              "Unable to load locations from Admin"
          : "Invalid complaint form configuration",
      );
    }

    if (profile.status === "fulfilled") {
      const current = profile.value.data?.user;

      if (current) {
        setUser(current);
        localStorage.setItem("user", JSON.stringify(current));
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ======================================
  // SELECTED LOCATION
  // ======================================

  const selected = useMemo(() => {
    const [kind, id] = form.locationKey.split(":");

    const groups = {
      HOSTEL: master.hostels,
      BLOCK: master.academicBlocks,
      OTHER: master.otherLocations,
    };

    return (groups[kind] || []).find((item) => text(item.id) === id) || null;
  }, [form.locationKey, master]);

  const category = useMemo(
    () => master.categories.find((item) => item.name === form.category),
    [master, form.category],
  );

  const subCategories = Array.isArray(category?.subCategories)
    ? category.subCategories
    : [];

  const customTitle = !subCategories.length || form.subCategory === "__OTHER__";

  const title = customTitle ? text(form.customTitle) : text(form.subCategory);

  const location =
    selected?.type === "OTHER"
      ? selected.areas?.length
        ? `${selected.name} - ${form.issueLocation}`
        : selected.name
      : text(form.issueLocation);

  // ======================================
  // DYNAMIC END TIME OPTIONS
  // ======================================

  const endOptions = useMemo(() => {
    const start = toMinutes(form.preferredStartTime);

    if (start === null) return [];

    return makeOptions(start + MIN_DURATION, WORK_END);
  }, [form.preferredStartTime]);

  const duration = useMemo(() => {
    const start = toMinutes(form.preferredStartTime);
    const end = toMinutes(form.preferredEndTime);

    if (start === null || end === null || end <= start) {
      return 0;
    }

    return (end - start) / 60;
  }, [form.preferredStartTime, form.preferredEndTime]);

  const change = (key, value) => {
    setForm((old) => ({
      ...old,
      [key]: value,
    }));
  };

  // ======================================
  // START TIME CHANGE
  // END TIME ALWAYS RESET
  // ======================================

  const changeStartTime = (value) => {
    setForm((old) => ({
      ...old,
      preferredStartTime: value,
      preferredEndTime: "",
    }));
  };

  // ======================================
  // CHOOSE LOCATION
  // ======================================

  const chooseLocation = (value) => {
    if (!value) {
      setForm(initialForm());
      return;
    }

    const [kind, id] = value.split(":");

    const groups = {
      HOSTEL: master.hostels,
      BLOCK: master.academicBlocks,
      OTHER: master.otherLocations,
    };

    const place = (groups[kind] || []).find((item) => text(item.id) === id);

    if (!place) {
      toast.error("Invalid complaint location");
      return;
    }

    if (kind === "HOSTEL" && (!isHosteller || !matchedHostel(place, user))) {
      toast.error(
        "Hostel complaint is permitted only for your registered hostel",
      );
      return;
    }

    setForm((old) => ({
      ...old,
      locationKey: value,
      complaintArea:
        kind === "HOSTEL"
          ? "HOSTEL"
          : kind === "BLOCK"
            ? "DEPARTMENT"
            : "CAMPUS",
      hostel: kind === "HOSTEL" ? place.name : "",
      block: kind === "BLOCK" ? place.code : "",
      roomNumber: kind === "HOSTEL" ? text(user.roomNumber) : "",
      floor: kind === "HOSTEL" ? detectFloor(user.roomNumber) : "",
      department: kind === "BLOCK" ? departmentName(user) : "",
      issueLocation: "",
      extraLocation: "",
    }));
  };

  // ======================================
  // VALIDATION
  // ======================================

  const validate = (number) => {
    if (number === 1) {
      if (!selected) {
        return "Select a Hostel, Academic Block or Other Location";
      }

      if (
        selected.type === "HOSTEL" &&
        (!isHosteller || !matchedHostel(selected, user))
      ) {
        return "Only your registered hostel can be selected";
      }

      if (selected.type === "HOSTEL" && !text(user.roomNumber)) {
        return "Your registered room number is missing";
      }
    }

    if (number === 2) {
      if (!category) {
        return "Choose an Admin-created maintenance category";
      }

      if (!title || title.length > 150) {
        return "Select or enter an issue title (up to 150 characters)";
      }

      if (
        selected?.type === "OTHER" &&
        selected.areas?.length &&
        !selected.areas.includes(form.issueLocation)
      ) {
        return "Select an area configured by Admin";
      }

      if (selected?.type !== "OTHER" && !text(form.issueLocation)) {
        return "Enter the exact repair location";
      }

      if (text(form.description).length < 10) {
        return "Describe the issue in at least 10 characters";
      }

      if (text(form.description).length > 1300) {
        return "Description is too long";
      }

      if (location.length > 200) {
        return "Issue location must be within 200 characters";
      }
    }

    if (number === 3) {
      return validateVisitTime(form.preferredStartTime, form.preferredEndTime);
    }

    return "";
  };

  const navigateStep = (delta) => {
    if (delta > 0) {
      const problem = validate(step);

      if (problem) {
        toast.error(problem);
        return;
      }
    }

    setStep((old) => Math.max(1, Math.min(3, old + delta)));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ======================================
  // SUBMIT COMPLAINT
  // ======================================

  const submit = async (event) => {
    event.preventDefault();

    if (step !== 3 || inFlight.current) return;

    // Explicit time check before API request.
    const timeError = validateVisitTime(
      form.preferredStartTime,
      form.preferredEndTime,
    );

    if (timeError) {
      toast.error(timeError);
      return;
    }

    for (const number of [1, 2, 3]) {
      const problem = validate(number);

      if (problem) {
        toast.error(problem);
        setStep(number);
        return;
      }
    }

    inFlight.current = true;
    setSubmitting(true);

    const description = text(form.extraLocation)
      ? `${text(form.description)}\nLocation detail: ${text(
          form.extraLocation,
        )}`
      : text(form.description);

    const payload = {
      locationKey: form.locationKey,
      complaintArea: form.complaintArea,
      hostel: form.hostel,
      block: form.block,
      roomNumber: form.roomNumber,
      floor: form.floor,
      department: form.department,
      category: category.name,
      subCategory: title,
      title,
      description,
      issueLocation: location,
      priority: category.priority,

      preferredVisitTime: {
        startTime: form.preferredStartTime,
        endTime: form.preferredEndTime,
      },
    };

    try {
      const response = await createComplaint(payload);

      const complaint = response?.data?.complaint || response?.complaint || {};

      setSubmitted({
        id: complaint.complaintId || complaint._id || "Registered",
        title,
        location: selected.name,
        startTime: form.preferredStartTime,
        endTime: form.preferredEndTime,
      });

      setForm(initialForm());
      setStep(1);

      toast.success("Complaint registered successfully");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Submission not confirmed; check My Complaints before trying again",
      );
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  const timeSelected =
    form.preferredStartTime !== "" && form.preferredEndTime !== "";

  const timeValid =
    timeSelected &&
    !validateVisitTime(form.preferredStartTime, form.preferredEndTime);

  // ======================================
  // MAIN UI
  // ======================================

  return (
    <main className="mx-auto max-w-5xl space-y-6 pb-10 text-[#102746]">
      {/* HEADER */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#091F3C] via-[#102F56] to-[#184779] p-6 text-white shadow-lg sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-bold tracking-wider text-amber-200">
              <ShieldCheck size={15} />
              AMI MAINTENANCE
            </p>

            <h1 className="text-2xl font-black sm:text-3xl">
              Report a Maintenance Issue
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-200">
              Submit your complaint in three simple steps. Select a convenient
              maintenance visit window.
            </p>
          </div>

          <Wrench
            size={34}
            className="hidden shrink-0 text-amber-200 sm:block"
          />
        </div>
      </header>

      {/* PROGRESS */}
      <nav
        aria-label="Form progress"
        className="grid grid-cols-3 gap-2 sm:gap-3"
      >
        {[
          ["Location", MapPin],
          ["Issue Details", ClipboardList],
          ["Visit Time", Clock3],
        ].map(([stepLabel, Icon], index) => {
          const number = index + 1;

          return (
            <div
              key={stepLabel}
              className={`flex items-center gap-2 rounded-xl border p-3 ${
                step === number
                  ? "border-amber-300 bg-amber-50"
                  : step > number
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-white"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  step === number
                    ? "bg-[#102746] text-amber-200"
                    : step > number
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {step > number ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Icon size={18} />
                )}
              </span>

              <div className="min-w-0">
                <p className="text-[10px] text-slate-500">Step {number}</p>

                <p className="truncate text-xs font-bold sm:text-sm">
                  {stepLabel}
                </p>
              </div>
            </div>
          );
        })}
      </nav>

      {/* LOADING / ERROR / FORM */}
      {loading ? (
        <div className="flex min-h-60 flex-col items-center justify-center rounded-3xl bg-white">
          <Loader2 size={28} className="animate-spin text-amber-600" />
          <p className="mt-3 text-sm text-slate-500">
            Loading locations from Admin...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-white p-7 text-center">
          <p className="font-bold text-red-700">
            Unable to load complaint form
          </p>

          <p className="mt-2 text-sm text-slate-500">{error}</p>

          <button
            type="button"
            onClick={load}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#102746] px-5 py-3 text-sm font-bold text-white"
          >
            <RefreshCw size={17} />
            Retry
          </button>
        </div>
      ) : (
        <form onSubmit={submit}>
          {/* STEP 1 */}
          {step === 1 && (
            <Section
              number="01"
              title="Where is the problem?"
              help="Select an Admin-created Hostel, Academic Block or Other Location."
            >
              <label htmlFor="locationKey" className={labelStyle}>
                Complaint Location *
              </label>

              <div className="relative">
                <Building2
                  size={18}
                  className="pointer-events-none absolute left-4 top-3.5 text-amber-700"
                />

                <select
                  id="locationKey"
                  className={`${fieldStyle} pl-11`}
                  value={form.locationKey}
                  onChange={(event) => chooseLocation(event.target.value)}
                >
                  <option value="">
                    Select Hostel / Academic Block / Other Location
                  </option>

                  {master.hostels.length > 0 && (
                    <optgroup label="HOSTELS — ADMIN CREATED">
                      {master.hostels.map((item) => (
                        <option
                          key={item.id}
                          value={`HOSTEL:${item.id}`}
                          disabled={!isHosteller || !matchedHostel(item, user)}
                        >
                          {item.name}
                          {!isHosteller
                            ? " (Hostellers only)"
                            : !matchedHostel(item, user)
                              ? " (Not your hostel)"
                              : ""}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {master.academicBlocks.length > 0 && (
                    <optgroup label="ACADEMIC BLOCKS — ADMIN CREATED">
                      {master.academicBlocks.map((item) => (
                        <option key={item.id} value={`BLOCK:${item.id}`}>
                          {item.name}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {master.otherLocations.length > 0 && (
                    <optgroup label="OTHER LOCATIONS — ADMIN CREATED">
                      {master.otherLocations.map((item) => (
                        <option key={item.id} value={`OTHER:${item.id}`}>
                          {item.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {master.hostels.length +
                master.academicBlocks.length +
                master.otherLocations.length ===
                0 && (
                <p className="mt-3 text-sm text-amber-700">
                  No active locations available. Contact Admin.
                </p>
              )}

              {selected && (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-[#FFFAEF] p-5">
                  <div className="mb-4 flex items-center gap-2 font-extrabold">
                    {selected.type === "HOSTEL" ? (
                      <House size={19} />
                    ) : (
                      <Building2 size={19} />
                    )}

                    {selected.name}

                    <CheckCircle2
                      size={18}
                      className="ml-auto text-emerald-600"
                    />
                  </div>

                  {selected.type === "HOSTEL" ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelStyle}>Registered Room</label>

                        <input
                          readOnly
                          className={`${fieldStyle} bg-slate-50`}
                          value={form.roomNumber || "Not set in profile"}
                        />
                      </div>

                      <div>
                        <label className={labelStyle}>
                          Floor (auto-detected)
                        </label>

                        <input
                          readOnly
                          className={`${fieldStyle} bg-slate-50`}
                          value={form.floor || "Not detected"}
                        />
                      </div>
                    </div>
                  ) : selected.type === "BLOCK" ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelStyle}>Academic Block</label>

                        <input
                          readOnly
                          className={`${fieldStyle} bg-slate-50`}
                          value={selected.name}
                        />
                      </div>

                      <div>
                        <label className={labelStyle}>Department</label>

                        <input
                          readOnly
                          className={`${fieldStyle} bg-slate-50`}
                          value={form.department || "Not set in profile"}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">
                      You will select the exact area in Step 2.
                    </p>
                  )}
                </div>
              )}

              <p className="mt-4 flex items-start gap-2 text-xs text-slate-500">
                <ShieldCheck size={16} className="shrink-0 text-amber-700" />
                Admin manages location records. Hostel options are available
                only to the registered hosteller.
              </p>
            </Section>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <Section
              number="02"
              title="Describe the issue"
              help="Choose an Admin maintenance category and tell us the repair location."
            >
              <div className="space-y-5">
                <div>
                  <label className={labelStyle}>Maintenance Category *</label>

                  <select
                    className={fieldStyle}
                    value={form.category}
                    onChange={(event) =>
                      setForm((old) => ({
                        ...old,
                        category: event.target.value,
                        subCategory: "",
                        customTitle: "",
                      }))
                    }
                  >
                    <option value="">Select category</option>

                    {master.categories.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>

                  {category && (
                    <p className="mt-2 text-xs text-slate-500">
                      Default priority (Admin):{" "}
                      <strong>{category.priority}</strong>
                    </p>
                  )}

                  {!master.categories.length && (
                    <p className="mt-2 text-xs text-amber-700">
                      No active categories. Contact Admin.
                    </p>
                  )}
                </div>

                {subCategories.length > 0 && (
                  <div>
                    <label className={labelStyle}>Exact Issue *</label>

                    <select
                      className={fieldStyle}
                      value={form.subCategory}
                      onChange={(event) =>
                        change("subCategory", event.target.value)
                      }
                    >
                      <option value="">Select issue</option>

                      {subCategories.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}

                      <option value="__OTHER__">Other issue (describe)</option>
                    </select>
                  </div>
                )}

                {customTitle && (
                  <div>
                    <label className={labelStyle}>Issue Title *</label>

                    <input
                      className={fieldStyle}
                      maxLength={150}
                      placeholder="Describe the problem briefly"
                      value={form.customTitle}
                      onChange={(event) =>
                        change("customTitle", event.target.value)
                      }
                    />
                  </div>
                )}

                <div>
                  <label className={labelStyle}>Exact Issue Location *</label>

                  {selected?.type === "OTHER" ? (
                    selected.areas?.length ? (
                      <select
                        className={fieldStyle}
                        value={form.issueLocation}
                        onChange={(event) =>
                          change("issueLocation", event.target.value)
                        }
                      >
                        <option value="">Select Admin-created area</option>

                        {selected.areas.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        readOnly
                        className={`${fieldStyle} bg-slate-50`}
                        value={selected.name}
                      />
                    )
                  ) : (
                    <input
                      className={fieldStyle}
                      value={form.issueLocation}
                      maxLength={150}
                      onChange={(event) =>
                        change("issueLocation", event.target.value)
                      }
                      placeholder="Room / Lab / Corridor / exact repair point"
                    />
                  )}
                </div>

                <div>
                  <label className={labelStyle}>
                    Additional Location Detail (Optional)
                  </label>

                  <input
                    className={fieldStyle}
                    maxLength={120}
                    value={form.extraLocation}
                    onChange={(event) =>
                      change("extraLocation", event.target.value)
                    }
                    placeholder="Landmark or access instructions"
                  />
                </div>

                <div>
                  <label className={labelStyle}>Problem Description *</label>

                  <textarea
                    rows={5}
                    maxLength={1300}
                    className={`${fieldStyle} resize-y`}
                    value={form.description}
                    onChange={(event) =>
                      change("description", event.target.value)
                    }
                    placeholder="Describe what is damaged, how long it has been happening, and the assistance needed..."
                  />

                  <p className="mt-1 text-right text-xs text-slate-400">
                    {form.description.length}/1300
                  </p>
                </div>
              </div>
            </Section>
          )}

          {/* STEP 3 - MANDATORY VISIT TIME */}
          {step === 3 && (
            <Section
              number="03"
              title="When are you available?"
              help="Manually select Start Time and End Time between 10 AM and 5 PM. Minimum availability is 2 hours."
            >
              <div className="space-y-6">
                <div className="rounded-2xl border border-amber-200 bg-[#FFFAEF] p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="rounded-xl bg-[#102746] p-3 text-amber-200">
                      <Clock3 size={22} />
                    </span>

                    <div>
                      <h3 className="font-extrabold text-[#102746]">
                        Preferred Maintenance Visit Time
                      </h3>

                      <p className="text-xs text-slate-500">
                        Working hours: 10:00 AM – 5:00 PM (IST)
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* START TIME */}
                    <div>
                      <label
                        htmlFor="preferredStartTime"
                        className={labelStyle}
                      >
                        Start Time *
                      </label>

                      <select
                        id="preferredStartTime"
                        className={fieldStyle}
                        value={form.preferredStartTime}
                        onChange={(event) =>
                          changeStartTime(event.target.value)
                        }
                        required
                      >
                        <option value="" disabled>
                          Select Start Time
                        </option>

                        {START_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* END TIME */}
                    <div>
                      <label htmlFor="preferredEndTime" className={labelStyle}>
                        End Time *
                      </label>

                      <select
                        id="preferredEndTime"
                        className={`${fieldStyle} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                        value={form.preferredEndTime}
                        onChange={(event) =>
                          change("preferredEndTime", event.target.value)
                        }
                        disabled={!form.preferredStartTime}
                        required
                      >
                        <option value="" disabled>
                          Select End Time
                        </option>

                        {endOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {!form.preferredStartTime && (
                    <p className="mt-4 text-xs font-semibold text-amber-800">
                      Please select Start Time first.
                    </p>
                  )}

                  {form.preferredStartTime && !form.preferredEndTime && (
                    <p className="mt-4 text-xs font-semibold text-amber-800">
                      Now select End Time. Minimum duration is 2 hours.
                    </p>
                  )}

                  <p className="mt-4 text-xs leading-5 text-slate-600">
                    Both fields are mandatory. The end time must be at least 2
                    hours after the start time. You may select a longer window
                    if convenient.
                  </p>
                </div>

                {/* SELECTED TIME SUMMARY */}
                <div
                  className={`rounded-2xl border p-5 ${
                    timeValid
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 text-sm font-bold ${
                      timeValid ? "text-emerald-800" : "text-slate-600"
                    }`}
                  >
                    {timeValid ? (
                      <CheckCircle2 size={19} />
                    ) : (
                      <Clock3 size={19} />
                    )}
                    Your Selected Availability
                  </div>

                  <p className="mt-3 text-xl font-black text-[#102746] sm:text-2xl">
                    {formatTime(form.preferredStartTime)}
                    {" – "}
                    {formatTime(form.preferredEndTime)}
                  </p>

                  {timeValid ? (
                    <p className="mt-2 text-sm font-semibold text-emerald-800">
                      Duration: {duration} hours
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">
                      Select both times to complete your availability.
                    </p>
                  )}
                </div>

                {/* WHAT HAPPENS NEXT */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <strong>What happens next?</strong>

                  <p className="mt-2 leading-6">
                    Your complaint will be submitted to the Maintenance Manager.
                    The Manager can assign a Technician and coordinate a visit
                    based on your preferred availability. This is a preferred
                    visit window, not a guaranteed appointment or resolution
                    deadline.
                  </p>
                </div>

                {/* COMPLAINT SUMMARY */}
                <div className="rounded-2xl border bg-slate-50 p-4 text-sm">
                  <p className="mb-3 font-bold">Complaint Summary</p>

                  <div className="space-y-2">
                    <p>
                      <span className="text-slate-500">Location:</span>{" "}
                      {selected?.name}
                    </p>

                    <p>
                      <span className="text-slate-500">Category:</span>{" "}
                      {category?.name}
                    </p>

                    <p>
                      <span className="text-slate-500">Issue:</span> {title}
                    </p>

                    <p>
                      <span className="text-slate-500">Priority:</span>{" "}
                      {category?.priority}
                    </p>

                    <p>
                      <span className="text-slate-500">Preferred Time:</span>{" "}
                      {formatTime(form.preferredStartTime)}
                      {" – "}
                      {formatTime(form.preferredEndTime)}
                    </p>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* NAVIGATION */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => navigateStep(-1)}
              disabled={step === 1 || submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-6 py-3.5 text-sm font-bold disabled:opacity-40"
            >
              <ArrowLeft size={17} />
              Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => navigateStep(1)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102746] px-7 py-3.5 text-sm font-bold text-white"
              >
                Continue
                <ArrowRight size={17} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting || !timeValid}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E7B953] px-7 py-3.5 text-sm font-extrabold text-[#102746] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ClipboardList size={18} />
                    Submit Complaint
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      )}

      {/* SUCCESS MODAL */}
      {submitted && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06192F]/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="complaint-success"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8">
            <CheckCircle2 size={54} className="mx-auto text-emerald-600" />

            <h2 id="complaint-success" className="mt-4 text-2xl font-black">
              Complaint Submitted!
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Your complaint has been registered.
            </p>

            <div className="mt-6 space-y-2 rounded-2xl bg-slate-50 p-4 text-left text-sm">
              <p>
                <strong>Complaint ID:</strong> {submitted.id}
              </p>

              <p>
                <strong>Issue:</strong> {submitted.title}
              </p>

              <p>
                <strong>Location:</strong> {submitted.location}
              </p>

              <p>
                <strong>Preferred Time:</strong>{" "}
                {formatTime(submitted.startTime)}
                {" – "}
                {formatTime(submitted.endTime)}
              </p>

              <p>
                <strong>Status:</strong> PENDING
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/complaints")}
              className="mt-6 w-full rounded-xl bg-[#102746] px-5 py-3 font-bold text-white"
            >
              View My Complaints
            </button>

            <button
              type="button"
              onClick={() => setSubmitted(null)}
              className="mt-3 w-full rounded-xl border py-3 text-sm font-semibold"
            >
              Create Another Complaint
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
