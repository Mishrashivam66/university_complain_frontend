import { useCallback, useEffect, useMemo, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BedDouble,
  BellRing,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  IdCard,
  LockKeyhole,
  Mail,
  MapPin,
  Megaphone,
  Pencil,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  UserRound,
  Users,
} from "lucide-react";

import api from "../../services/api";

// =====================================================
// AMI MAINTENANCE
// COMBINED STUDENT PROFILE + HOSTEL + WARDENS + NOTICES
// =====================================================

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}") || {};
  } catch {
    return {};
  }
};

const valueText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return String(
      value.name ||
        value.hostelName ||
        value.departmentName ||
        value.code ||
        value.hostelCode ||
        "",
    ).trim();
  }

  return String(value).trim();
};

const display = (value) => valueText(value) || "Not available";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isHostellerUser = (user) =>
  user?.isHosteller === true || user?.isHosteller === "true";

const wardenList = (value) => {
  const unique = new Map();

  for (const item of value) {
    if (!item || typeof item !== "object") continue;

    const key = String(
      item._id || item.id || item.email || `${item.name}-${item.phone}`,
    );

    unique.set(key, item);
  }

  return [...unique.values()];
};

const NOTICE_COLORS = {
  CRITICAL: "border-rose-200 bg-rose-50 text-rose-700",
  EMERGENCY: "border-rose-200 bg-rose-50 text-rose-700",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700",
  IMPORTANT: "border-orange-200 bg-orange-50 text-orange-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-700",
  NOTICE: "border-sky-200 bg-sky-50 text-sky-700",
};

// =====================================================
// SECTION COMPONENT
// =====================================================

