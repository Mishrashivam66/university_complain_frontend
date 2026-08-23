import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Database,
  GraduationCap,
  Landmark,
  Package,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Wrench,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

// ==========================================
// PORTAL DEMO
// ==========================================

export default function PortalDemo() {
  const navigate = useNavigate();

  // ==========================================
  // DEMO WORKFLOW
  // ==========================================

  const activities = [
    {
      title: "Complaint Registered",

      description: "Student reports an electrical issue from the hostel.",

      status: "PENDING",

      icon: ClipboardCheck,

      color: "bg-yellow-400/10 text-yellow-300 border-yellow-400/20",
    },

    {
      title: "Worker Assigned",

      description:
        "Maintenance Manager assigns the complaint to the relevant worker.",

      status: "ASSIGNED",

      icon: UserCheck,

      color: "bg-blue-400/10 text-blue-300 border-blue-400/20",
    },

    {
      title: "Work Verification",

      description: "Completed work is checked before final complaint closure.",

      status: "VERIFICATION",

      icon: CheckCircle2,

      color: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    },
  ];

  // ==========================================
  // MODULES
  // ==========================================

  const modules = [
    {
      title: "Student Portal",

      description:
        "Raise complaints, track progress and access student services.",

      icon: GraduationCap,

      color: "from-[#1D4ED8] via-[#2563EB] to-[#60A5FA]",

      glow: "bg-blue-500/15",
    },

    {
      title: "Hostel Operations",

      description:
        "Warden and Hostel Director workflows for structured hostel management.",

      icon: Building2,

      color: "from-[#B7791F] via-[#D4A72C] to-[#F4C430]",

      glow: "bg-yellow-400/15",
    },

    {
      title: "Maintenance",

      description:
        "Complaint assignment, workers, Job Cards, materials and verification.",

      icon: Wrench,

      color: "from-[#5B1025] via-[#7A0019] to-[#A61B3C]",

      glow: "bg-red-500/15",
    },

    {
      title: "Store & Inventory",

      description:
        "Material requests, store approval, issue tracking and stock records.",

      icon: Package,

      color: "from-[#047857] via-[#059669] to-[#34D399]",

      glow: "bg-emerald-500/15",
    },

    {
      title: "Notifications",

      description:
        "Role-based notifications for important campus workflow updates.",

      icon: Bell,

      color: "from-[#4338CA] via-[#4F46E5] to-[#818CF8]",

      glow: "bg-indigo-500/15",
    },

    {
      title: "Reports & Monitoring",

      description:
        "Operational summaries and structured reports for campus management.",

      icon: BarChart3,

      color: "from-[#0F4C81] via-[#2563EB] to-[#F4C430]",

      glow: "bg-blue-500/15",
    },
  ];

  return (
    <section
      id="portal-demo"
      className="
        relative
        overflow-hidden
        bg-gradient-to-b
        from-[#071120]
        via-[#08182A]
        to-[#06101F]
        py-28
        md:py-32
      "
    >
      {/* ======================================
          BACKGROUND GRID
      ====================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.035]
          [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
          [background-size:70px_70px]
        "
      />

      {/* BLUE GLOW */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          -top-44
          h-[520px]
          w-[520px]
          rounded-full
          bg-blue-600/15
          blur-[150px]
        "
      />

      {/* GOLD GLOW */}

      <div
        className="
          pointer-events-none
          absolute
          -bottom-48
          -right-40
          h-[520px]
          w-[520px]
          rounded-full
          bg-yellow-400/12
          blur-[150px]
        "
      />

      {/* MAROON GLOW */}

      <div
        className="
          pointer-events-none
          absolute
          right-[20%]
          top-[35%]
          h-[320px]
          w-[320px]
          rounded-full
          bg-[#7A0019]/10
          blur-[140px]
        "
      />

      {/* ======================================
          CONTAINER
      ====================================== */}

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
        {/* ======================================
            HEADER
        ====================================== */}

        <div
          className="
            mx-auto
            max-w-4xl
            text-center
          "
        >
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
            CampusNexus Platform Preview
          </div>

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
            One ERP.
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
              Complete Campus Control.
            </span>
          </h2>

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
            A centralized platform connecting students, hostels, maintenance
            teams, stores and administration through structured role-based
            workflows.
          </p>
        </div>

        {/* ======================================
            ROLE STRIP
        ====================================== */}

        <div
          className="
            mt-14
            rounded-[28px]
            border
            border-white/10
            bg-white/[0.035]
            p-5
            backdrop-blur-xl
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
              xl:flex-row
              xl:items-center
              xl:justify-between
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <ShieldCheck size={22} className="text-emerald-400" />

              <div>
                <p
                  className="
                    font-extrabold
                    text-white
                  "
                >
                  Role-Based ERP Access
                </p>

                <p
                  className="
                    text-xs
                    text-slate-400
                  "
                >
                  Dedicated workflows for each campus role
                </p>
              </div>
            </div>

            <div
              className="
                flex
                flex-wrap
                gap-2.5
              "
            >
              {[
                "Student",
                "Warden",
                "Hostel Director",
                "Maintenance Manager",
                "Store Manager",
                "Admin",
              ].map((role) => (
                <span
                  key={role}
                  className="
                    rounded-full
                    border
                    border-white/10
                    bg-white/[0.05]
                    px-4
                    py-2
                    text-xs
                    font-bold
                    text-slate-300
                  "
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================
            MAIN CONTROL CENTER
        ====================================== */}

        <div
          className="
            mt-8
            overflow-hidden
            rounded-[38px]
            border
            border-white/10
            bg-[#0B1727]/90
            shadow-[0_30px_90px_rgba(0,0,0,.40)]
            backdrop-blur-2xl
          "
        >
          {/* CONTROL HEADER */}

          <div
            className="
              flex
              flex-col
              gap-5
              border-b
              border-white/10
              px-6
              py-6
              md:px-8
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div
              className="
                flex
                items-center
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
                  shadow-lg
                "
              >
                <Landmark size={27} className="text-white" />
              </div>

              <div>
                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-blue-300
                  "
                >
                  CampusNexus ERP
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
                  Campus Control Center
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-400
                  "
                >
                  Centralized operational workspace
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="
                group
                flex
                w-fit
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-gradient-to-r
                from-[#F4C430]
                to-[#FFD54F]
                px-6
                py-3.5
                font-black
                text-[#071120]
                shadow-[0_14px_35px_rgba(244,196,48,.25)]
                transition-all
                hover:-translate-y-0.5
              "
            >
              Launch ERP
              <ArrowRight
                size={18}
                className="
                  transition-transform
                  group-hover:translate-x-1
                "
              />
            </button>
          </div>

          {/* ======================================
              MAIN INNER GRID
          ====================================== */}

          <div
            className="
              grid
              grid-cols-1
              xl:grid-cols-[1.55fr_0.75fr]
            "
          >
            {/* ==================================
                LEFT - MODULES
            ================================== */}

            <div
              className="
                border-b
                border-white/10
                p-6
                md:p-8
                xl:border-b-0
                xl:border-r
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                <div>
                  <p
                    className="
                      text-sm
                      font-extrabold
                      text-white
                    "
                  >
                    Core ERP Modules
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-400
                    "
                  >
                    Integrated campus operational services
                  </p>
                </div>

                <span
                  className="
                    rounded-full
                    border
                    border-blue-400/15
                    bg-blue-400/[0.07]
                    px-3
                    py-1.5
                    text-xs
                    font-bold
                    text-blue-300
                  "
                >
                  6 Modules
                </span>
              </div>

              {/* MODULE CARDS */}

              <div
                className="
                  mt-6
                  grid
                  grid-cols-1
                  gap-4
                  md:grid-cols-2
                "
              >
                {modules.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={index}
                      className="
                          group
                          relative
                          overflow-hidden
                          rounded-[24px]
                          border
                          border-white/[0.07]
                          bg-white/[0.035]
                          p-5
                          transition-all
                          duration-300
                          hover:-translate-y-1.5
                          hover:border-white/15
                          hover:bg-white/[0.05]
                        "
                    >
                      {/* GLOW */}

                      <div
                        className={`
                            pointer-events-none
                            absolute
                            -right-14
                            -top-14
                            h-36
                            w-36
                            rounded-full
                            ${item.glow}
                            blur-3xl
                          `}
                      />

                      <div
                        className={`
                            relative
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-xl
                            bg-gradient-to-br
                            ${item.color}
                            shadow-lg
                          `}
                      >
                        <Icon size={22} className="text-white" />
                      </div>

                      <h4
                        className="
                            relative
                            mt-5
                            text-lg
                            font-black
                            text-white
                          "
                      >
                        {item.title}
                      </h4>

                      <p
                        className="
                            relative
                            mt-2
                            text-sm
                            leading-6
                            text-slate-400
                          "
                      >
                        {item.description}
                      </p>

                      <div
                        className="
                            relative
                            mt-4
                            flex
                            items-center
                            gap-2
                            text-xs
                            font-bold
                            text-blue-300
                          "
                      >
                        ERP Module
                        <ChevronRight
                          size={15}
                          className="
                              transition-transform
                              group-hover:translate-x-1
                            "
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* ==================================
                RIGHT - WORKFLOW
            ================================== */}

            <div
              className="
                p-6
                md:p-8
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-yellow-400/10
                    text-yellow-300
                  "
                >
                  <Wrench size={21} />
                </div>

                <div>
                  <h3
                    className="
                      text-xl
                      font-black
                      text-white
                    "
                  >
                    Workflow Preview
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-400
                    "
                  >
                    Example maintenance process
                  </p>
                </div>
              </div>

              {/* WORKFLOW LINE */}

              <div
                className="
                  relative
                  mt-7
                  space-y-4
                "
              >
                <div
                  className="
                    absolute
                    bottom-6
                    left-[21px]
                    top-6
                    w-px
                    bg-gradient-to-b
                    from-blue-400/40
                    via-yellow-400/30
                    to-emerald-400/40
                  "
                />

                {activities.map((activity, index) => {
                  const Icon = activity.icon;

                  return (
                    <article
                      key={index}
                      className="
                          relative
                          z-10
                          rounded-2xl
                          border
                          border-white/[0.07]
                          bg-[#081321]
                          p-4
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
                          className={`
                              flex
                              h-11
                              w-11
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              border
                              ${activity.color}
                            `}
                        >
                          <Icon size={19} />
                        </div>

                        <div
                          className="
                              min-w-0
                              flex-1
                            "
                        >
                          <div
                            className="
                                flex
                                flex-wrap
                                items-start
                                justify-between
                                gap-2
                              "
                          >
                            <h4
                              className="
                                  font-extrabold
                                  text-white
                                "
                            >
                              {activity.title}
                            </h4>

                            <span
                              className="
                                  rounded-full
                                  bg-white/[0.05]
                                  px-2.5
                                  py-1
                                  text-[9px]
                                  font-black
                                  tracking-wide
                                  text-slate-400
                                "
                            >
                              {activity.status}
                            </span>
                          </div>

                          <p
                            className="
                                mt-2
                                text-xs
                                leading-5
                                text-slate-400
                              "
                          >
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* SECURITY NOTE */}

              <div
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-emerald-400/15
                  bg-emerald-400/[0.06]
                  p-4
                "
              >
                <div
                  className="
                    flex
                    items-start
                    gap-3
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
                      leading-5
                      text-emerald-100/70
                    "
                  >
                    Campus workflows are separated through role-based
                    permissions and authenticated ERP access.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================
              BOTTOM INFORMATION BAR
          ====================================== */}

          <div
            className="
              grid
              grid-cols-1
              border-t
              border-white/10
              bg-white/[0.025]
              sm:grid-cols-3
            "
          >
            <BottomInfo
              icon={<Database size={18} />}
              title="Centralized"
              description="Connected operational records"
            />

            <BottomInfo
              icon={<ShieldCheck size={18} />}
              title="Role Based"
              description="Controlled system access"
            />

            <BottomInfo
              icon={<CheckCircle2 size={18} />}
              title="Trackable"
              description="Structured workflow status"
            />
          </div>
        </div>

        {/* ======================================
            PLATFORM MESSAGE
        ====================================== */}

        <div
          className="
            mt-10
            flex
            flex-col
            items-center
            justify-between
            gap-5
            rounded-[28px]
            border
            border-white/10
            bg-gradient-to-r
            from-blue-500/[0.06]
            via-white/[0.03]
            to-yellow-400/[0.06]
            p-6
            md:flex-row
            md:px-8
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
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#F4C430]/10
                text-yellow-300
              "
            >
              <Landmark size={23} />
            </div>

            <div>
              <h3
                className="
                  font-black
                  text-white
                "
              >
                Designed for Campus Operations
              </h3>

              <p
                className="
                  mt-1
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-400
                "
              >
                CampusNexus brings multiple operational departments into one
                structured ERP environment while preserving individual role
                responsibilities.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="
              flex
              shrink-0
              items-center
              gap-2
              rounded-xl
              border
              border-yellow-400/20
              bg-yellow-400/[0.08]
              px-5
              py-3
              font-bold
              text-yellow-300
              transition-all
              hover:bg-yellow-400/[0.12]
            "
          >
            Access ERP
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// BOTTOM INFO
// ==========================================

const BottomInfo = ({ icon, title, description }) => {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        border-b
        border-white/[0.06]
        px-6
        py-5
        last:border-b-0
        sm:border-b-0
        sm:border-r
        sm:last:border-r-0
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-blue-500/10
          text-blue-300
        "
      >
        {icon}
      </div>

      <div>
        <p
          className="
            text-sm
            font-extrabold
            text-white
          "
        >
          {title}
        </p>

        <p
          className="
            mt-0.5
            text-xs
            text-slate-500
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
};
