import {
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Database,
  GraduationCap,
  Landmark,
  Layers3,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

// ==========================================
// PREMIUM INFORMATION SECTION
// ==========================================

export default function PremiumInfoSection() {
  // ==========================================
  // INFORMATION CARDS
  // ==========================================

  const cards = [
    {
      title: "Structured Campus Operations",

      icon: Layers3,

      color: "from-[#1D4ED8] via-[#2563EB] to-[#60A5FA]",

      glow: "bg-blue-500/15",

      description:
        "CampusNexus organizes campus services into structured digital workflows so every department can work through clearly defined responsibilities.",

      points: [
        "Role-based workflows",
        "Centralized operations",
        "Structured service tracking",
      ],
    },

    {
      title: "Department Coordination",

      icon: Building2,

      color: "from-[#B7791F] via-[#D4A72C] to-[#F4C430]",

      glow: "bg-yellow-400/15",

      description:
        "Students, Wardens, Hostel Director, Maintenance, Store and Administration work through dedicated ERP modules while remaining connected within one platform.",

      points: [
        "Connected departments",
        "Dedicated dashboards",
        "Clear responsibility flow",
      ],
    },

    {
      title: "Security & Governance",

      icon: ShieldCheck,

      color: "from-[#5B1025] via-[#7A0019] to-[#A61B3C]",

      glow: "bg-red-700/15",

      description:
        "Secure authentication and role-based permissions ensure that users access only the information and operations assigned to their responsibilities.",

      points: [
        "Secure authentication",
        "Role-based access",
        "Controlled operations",
      ],
    },
  ];

  // ==========================================
  // GOVERNANCE ITEMS
  // ==========================================

  const governanceItems = [
    {
      icon: Users,
      title: "Role Based",
      subtitle: "Dedicated access",
    },

    {
      icon: Database,
      title: "Centralized",
      subtitle: "Connected records",
    },

    {
      icon: ClipboardCheck,
      title: "Trackable",
      subtitle: "Workflow status",
    },

    {
      icon: ShieldCheck,
      title: "Secure",
      subtitle: "Controlled access",
    },
  ];

  return (
    <section
      id="solutions"
      className="
        relative
        overflow-hidden

        bg-gradient-to-b
        from-[#06101F]
        via-[#0A1729]
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
          BLUE GLOW
      ====================================== */}

      <div
        className="
          pointer-events-none

          absolute
          -left-32
          top-0

          h-[450px]
          w-[450px]

          rounded-full

          bg-blue-600/15

          blur-[160px]
        "
      />

      {/* ======================================
          GOLD GLOW
      ====================================== */}

      <div
        className="
          pointer-events-none

          absolute
          -right-32
          bottom-0

          h-[450px]
          w-[450px]

          rounded-full

          bg-yellow-400/10

          blur-[160px]
        "
      />

      {/* ======================================
          MAROON GLOW
      ====================================== */}

      <div
        className="
          pointer-events-none

          absolute
          left-1/2
          top-1/2

          h-[350px]
          w-[350px]

          -translate-x-1/2
          -translate-y-1/2

          rounded-full

          bg-[#7A0019]/10

          blur-[150px]
        "
      />

      {/* ======================================
          CONTAINER
      ====================================== */}

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
            max-w-4xl
            text-center
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
            Institutional ERP Framework
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
            Digital Campus
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
              Governance & Coordination
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
            CampusNexus provides a structured digital environment where campus
            departments can coordinate their operations while maintaining
            individual responsibilities, controlled access and transparent
            workflow tracking.
          </p>
        </div>

        {/* ======================================
            CARDS
        ====================================== */}

        <div
          className="
            mt-16

            grid
            grid-cols-1
            gap-6

            lg:grid-cols-3
          "
        >
          {cards.map((item, index) => {
            const Icon = item.icon;

            return (
              <article
                key={index}
                className="
                  group

                  relative
                  overflow-hidden

                  rounded-[32px]

                  border
                  border-white/10

                  bg-[#0D192A]/85

                  p-7

                  shadow-[0_20px_60px_rgba(0,0,0,.30)]

                  backdrop-blur-xl

                  transition-all
                  duration-500

                  hover:-translate-y-2

                  hover:border-yellow-400/20
                "
              >
                {/* TOP ACCENT */}

                <div
                  className={`
                    absolute
                    left-0
                    top-0

                    h-[3px]
                    w-full

                    bg-gradient-to-r
                    ${item.color}

                    opacity-80
                  `}
                />

                {/* GLOW */}

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

                    transition-all
                    duration-500
                  `}
                />

                {/* NUMBER */}

                <span
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
                </span>

                {/* ICON */}

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

                    transition-transform
                    duration-500

                    group-hover:-translate-y-1
                    group-hover:scale-105
                  `}
                >
                  <Icon size={28} className="text-white" />
                </div>

                {/* TITLE */}

                <h3
                  className="
                    relative

                    mt-7

                    text-2xl
                    font-black
                    text-white
                  "
                >
                  {item.title}
                </h3>

                {/* DESCRIPTION */}

                <p
                  className="
                    relative

                    mt-4

                    text-sm
                    leading-7
                    text-slate-400

                    md:text-[15px]
                  "
                >
                  {item.description}
                </p>

                {/* POINTS */}

                <div
                  className="
                    relative

                    mt-6

                    space-y-3

                    border-t
                    border-white/[0.07]

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

                {/* FOOTER */}

                <div
                  className="
                    relative

                    mt-6

                    flex
                    items-center
                    gap-2

                    text-xs
                    font-bold
                    text-yellow-300
                  "
                >
                  CampusNexus Framework
                  <ChevronRight
                    size={15}
                    className="
                      transition-transform
                      duration-300

                      group-hover:translate-x-1
                    "
                  />
                </div>
              </article>
            );
          })}
        </div>

        {/* ======================================
            CAMPUS STRUCTURE PANEL
        ====================================== */}

        <div
          className="
            relative

            mt-16

            overflow-hidden

            rounded-[36px]

            border
            border-white/10

            bg-gradient-to-br
            from-white/[0.055]
            via-white/[0.03]
            to-white/[0.045]

            p-7

            shadow-[0_25px_80px_rgba(0,0,0,.35)]

            backdrop-blur-xl

            md:p-10
          "
        >
          {/* PANEL GLOW */}

          <div
            className="
              pointer-events-none

              absolute
              -right-20
              -top-20

              h-72
              w-72

              rounded-full

              bg-yellow-400/10

              blur-[120px]
            "
          />

          <div
            className="
              pointer-events-none

              absolute
              -bottom-20
              -left-20

              h-72
              w-72

              rounded-full

              bg-blue-600/10

              blur-[120px]
            "
          />

          {/* ==================================
              PANEL HEADING
          ================================== */}

          <div
            className="
              relative

              flex
              flex-col
              gap-6

              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div
              className="
                flex
                items-start
                gap-4
              "
            >
              <div
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center

                  rounded-2xl

                  bg-gradient-to-br
                  from-[#1D4ED8]
                  to-[#F4C430]

                  text-white

                  shadow-lg
                "
              >
                <Landmark size={26} />
              </div>

              <div>
                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-blue-300
                  "
                >
                  CampusNexus Governance
                </p>

                <h3
                  className="
                    mt-1

                    text-2xl
                    font-black
                    text-white

                    md:text-3xl
                  "
                >
                  Built Around Campus Responsibilities
                </h3>

                <p
                  className="
                    mt-2
                    max-w-2xl

                    text-sm
                    leading-6
                    text-slate-400
                  "
                >
                  Each user receives a dedicated ERP experience based on their
                  operational responsibility within the campus.
                </p>
              </div>
            </div>

            <div
              className="
                inline-flex
                w-fit
                items-center
                gap-2

                rounded-full

                border
                border-emerald-400/20

                bg-emerald-400/[0.07]

                px-4
                py-2

                text-xs
                font-bold
                text-emerald-300
              "
            >
              <ShieldCheck size={15} />
              Controlled Role Access
            </div>
          </div>

          {/* ==================================
              ROLE FLOW
          ================================== */}

          <div
            className="
              relative

              mt-9

              grid
              grid-cols-2
              gap-4

              md:grid-cols-3
              xl:grid-cols-6
            "
          >
            <RoleBox icon={<GraduationCap size={21} />} title="Student" />

            <RoleBox icon={<Users size={21} />} title="Warden" />

            <RoleBox icon={<Building2 size={21} />} title="Hostel Director" />

            <RoleBox icon={<ClipboardCheck size={21} />} title="Maintenance" />

            <RoleBox icon={<Database size={21} />} title="Store" />

            <RoleBox icon={<ShieldCheck size={21} />} title="Admin" />
          </div>

          {/* ==================================
              GOVERNANCE ITEMS
          ================================== */}

          <div
            className="
              relative

              mt-8

              grid
              grid-cols-2

              overflow-hidden

              rounded-[26px]

              border
              border-white/[0.07]

              bg-[#071321]/60

              lg:grid-cols-4
            "
          >
            {governanceItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="
                      flex
                      items-center
                      gap-3

                      border-b
                      border-r
                      border-white/[0.06]

                      p-5

                      last:border-r-0

                      lg:border-b-0
                    "
                >
                  <div
                    className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center

                        rounded-xl

                        bg-blue-500/10

                        text-blue-300
                      "
                  >
                    <Icon size={19} />
                  </div>

                  <div>
                    <p
                      className="
                          text-sm
                          font-black
                          text-white
                        "
                    >
                      {item.title}
                    </p>

                    <p
                      className="
                          mt-0.5
                          text-xs
                          text-slate-500
                        "
                    >
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// ROLE BOX
// ==========================================

const RoleBox = ({ icon, title }) => {
  return (
    <div
      className="
        flex
        min-h-[105px]
        flex-col
        items-center
        justify-center

        rounded-2xl

        border
        border-white/[0.07]

        bg-white/[0.035]

        p-4

        text-center

        transition-all
        duration-300

        hover:-translate-y-1
        hover:border-yellow-400/20
        hover:bg-white/[0.05]
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center

          rounded-xl

          bg-yellow-400/10

          text-yellow-300
        "
      >
        {icon}
      </div>

      <p
        className="
          mt-3

          text-xs
          font-extrabold
          text-slate-200
        "
      >
        {title}
      </p>
    </div>
  );
};
