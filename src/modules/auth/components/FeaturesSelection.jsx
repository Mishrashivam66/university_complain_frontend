// ==========================================
// FEATURESSELECTION.jsx
// CAMPUSNEXUS PREMIUM ERP MODULES
// ==========================================

import React from "react";

import {
  FileText,
  Building2,
  Wrench,
  Package,
  Bell,
  ChevronRight,
  Sparkles,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function FeaturesSelection() {
  const [activeCard, setActiveCard] = React.useState(null);

  // ==========================================
  // ERP MODULES
  // ==========================================

  const features = [
    {
      title: "Complaint Management",

      icon: FileText,

      color: "from-[#1D4ED8] via-[#2563EB] to-[#60A5FA]",

      glow: "bg-blue-500/20",

      border: "group-hover:border-blue-400/40",

      desc: "A structured digital complaint system that helps students raise issues and campus teams track them through resolution.",

      points: [
        "Complaint registration",
        "Priority based handling",
        "Worker assignment",
        "Status tracking",
      ],
    },

    {
      title: "Hostel Management",

      icon: Building2,

      color: "from-[#B7791F] via-[#D4A72C] to-[#F4C430]",

      glow: "bg-yellow-400/20",

      border: "group-hover:border-yellow-400/40",

      desc: "Digital hostel operations for student records, room allocation, Warden management and hostel administration.",

      points: [
        "Room allocation",
        "Warden management",
        "Hosteller records",
        "Hostel operations",
      ],
    },

    {
      title: "Maintenance Workflow",

      icon: Wrench,

      color: "from-[#5B1025] via-[#7A0019] to-[#A61B3C]",

      glow: "bg-red-700/20",

      border: "group-hover:border-red-400/30",

      desc: "A complete maintenance process from complaint assignment to Job Card generation, execution and verification.",

      points: [
        "Worker assignment",
        "Job Card generation",
        "Material requirement flow",
        "Final work verification",
      ],
    },

    {
      title: "Inventory Management",

      icon: Package,

      color: "from-[#047857] via-[#059669] to-[#34D399]",

      glow: "bg-emerald-500/20",

      border: "group-hover:border-emerald-400/35",

      desc: "Manage maintenance materials, store approvals, issued quantities and material request workflows.",

      points: [
        "Material requests",
        "Store approval",
        "Issue tracking",
        "Inventory records",
      ],
    },

    {
      title: "Notifications & Alerts",

      icon: Bell,

      color: "from-[#4338CA] via-[#4F46E5] to-[#818CF8]",

      glow: "bg-indigo-500/20",

      border: "group-hover:border-indigo-400/35",

      desc: "Role-based notifications keep users informed about important complaint and campus workflow updates.",

      points: [
        "Complaint updates",
        "Role based alerts",
        "Campus announcements",
        "Workflow notifications",
      ],
    },

    {
      title: "Reports & Analytics",

      icon: BarChart3,

      color: "from-[#0F4C81] via-[#2563EB] to-[#F4C430]",

      glow: "bg-blue-500/20",

      border: "group-hover:border-yellow-400/35",

      desc: "Operational reports and structured data help management monitor campus services and workflow performance.",

      points: [
        "Complaint reports",
        "Maintenance reports",
        "Operational summaries",
        "Performance monitoring",
      ],
    },
  ];

  return (
    <section
      id="features"
      className="
        relative
        overflow-hidden

        bg-gradient-to-b
        from-[#06101F]
        via-[#08182A]
        to-[#071120]

        py-28
        md:py-32
      "
    >
      {/* ======================================
          GRID BACKGROUND
      ====================================== */}

      <div
        className="
          pointer-events-none

          absolute
          inset-0

          opacity-[0.035]

          bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]

          bg-[size:72px_72px]
        "
      />

      {/* ======================================
          TOP BLUE GLOW
      ====================================== */}

      <div
        className="
          pointer-events-none

          absolute
          left-1/2
          top-[-120px]

          h-[420px]
          w-[900px]

          -translate-x-1/2

          rounded-full

          bg-blue-600/15

          blur-[150px]
        "
      />

      {/* ======================================
          GOLD GLOW
      ====================================== */}

      <div
        className="
          pointer-events-none

          absolute
          right-[-120px]
          top-[30%]

          h-[380px]
          w-[380px]

          rounded-full

          bg-yellow-400/10

          blur-[150px]
        "
      />

      {/* ======================================
          MAROON GLOW
      ====================================== */}

      <div
        className="
          pointer-events-none

          absolute
          bottom-[-100px]
          left-[-100px]

          h-[400px]
          w-[400px]

          rounded-full

          bg-[#7A0019]/15

          blur-[150px]
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
        {/* ======================================
            SECTION HEADER
        ====================================== */}

        <div
          className="
            mx-auto
            mb-16
            max-w-4xl
            text-center

            md:mb-20
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
              border-yellow-400/20

              bg-yellow-400/[0.08]

              px-5
              py-2.5

              font-bold
              text-yellow-300

              backdrop-blur-xl
            "
          >
            <Sparkles size={17} />
            CampusNexus ERP Modules
          </div>

          {/* TITLE */}

          <h2
            className="
              mt-7

              text-4xl
              font-black
              leading-tight
              text-white

              md:text-6xl
              xl:text-7xl
            "
          >
            One Platform For
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
              Campus Operations
            </span>
          </h2>

          {/* DESCRIPTION */}

          <p
            className="
              mx-auto
              mt-7
              max-w-3xl

              text-base
              leading-8
              text-slate-300

              md:text-lg
            "
          >
            CampusNexus connects core campus operations through dedicated ERP
            modules designed for students, Wardens, maintenance teams, stores
            and administration.
          </p>
        </div>

        {/* ======================================
            FEATURE GRID
        ====================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-6

            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {features.map((item, index) => {
            const Icon = item.icon;

            const active = activeCard === index;

            return (
              <article
                key={index}
                onClick={() => setActiveCard(active ? null : index)}
                className={`
                    group

                    relative
                    cursor-pointer
                    overflow-hidden

                    rounded-[30px]

                    border
                    border-white/10

                    bg-[#0C1829]/85

                    p-7

                    shadow-[0_20px_55px_rgba(0,0,0,.30)]

                    backdrop-blur-xl

                    transition-all
                    duration-500

                    hover:-translate-y-2

                    ${item.border}

                    ${active ? "border-yellow-400/30 bg-[#101E32]" : ""}
                  `}
              >
                {/* ==================================
                      CARD TOP ACCENT
                  ================================== */}

                <div
                  className={`
                      absolute
                      left-0
                      top-0

                      h-[3px]
                      w-full

                      bg-gradient-to-r
                      ${item.color}

                      opacity-70
                    `}
                />

                {/* ==================================
                      GLOW
                  ================================== */}

                <div
                  className={`
                      pointer-events-none

                      absolute
                      -right-16
                      -top-16

                      h-44
                      w-44

                      rounded-full

                      ${item.glow}

                      blur-3xl

                      opacity-60

                      transition-opacity
                      duration-500

                      group-hover:opacity-100
                    `}
                />

                {/* ==================================
                      NUMBER
                  ================================== */}

                <div
                  className="
                      absolute
                      right-6
                      top-6

                      text-xs
                      font-black
                      tracking-[0.18em]
                      text-white/20
                    "
                >
                  0{index + 1}
                </div>

                {/* ==================================
                      ICON
                  ================================== */}

                <div
                  className={`
                      relative

                      flex
                      h-16
                      w-16
                      items-center
                      justify-center

                      rounded-2xl

                      bg-gradient-to-br
                      ${item.color}

                      shadow-[0_15px_35px_rgba(0,0,0,.30)]

                      transition-all
                      duration-500

                      group-hover:-translate-y-1
                      group-hover:scale-105
                    `}
                >
                  <Icon size={28} className="text-white" />
                </div>

                {/* ==================================
                      TITLE
                  ================================== */}

                <h3
                  className="
                      relative

                      mt-7

                      text-2xl
                      font-black
                      text-white

                      md:text-[28px]
                    "
                >
                  {item.title}
                </h3>

                {/* ==================================
                      DESCRIPTION
                  ================================== */}

                <p
                  className="
                      relative

                      mt-4

                      min-h-[92px]

                      text-sm
                      leading-7
                      text-slate-400

                      md:text-[15px]
                    "
                >
                  {item.desc}
                </p>

                {/* ==================================
                      DETAILS
                  ================================== */}

                <div
                  className={`
                      relative

                      overflow-hidden

                      transition-all
                      duration-500

                      ${
                        active
                          ? "mt-6 max-h-[400px] opacity-100"
                          : "max-h-0 opacity-0"
                      }
                    `}
                >
                  <div
                    className="
                        space-y-3

                        border-t
                        border-white/10

                        pt-5
                      "
                  >
                    {item.points.map((point, pointIndex) => (
                      <div
                        key={pointIndex}
                        className="
                              flex
                              items-center
                              gap-3
                            "
                      >
                        <div
                          className="
                                flex
                                h-6
                                w-6
                                shrink-0
                                items-center
                                justify-center

                                rounded-full

                                bg-emerald-400/10

                                text-emerald-400
                              "
                        >
                          <CheckCircle2 size={14} />
                        </div>

                        <span
                          className="
                                text-sm
                                font-medium
                                text-slate-300
                              "
                        >
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ==================================
                      FOOTER
                  ================================== */}

                <div
                  className="
                      relative

                      mt-7

                      flex
                      items-center
                      justify-between

                      border-t
                      border-white/[0.06]

                      pt-5
                    "
                >
                  <span
                    className="
                        text-sm
                        font-extrabold
                        text-yellow-300
                      "
                  >
                    {active ? "Hide Details" : "Explore Module"}
                  </span>

                  <div
                    className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center

                        rounded-xl

                        bg-white/[0.05]

                        text-yellow-300

                        transition-all

                        group-hover:bg-yellow-400/10
                      "
                  >
                    <ChevronRight
                      size={18}
                      className={`
                          transition-all
                          duration-300

                          ${
                            active ? "rotate-90" : "group-hover:translate-x-0.5"
                          }
                        `}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* ======================================
            BOTTOM MESSAGE
        ====================================== */}

        <div
          className="
            mx-auto
            mt-14

            flex
            max-w-4xl
            items-start
            gap-4

            rounded-2xl

            border
            border-white/10

            bg-white/[0.035]

            p-5

            backdrop-blur-xl
          "
        >
          <ShieldCheck
            size={22}
            className="
              mt-0.5
              shrink-0
              text-emerald-400
            "
          />

          <p
            className="
              text-sm
              leading-7
              text-slate-400
            "
          >
            Every CampusNexus module operates through role-based access so each
            campus team receives only the tools and information required for its
            assigned responsibilities.
          </p>
        </div>
      </div>
    </section>
  );
}
