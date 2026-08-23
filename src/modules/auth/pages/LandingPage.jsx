import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Database,
  GraduationCap,
  Landmark,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

// ==========================================
// LANDING COMPONENTS
// ==========================================

import Header from "../components/Header";

import LandingHero from "../components/LandingHero";

import FeaturesSelector from "../components/FeaturesSelection";

import PremiumInfoSection from "../components/PremiumInfoSection";

import PortalDemo from "../components/PortalDemo";

import ContactSection from "../components/ContactSection";

import DevelopersSection from "../components/DevelopersSection";

// ==========================================
// API
// ==========================================

import api from "../../../services/api";

// ==========================================
// DEFAULT STATS
// ==========================================

const DEFAULT_STATS = {
  totalStudents: null,

  activeStudents: null,

  activeWardens: null,

  openComplaints: null,

  resolvedToday: null,

  totalResolved: null,
};

// ==========================================
// FORMAT NUMBER
// ==========================================

const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN").format(Number(value));
};

// ==========================================
// LANDING PAGE
// ==========================================

export default function LandingPage() {
  // ==========================================
  // BACKEND STATS
  // ==========================================

  const [stats, setStats] = useState(DEFAULT_STATS);

  const [statsLoading, setStatsLoading] = useState(true);

  const [statsConnected, setStatsConnected] = useState(false);

  // ==========================================
  // FETCH LIVE LANDING STATS
  // ==========================================

  useEffect(() => {
    const fetchLandingStats = async () => {
      try {
        setStatsLoading(true);

        // ==================================
        // BACKEND:
        // /api/common/landing-stats
        //
        // api.js already contains /api
        // ==================================

        const response = await api.get("/common/landing-stats");

        console.log("LANDING STATS RESPONSE:", response.data);

        if (response?.data?.success && response?.data?.stats) {
          setStats({
            ...DEFAULT_STATS,

            ...response.data.stats,
          });

          setStatsConnected(true);
        } else {
          setStatsConnected(false);
        }
      } catch (error) {
        console.log("LANDING STATS ERROR:", error);

        setStatsConnected(false);

        setStats(DEFAULT_STATS);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchLandingStats();
  }, []);

  // ==========================================
  // RESOLUTION RATE
  // ==========================================

  const resolutionRate = useMemo(() => {
    const resolved = Number(stats.totalResolved) || 0;

    const open = Number(stats.openComplaints) || 0;

    const total = resolved + open;

    if (!total) {
      return null;
    }

    return Math.round((resolved / total) * 100);
  }, [stats.totalResolved, stats.openComplaints]);

  // ==========================================
  // MAIN LIVE STATS
  // ==========================================

  const liveStats = [
    {
      label: "Registered Students",

      value: statsLoading ? "..." : formatNumber(stats.totalStudents),

      description: "Students registered in the CampusNexus ERP system.",

      icon: GraduationCap,

      iconClass: "from-[#1D4ED8] via-[#2563EB] to-[#60A5FA]",

      glow: "bg-blue-500/15",
    },

    {
      label: "Open Complaints",

      value: statsLoading ? "..." : formatNumber(stats.openComplaints),

      description: "Complaints currently active within campus workflows.",

      icon: ClipboardCheck,

      iconClass: "from-[#7A0019] via-[#A61B3C] to-[#E0526E]",

      glow: "bg-red-500/15",
    },

    {
      label: "Resolved Today",

      value: statsLoading ? "..." : formatNumber(stats.resolvedToday),

      description: "Complaints resolved or closed today through the ERP.",

      icon: CheckCircle2,

      iconClass: "from-[#047857] via-[#059669] to-[#34D399]",

      glow: "bg-emerald-500/15",
    },

    {
      label: "Active Wardens",

      value: statsLoading ? "..." : formatNumber(stats.activeWardens),

      description: "Wardens currently active in hostel operations.",

      icon: UserCheck,

      iconClass: "from-[#B7791F] via-[#D4A72C] to-[#F4C430]",

      glow: "bg-yellow-400/15",
    },
  ];

  return (
    <div
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#06101D]
        text-white
      "
    >
      {/* ======================================
          HEADER
      ====================================== */}

      <Header />

      {/* ======================================
          MAIN
      ====================================== */}

      <main id="main-content">
        {/* ==================================
            HERO
        ================================== */}

        <LandingHero />

        {/* ==================================
            ACTUAL ERP DATABASE SNAPSHOT
        ================================== */}

        <section
          id="live-campus-snapshot"
          className="
            relative
            overflow-hidden

            border-y
            border-white/10

            bg-gradient-to-b
            from-[#071321]
            via-[#091827]
            to-[#071120]

            py-24
            md:py-28
          "
        >
          {/* BACKGROUND GRID */}

          <div
            className="
              pointer-events-none

              absolute
              inset-0

              opacity-[0.035]

              bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]

              bg-[size:68px_68px]
            "
          />

          {/* BLUE GLOW */}

          <div
            className="
              pointer-events-none

              absolute
              left-1/2
              top-[-180px]

              h-[500px]
              w-[950px]

              -translate-x-1/2

              rounded-full

              bg-blue-600/15

              blur-[170px]
            "
          />

          {/* GOLD GLOW */}

          <div
            className="
              pointer-events-none

              absolute
              -right-32
              bottom-[-120px]

              h-[400px]
              w-[400px]

              rounded-full

              bg-yellow-400/10

              blur-[150px]
            "
          />

          {/* MAROON GLOW */}

          <div
            className="
              pointer-events-none

              absolute
              -left-32
              bottom-[-120px]

              h-[400px]
              w-[400px]

              rounded-full

              bg-[#7A0019]/10

              blur-[150px]
            "
          />

          <div
            className="
              relative
              z-10

              mx-auto
              max-w-7xl

              px-6
              md:px-10
            "
          >
            {/* ==================================
                HEADER AREA
            ================================== */}

            <div
              className="
                flex
                flex-col
                gap-8

                lg:flex-row
                lg:items-end
                lg:justify-between
              "
            >
              <div
                className="
                  max-w-4xl
                "
              >
                {/* BADGE */}

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2

                    rounded-full

                    border
                    border-blue-400/20

                    bg-blue-400/[0.08]

                    px-5
                    py-2.5

                    text-sm
                    font-bold
                    text-blue-200

                    backdrop-blur-xl
                  "
                >
                  <Database size={17} />
                  Campus ERP Snapshot
                </div>

                {/* TITLE */}

                <h2
                  className="
                    mt-6

                    text-4xl
                    font-black
                    leading-tight
                    text-white

                    md:text-6xl
                  "
                >
                  Real Campus Data.
                  <br />
                  <span
                    className="
                      bg-gradient-to-r
                      from-[#60A5FA]
                      via-white
                      to-[#F4C430]

                      bg-clip-text
                      text-transparent
                    "
                  >
                    Direct From The ERP.
                  </span>
                </h2>

                {/* DESCRIPTION */}

                <p
                  className="
                    mt-6

                    max-w-3xl

                    text-base
                    leading-8
                    text-slate-300

                    md:text-lg
                  "
                >
                  These operational statistics are retrieved directly from the
                  CampusNexus backend and MongoDB database rather than using
                  hard-coded demonstration values.
                </p>
              </div>

              {/* ==================================
                  CONNECTION STATUS
              ================================== */}

              <div
                className={`
                  inline-flex
                  w-fit
                  items-center
                  gap-3

                  rounded-2xl

                  border

                  px-5
                  py-3

                  text-sm
                  font-bold

                  ${
                    statsConnected
                      ? `
                        border-emerald-400/20
                        bg-emerald-400/[0.08]
                        text-emerald-300
                      `
                      : `
                        border-slate-500/20
                        bg-slate-500/[0.08]
                        text-slate-400
                      `
                  }
                `}
              >
                <span
                  className={`
                    h-2.5
                    w-2.5

                    rounded-full

                    ${
                      statsConnected
                        ? `
                          bg-emerald-400
                          shadow-[0_0_12px_rgba(52,211,153,.8)]
                        `
                        : "bg-slate-500"
                    }
                  `}
                />

                {statsLoading
                  ? "Connecting to ERP..."
                  : statsConnected
                    ? "Connected to Campus ERP"
                    : "ERP Data Unavailable"}
              </div>
            </div>

            {/* ==================================
                PRIMARY LIVE STAT CARDS
            ================================== */}

            <div
              className="
                mt-14

                grid
                grid-cols-1
                gap-5

                sm:grid-cols-2
                xl:grid-cols-4
              "
            >
              {liveStats.map((item, index) => {
                const Icon = item.icon;

                return (
                  <article
                    key={index}
                    className="
                        group

                        relative
                        overflow-hidden

                        rounded-[30px]

                        border
                        border-white/10

                        bg-[#0C192A]/85

                        p-6

                        shadow-[0_20px_55px_rgba(0,0,0,.28)]

                        backdrop-blur-xl

                        transition-all
                        duration-500

                        hover:-translate-y-2
                        hover:border-white/20
                      "
                  >
                    {/* CARD COLOR LINE */}

                    <div
                      className={`
                          absolute
                          left-0
                          top-0

                          h-[3px]
                          w-full

                          bg-gradient-to-r

                          ${item.iconClass}
                        `}
                    />

                    {/* GLOW */}

                    <div
                      className={`
                          pointer-events-none

                          absolute
                          -right-14
                          -top-14

                          h-40
                          w-40

                          rounded-full

                          ${item.glow}

                          blur-3xl
                        `}
                    />

                    {/* ICON */}

                    <div
                      className={`
                          relative

                          flex
                          h-14
                          w-14
                          items-center
                          justify-center

                          rounded-2xl

                          bg-gradient-to-br

                          ${item.iconClass}

                          shadow-lg

                          transition-transform
                          duration-500

                          group-hover:scale-105
                        `}
                    >
                      <Icon size={25} className="text-white" />
                    </div>

                    {/* VALUE */}

                    <p
                      className="
                          relative

                          mt-7

                          text-4xl
                          font-black
                          text-white

                          md:text-5xl
                        "
                    >
                      {item.value}
                    </p>

                    {/* LABEL */}

                    <h3
                      className="
                          relative

                          mt-3

                          text-base
                          font-extrabold
                          text-white
                        "
                    >
                      {item.label}
                    </h3>

                    {/* DESCRIPTION */}

                    <p
                      className="
                          relative

                          mt-3

                          text-sm
                          leading-6
                          text-slate-400
                        "
                    >
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>

            {/* ==================================
                SECONDARY STATS
            ================================== */}

            <div
              className="
                mt-6

                grid
                grid-cols-1
                gap-4

                md:grid-cols-3
              "
            >
              <SmallStat
                icon={<Users size={19} />}
                label="Active Students"
                value={
                  statsLoading ? "..." : formatNumber(stats.activeStudents)
                }
                iconClass="
                  bg-blue-500/10
                  text-blue-300
                "
              />

              <SmallStat
                icon={<CheckCircle2 size={19} />}
                label="Total Resolved"
                value={statsLoading ? "..." : formatNumber(stats.totalResolved)}
                iconClass="
                  bg-emerald-500/10
                  text-emerald-300
                "
              />

              <SmallStat
                icon={<BarChart3 size={19} />}
                label="Resolution Rate"
                value={
                  statsLoading
                    ? "..."
                    : resolutionRate === null
                      ? "—"
                      : `${resolutionRate}%`
                }
                iconClass="
                  bg-yellow-400/10
                  text-yellow-300
                "
              />
            </div>

            {/* ==================================
                DATABASE NOTE
            ================================== */}

            <div
              className="
                mt-6

                flex
                items-start
                gap-3

                rounded-2xl

                border
                border-white/[0.07]

                bg-white/[0.025]

                px-5
                py-4
              "
            >
              <ShieldCheck
                size={18}
                className="
                  mt-0.5
                  shrink-0
                  text-emerald-400
                "
              />

              <p
                className="
                  text-xs
                  leading-6
                  text-slate-500
                "
              >
                Only aggregated campus statistics are displayed on the public
                landing page. Individual student or complaint information
                remains inside authenticated ERP dashboards.
              </p>
            </div>
          </div>
        </section>

        {/* ==================================
            ERP FEATURES
        ================================== */}

        <FeaturesSelector />

        {/* ==================================
            INSTITUTIONAL / SOLUTIONS
        ================================== */}

        <PremiumInfoSection />

        {/* ==================================
            ERP PLATFORM DEMO
        ================================== */}

        <PortalDemo />

        {/* ==================================
            CONTACT
        ================================== */}

        <ContactSection />

        {/* ==================================
            DEVELOPMENT TEAM
        ================================== */}

        <DevelopersSection />
      </main>

      {/* ======================================
          FOOTER
      ====================================== */}

      <footer
        className="
          relative
          overflow-hidden

          border-t
          border-white/10

          bg-[#040A14]

          pb-10
          pt-20
        "
      >
        {/* GRID */}

        <div
          className="
            pointer-events-none

            absolute
            inset-0

            opacity-[0.025]

            bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]

            bg-[size:70px_70px]
          "
        />

        {/* GOLD GLOW */}

        <div
          className="
            pointer-events-none

            absolute
            left-1/2
            top-0

            h-[300px]
            w-[900px]

            -translate-x-1/2

            bg-yellow-400/10

            blur-[160px]
          "
        />

        <div
          className="
            relative

            mx-auto
            max-w-7xl

            px-6
            md:px-10
          "
        >
          {/* ==================================
              LIVE FOOTER METRICS
          ================================== */}

          <div
            className="
              grid
              grid-cols-2
              gap-4

              lg:grid-cols-4
            "
          >
            <FooterMetric
              value={statsLoading ? "..." : formatNumber(stats.totalStudents)}
              label="Registered Students"
              accent="text-blue-300"
            />

            <FooterMetric
              value={statsLoading ? "..." : formatNumber(stats.totalResolved)}
              label="Resolved Issues"
              accent="text-emerald-300"
            />

            <FooterMetric
              value={statsLoading ? "..." : formatNumber(stats.activeWardens)}
              label="Active Wardens"
              accent="text-yellow-300"
            />

            <FooterMetric
              value={statsLoading ? "..." : formatNumber(stats.openComplaints)}
              label="Open Complaints"
              accent="text-red-300"
            />
          </div>

          {/* ==================================
              BRAND
          ================================== */}

          <div
            className="
              mt-16

              flex
              flex-col
              items-center
              justify-center

              text-center
            "
          >
            {/* LOGO */}

            <div
              className="
                flex
                h-20
                w-20
                items-center
                justify-center

                rounded-[26px]

                bg-gradient-to-br
                from-[#2563EB]
                via-[#3B82F6]
                to-[#F4C430]

                shadow-[0_20px_60px_rgba(59,130,246,.25)]
              "
            >
              <Landmark className="text-white" size={35} />
            </div>

            {/* NAME */}

            <h2
              className="
                mt-6

                text-4xl
                font-black
                text-white
              "
            >
              CampusNexus
            </h2>

            <p
              className="
                mt-2

                text-[10px]
                font-bold
                uppercase
                tracking-[0.45em]
                text-blue-200/60
              "
            >
              Smart Campus ERP
            </p>

            {/* DESCRIPTION */}

            <p
              className="
                mt-6
                max-w-3xl

                text-sm
                leading-7
                text-slate-400

                md:text-base
              "
            >
              A centralized digital platform for campus complaints, hostel
              operations, maintenance workflows, material management and
              administrative coordination.
            </p>

            {/* TRUST PILLS */}

            <div
              className="
                mt-7

                flex
                flex-wrap
                justify-center
                gap-3
              "
            >
              <TrustPill icon={<ShieldCheck size={14} />} text="Role Based" />

              <TrustPill icon={<Database size={14} />} text="Centralized" />

              <TrustPill
                icon={<ClipboardCheck size={14} />}
                text="Workflow Driven"
              />

              <TrustPill icon={<Activity size={14} />} text="Trackable" />
            </div>

            {/* CONNECTION STATUS */}

            <div
              className={`
                mt-7

                inline-flex
                items-center
                gap-2

                rounded-full

                border

                px-4
                py-2

                text-xs
                font-bold

                ${
                  statsConnected
                    ? `
                      border-emerald-400/15
                      bg-emerald-400/[0.06]
                      text-emerald-300
                    `
                    : `
                      border-white/10
                      bg-white/[0.03]
                      text-slate-500
                    `
                }
              `}
            >
              <span
                className={`
                  h-2
                  w-2
                  rounded-full

                  ${statsConnected ? "bg-emerald-400" : "bg-slate-600"}
                `}
              />

              {statsConnected ? "Campus ERP Data Connected" : "Campus ERP"}
            </div>
          </div>

          {/* ==================================
              COPYRIGHT
          ================================== */}

          <div
            className="
              mt-14

              flex
              flex-col
              items-center
              justify-between
              gap-3

              border-t
              border-white/10

              pt-7

              text-center

              md:flex-row
              md:text-left
            "
          >
            <p
              className="
                text-xs
                text-slate-500

                md:text-sm
              "
            >
              © {new Date().getFullYear()} CampusNexus ERP. All rights reserved.
            </p>

            <p
              className="
                text-xs
                text-slate-500

                md:text-sm
              "
            >
              Smart Campus Management Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// SMALL STAT
// ==========================================

const SmallStat = ({ icon, label, value, iconClass }) => {
  return (
    <div
      className="
        flex
        items-center
        gap-4

        rounded-2xl

        border
        border-white/10

        bg-white/[0.035]

        px-5
        py-4

        transition-all
        duration-300

        hover:bg-white/[0.05]
      "
    >
      <div
        className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center

          rounded-xl

          ${iconClass}
        `}
      >
        {icon}
      </div>

      <div>
        <p
          className="
            text-xl
            font-black
            text-white
          "
        >
          {value}
        </p>

        <p
          className="
            mt-0.5

            text-xs
            font-semibold
            text-slate-400
          "
        >
          {label}
        </p>
      </div>
    </div>
  );
};

// ==========================================
// FOOTER METRIC
// ==========================================

const FooterMetric = ({ value, label, accent }) => {
  return (
    <div
      className="
        relative
        overflow-hidden

        rounded-[24px]

        border
        border-white/10

        bg-[#0E1728]/80

        p-5

        text-center

        shadow-lg

        transition-all
        duration-300

        hover:-translate-y-1
        hover:border-white/15
      "
    >
      <div
        className="
          pointer-events-none

          absolute
          left-1/2
          top-0

          h-20
          w-32

          -translate-x-1/2

          bg-yellow-300/10

          blur-3xl
        "
      />

      <p
        className={`
          relative

          text-3xl
          font-black

          md:text-4xl

          ${accent}
        `}
      >
        {value}
      </p>

      <p
        className="
          relative

          mt-2

          text-xs
          font-semibold
          text-slate-400

          sm:text-sm
        "
      >
        {label}
      </p>
    </div>
  );
};

// ==========================================
// TRUST PILL
// ==========================================

const TrustPill = ({ icon, text }) => {
  return (
    <span
      className="
        inline-flex
        items-center
        gap-2

        rounded-full

        border
        border-white/10

        bg-white/[0.04]

        px-4
        py-2

        text-xs
        font-bold
        text-slate-300
      "
    >
      <span className="text-yellow-300">{icon}</span>

      {text}
    </span>
  );
};