function Section({ id, icon: Icon, title, subtitle, action, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_7px_30px_rgba(12,35,65,0.045)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF5DF] text-[#AE802D]">
            <Icon size={21} />
          </span>

          <div className="min-w-0">
            <h2 className="text-lg font-black text-[#102746]">{title}</h2>

            {subtitle && (
              <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>

        {action}
      </div>

      <div className="p-5 sm:p-7">{children}</div>
    </section>
  );
}

// =====================================================
// INFORMATION CARD
// =====================================================

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-[#F8FAFD] p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#B28634] shadow-sm">
        <Icon size={19} />
      </span>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500">{label}</p>

        <p className="mt-1 break-words text-sm font-extrabold text-[#102746]">
          {display(value)}
        </p>
      </div>
    </div>
  );
}

// =====================================================
// QUICK SUMMARY
// =====================================================

function SummaryTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Icon size={20} className="text-[#B38632]" />

      <p className="mt-3 text-lg font-black text-[#102746]">{value}</p>

      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

// =====================================================
// WARDEN CONTACT CARD
// =====================================================

function WardenCard({ warden, index }) {
  const phone = valueText(warden.phone);
  const email = valueText(warden.email);

  const tel = phone.replace(/[^\d+]/g, "");

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="h-1 bg-gradient-to-r from-[#102746] to-[#D6A94C]" />

      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#102746] text-[#E9BD64]">
            <UserRound size={24} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#B08635]">
              Warden {index + 1}
            </p>

            <h3 className="mt-1 break-words text-base font-black text-[#102746]">
              {display(warden.name)}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {display(warden.designation || "Hostel Warden")}
            </p>
          </div>

          <ShieldCheck size={19} className="shrink-0 text-emerald-600" />
        </div>

        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone size={16} className="shrink-0 text-[#B78A36]" />

            {phone ? (
              <a
                href={`tel:${tel}`}
                className="font-semibold hover:text-[#102746]"
              >
                {phone}
              </a>
            ) : (
              "Contact unavailable"
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail size={16} className="shrink-0 text-[#B78A36]" />

            {email ? (
              <a
                href={`mailto:${email}`}
                className="min-w-0 break-all font-semibold hover:text-[#102746]"
              >
                {email}
              </a>
            ) : (
              "Email unavailable"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// NOTICE CARD
// =====================================================

function NoticeCard({ notice }) {
  const priority = String(
    notice.priority || notice.type || "NOTICE",
  ).toUpperCase();

  const postedBy =
    typeof notice.createdBy === "object" ? notice.createdBy?.name : notice.by;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF4DE] text-[#B2832C]">
            <Megaphone size={20} />
          </span>

          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-extrabold ${
              NOTICE_COLORS[priority] || NOTICE_COLORS.NOTICE
            }`}
          >
            {priority}
          </span>
        </div>

        <h3 className="mt-4 break-words text-base font-black leading-6 text-[#102746]">
          {display(notice.title)}
        </h3>

        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
          {valueText(notice.message || notice.description) ||
            "No description provided"}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span className="flex items-center gap-2">
            <UserRound size={15} />

            {postedBy || "Administration"}
          </span>

          <span className="flex items-center gap-2">
            <CalendarDays size={15} />

            {formatDate(notice.createdAt || notice.date)}
          </span>
        </div>
      </div>
    </article>
  );
}

// =====================================================
// MAIN PROFILE
// =====================================================

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();

  // ===================================================
  // STATES
  // ===================================================

  const [user, setUser] = useState(getStoredUser);

  const [hostelInfo, setHostelInfo] = useState(null);

  const [hostelStudent, setHostelStudent] = useState(null);

  const [wardens, setWardens] = useState([]);

  const [notices, setNotices] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [profileError, setProfileError] = useState("");

  const [hostelError, setHostelError] = useState("");

  const [wardenError, setWardenError] = useState("");

  const [noticesError, setNoticesError] = useState("");

  const [wardenSource, setWardenSource] = useState("none");

  const [search, setSearch] = useState("");

  const [noticeFilter, setNoticeFilter] = useState("ALL");

  // ===================================================
  // FETCH ALL DATA
  // ===================================================

  const fetchEverything = useCallback(async (initial = false) => {
    if (initial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setProfileError("");
    setHostelError("");
    setWardenError("");
    setNoticesError("");

    const token = localStorage.getItem("token");

    const config = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {};

    try {
      // =============================================
      // PROFILE + NOTICES
      // =============================================

      const [profileResult, noticesResult] = await Promise.allSettled([
        api.get("/auth/profile", config),

        api.get("/student/notices", config),
      ]);

      let current = getStoredUser();

      if (
        profileResult.status === "fulfilled" &&
        profileResult.value.data?.user
      ) {
        current = {
          ...current,
          ...profileResult.value.data.user,
        };

        setUser(current);

        localStorage.setItem("user", JSON.stringify(current));
      } else {
        setUser(current);

        setProfileError("Latest profile could not be loaded.");
      }

      // =============================================
      // REAL NOTICES
      // =============================================

      if (noticesResult.status === "fulfilled") {
        const data = noticesResult.value.data || {};

        const records = data.announcements || data.notices || [];

        setNotices(Array.isArray(records) ? records : []);
      } else {
        setNotices([]);

        setNoticesError(
          noticesResult.reason?.response?.data?.message ||
            "Unable to load announcements",
        );
      }

      // =============================================
      // HOSTEL DATA FOR HOSTELLERS ONLY
      // =============================================

      if (!isHostellerUser(current)) {
        setHostelInfo(null);
        setHostelStudent(null);
        setWardens([]);
        setWardenSource("none");

        return;
      }

      // =============================================
      // EXISTING HOSTEL ENDPOINT
      // NEW ALL-WARDENS ENDPOINT
      // =============================================

      const [hostelResult, wardensResult] = await Promise.allSettled([
        api.get("/student/hostel/details", config),

        api.get("/student/hostel/wardens", config),
      ]);

      let legacyWarden = null;

      if (hostelResult.status === "fulfilled") {
        const data = hostelResult.value.data || {};

        setHostelInfo(data.hostel || null);

        setHostelStudent(data.student || null);

        legacyWarden = data.warden || null;
      } else {
        setHostelInfo(null);
        setHostelStudent(null);

        setHostelError(
          hostelResult.reason?.response?.data?.message ||
            "Unable to load hostel information",
        );
      }

      // =============================================
      // ALL WARDENS
      // =============================================

      if (
        wardensResult.status === "fulfilled" &&
        Array.isArray(wardensResult.value.data?.wardens)
      ) {
        setWardens(wardenList(wardensResult.value.data.wardens));

        setWardenSource("full");
      } else {
        // Keep compatibility with the old API.
        // This is NOT a complete warden list.

        setWardens(legacyWarden ? [legacyWarden] : []);

        setWardenSource("legacy");

        setWardenError(
          "Full warden directory is unavailable. Showing existing hostel contact if available.",
        );
      }
    } catch (error) {
      console.error("PROFILE FETCH ERROR:", error);

      setProfileError("Unable to refresh Student Profile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ===================================================
  // INITIAL LOADING
  // ===================================================

  useEffect(() => {
    fetchEverything(true);
  }, [fetchEverything]);

  // ===================================================
  // HANDLE DIRECT SECTION LINKS
  // ===================================================

  useEffect(() => {
    if (loading || !location.hash) {
      return;
    }

    const target = document.getElementById(location.hash.slice(1));

    target?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [loading, location.hash]);

  // ===================================================
  // DERIVED PROFILE / HOSTEL DATA
  // ===================================================

  const isHosteller = isHostellerUser(user);

  const accommodation = {
    hostel:
      hostelStudent?.hostel ||
      user.hostel ||
      hostelInfo?.hostelName ||
      hostelInfo?.name,

    block: hostelStudent?.block || user.block,

    roomNumber: hostelStudent?.roomNumber || user.roomNumber,

    floor: hostelStudent?.floor || user.floor,

    pocket: hostelStudent?.pocket || user.pocket,
  };

  const currentHostel = valueText(accommodation.hostel);

  // ===================================================
  // FILTER / SEARCH NOTICES
  //
  // Server must enforce notice visibility.
  // This UI uses records returned by /student/notices.
  // ===================================================

  const filteredNotices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...notices]
      .filter((notice) => {
        const priority = String(
          notice.priority || notice.type || "NOTICE",
        ).toUpperCase();

        const searchable = [
          notice.title,
          notice.message,
          notice.description,
          notice.createdBy?.name,
        ]
          .map((v) => valueText(v).toLowerCase())
          .join(" ");

        const important = [
          "CRITICAL",
          "EMERGENCY",
          "HIGH",
          "IMPORTANT",
        ].includes(priority);

        return (
          (noticeFilter === "ALL" || important) &&
          (!query || searchable.includes(query))
        );
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [notices, search, noticeFilter]);

  // ===================================================
  // SCROLL TO SECTION
  // ===================================================

  const goTo = (id) => {
    const target = document.getElementById(id);

    target?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white">
        <RefreshCw size={30} className="animate-spin text-[#B38832]" />

        <p className="mt-4 text-sm font-semibold text-slate-500">
          Loading your Student Profile...
        </p>
      </div>
    );
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <main className="mx-auto max-w-7xl space-y-6 pb-12 text-[#102746]">
      {/* ==========================================
          PREMIUM PROFILE HEADER
      ========================================== */}

      <header className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#081C36] via-[#12345D] to-[#1C4D7C] p-6 text-white shadow-[0_18px_45px_rgba(12,37,70,0.18)] sm:p-9">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/5" />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex min-w-0 flex-col items-start gap-5 sm:flex-row sm:items-center">
            {/* AVATAR */}

            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-4xl font-black text-[#F2CB78] shadow-inner">
              {String(user.name || "S")
                .charAt(0)
                .toUpperCase()}
            </div>

            {/* STUDENT INFO */}

            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-white/10 px-3 py-1 text-[11px] font-extrabold tracking-wider text-[#F2CB78]">
                <ShieldCheck size={14} />
                AMI MAINTENANCE
              </p>

              <h1 className="mt-3 break-words text-2xl font-black sm:text-4xl">
                {display(user.name)}
              </h1>

              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-200">
                <BadgeCheck size={16} />
                Student Profile
                <span className="text-slate-500">|</span>
                {isHosteller ? "Hosteller" : "Day Scholar"}
              </p>

              <p className="mt-2 break-all text-xs text-slate-300">
                {display(user.email)}
              </p>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={refreshing}
              onClick={() => fetchEverything(false)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              disabled={user.profileEditLocked}
              onClick={() => navigate("/edit-profile")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E9BD60] px-5 py-3 text-sm font-extrabold text-[#102746] hover:bg-[#F4CF7D] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {user.profileEditLocked ? (
                <LockKeyhole size={17} />
              ) : (
                <Pencil size={17} />
              )}

              {user.profileEditLocked ? "Profile Locked" : "Edit Profile"}
            </button>
          </div>
        </div>
      </header>

      {/* ==========================================
          LOAD ERRORS
      ========================================== */}

      {profileError && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle size={18} />
          {profileError}
        </div>
      )}

      {/* ==========================================
          PAGE NAVIGATION
      ========================================== */}

      <nav className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        {[
          ["personal", "Personal"],
          ["academic", "Academics"],
          ...(isHosteller
            ? [
                ["hostel", "Hostel"],
                ["wardens", "Wardens"],
              ]
            : []),
          ["notices", "Notices"],
        ].map(([id, title]) => (
          <button
            key={id}
            type="button"
            onClick={() => goTo(id)}
            className="rounded-xl bg-[#F3F6FA] px-4 py-2.5 text-xs font-extrabold text-[#17375B] hover:bg-[#E8EEF6]"
          >
            {title}
          </button>
        ))}
      </nav>

      {/* ==========================================
          SUMMARY TILES
      ========================================== */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryTile
          icon={ShieldCheck}
          label="Student Type"
          value={isHosteller ? "Hosteller" : "Day Scholar"}
        />

        <SummaryTile
          icon={Building2}
          label={isHosteller ? "Registered Hostel" : "Department"}
          value={
            isHosteller ? display(currentHostel) : display(user.department)
          }
        />

        <SummaryTile
          icon={Users}
          label="Assigned Wardens"
          value={isHosteller ? wardens.length : "—"}
        />

        <SummaryTile
          icon={BellRing}
          label="Available Notices"
          value={notices.length}
        />
      </div>

      {/* ==========================================
          PERSONAL INFORMATION
      ========================================== */}

      <Section
        id="personal"
        icon={User}
        title="Personal Information"
        subtitle="Registered contact and identity information"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard icon={User} label="Full Name" value={user.name} />

          <InfoCard icon={Mail} label="Email Address" value={user.email} />

          <InfoCard icon={Phone} label="Phone Number" value={user.phone} />

          <InfoCard icon={ShieldCheck} label="Account Role" value={user.role} />

          <InfoCard
            icon={Phone}
            label="Parent Contact"
            value={user.parentPhone}
          />

          <InfoCard
            icon={Phone}
            label="Emergency Contact"
            value={user.emergencyContact}
          />
        </div>

        {user.profileEditLocked && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <LockKeyhole size={18} className="shrink-0" />
            Your profile is currently locked for editing.
          </div>
        )}
      </Section>

      {/* ==========================================
          ACADEMIC INFORMATION
      ========================================== */}

      <Section
        id="academic"
        icon={GraduationCap}
        title="Academic Information"
        subtitle="Your registered university academic details"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard icon={IdCard} label="Amizone ID" value={user.amizoneId} />

          <InfoCard
            icon={Building2}
            label="Department"
            value={user.department}
          />

          <InfoCard icon={GraduationCap} label="Course" value={user.course} />

          <InfoCard icon={BookOpen} label="Academic Year" value={user.year} />

          <InfoCard
            icon={ClipboardList}
            label="Semester"
            value={user.semester}
          />

          <InfoCard icon={BadgeCheck} label="Section" value={user.section} />
        </div>
      </Section>

      {/* ==========================================
          HOSTEL INFORMATION
      ========================================== */}

      {isHosteller && (
        <Section
          id="hostel"
          icon={Building2}
          title="My Hostel & Accommodation"
          subtitle="Automatically linked with your registered Hostel"
        >
          {hostelError && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {hostelError}
            </div>
          )}

          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-[#102746] p-5 text-white">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#F0C36A]">
              <Building2 size={24} />
            </span>

            <div>
              <p className="text-xs text-slate-300">Registered Accommodation</p>

              <h3 className="mt-1 text-xl font-black">
                {display(currentHostel)}
              </h3>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <InfoCard
              icon={Building2}
              label="Hostel"
              value={accommodation.hostel}
            />

            <InfoCard icon={MapPin} label="Block" value={accommodation.block} />

            <InfoCard
              icon={BedDouble}
              label="Room Number"
              value={accommodation.roomNumber}
            />

            <InfoCard
              icon={Building2}
              label="Floor"
              value={accommodation.floor}
            />

            <InfoCard
              icon={Users}
              label="Pocket"
              value={accommodation.pocket}
            />
          </div>
        </Section>
      )}

      {/* ==========================================
          ALL ASSIGNED HOSTEL WARDENS
      ========================================== */}

      {isHosteller && (
        <Section
          id="wardens"
          icon={Users}
          title="My Hostel Wardens"
          subtitle={`Wardens assigned to ${currentHostel || "your Hostel"}`}
          action={
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-800">
              {wardens.length} Wardens
            </span>
          }
        >
          {wardenError && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
              <AlertTriangle size={17} />
              {wardenError}
            </div>
          )}

          {wardens.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {wardens.map((warden, index) => (
                <WardenCard
                  key={warden._id || warden.email || index}
                  warden={warden}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-[#F8FAFD] px-5 py-10 text-center">
              <Users size={33} className="mx-auto text-slate-300" />

              <h3 className="mt-3 text-sm font-extrabold">
                No assigned wardens available
              </h3>

              <p className="mt-2 text-xs text-slate-500">
                Wardens will appear when they are assigned to your registered
                Hostel and the directory API is available.
              </p>
            </div>
          )}

          {wardenSource === "full" && (
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={15} className="text-emerald-600" />
              Directory linked to your registered Hostel.
            </p>
          )}
        </Section>
      )}

      {/* ==========================================
          HOSTEL & STUDENT NOTICES
      ========================================== */}

      <Section
        id="notices"
        icon={BellRing}
        title="Notices & Announcements"
        subtitle="Latest announcements available to your Student account"
        action={
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-800">
            {notices.length} Notices
          </span>
        }
      >
        {noticesError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle size={18} />
            {noticesError}
          </div>
        )}

        {/* NOTICE FILTERS */}

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-3.5 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notice title, content or publisher..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 pl-11 text-sm outline-none focus:border-[#C49A45]"
            />
          </div>

          <div className="flex rounded-xl border border-slate-200 p-1">
            <button
              type="button"
              onClick={() => setNoticeFilter("ALL")}
              className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold ${
                noticeFilter === "ALL"
                  ? "bg-[#102746] text-white"
                  : "text-slate-600"
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setNoticeFilter("IMPORTANT")}
              className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold ${
                noticeFilter === "IMPORTANT"
                  ? "bg-[#102746] text-white"
                  : "text-slate-600"
              }`}
            >
              Important
            </button>
          </div>
        </div>

        {/* NOTICE RESULTS */}

        {filteredNotices.length > 0 ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {filteredNotices.map((notice, index) => (
              <NoticeCard
                key={notice._id || notice.id || index}
                notice={notice}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-[#F8FAFD] p-10 text-center">
            <BellRing size={35} className="mx-auto text-slate-300" />

            <h3 className="mt-3 font-extrabold">No notices found</h3>

            <p className="mt-2 text-sm text-slate-500">
              {search
                ? "Try a different search."
                : noticesError
                  ? "Announcements could not be loaded."
                  : "There are no matching announcements right now."}
            </p>
          </div>
        )}
      </Section>

      {/* ==========================================
          FOOTER
      ========================================== */}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <ShieldCheck size={15} />
          AMI MAINTENANCE
        </span>

        <button
          type="button"
          onClick={() => goTo("personal")}
          className="inline-flex items-center gap-1 font-bold text-[#102746]"
        >
          Back to top
          <ArrowRight size={14} className="-rotate-90" />
        </button>
      </div>
    </main>
  );
}
