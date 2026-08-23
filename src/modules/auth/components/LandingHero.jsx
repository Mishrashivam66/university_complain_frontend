import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Layers3,
  ShieldCheck,
  UserCheck,
  Wrench,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function LandingHero() {
  const navigate = useNavigate();

  // ==========================================
  // SCROLL TO FEATURES
  // ==========================================

  const handleExploreFeatures = () => {
    const element = document.getElementById("solutions");

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#06101F]
        flex
        items-center
      "
    >
      {/* ======================================
          BACKGROUND
      ====================================== */}

      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_top_right,rgba(244,196,48,.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,.18),transparent_32%)]
        "
      />

      {/* GRID */}

      <div
        className="
          absolute
          inset-0
          opacity-[0.045]
          [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
          [background-size:70px_70px]
        "
      />

      {/* BLUE GLOW */}

      <div
        className="
          absolute
          -bottom-48
          -left-40
          h-[520px]
          w-[520px]
          rounded-full
          bg-blue-600/20
          blur-[150px]
        "
      />

      {/* GOLD GLOW */}

      <div
        className="
          absolute
          -right-40
          -top-48
          h-[520px]
          w-[520px]
          rounded-full
          bg-yellow-400/15
          blur-[150px]
        "
      />

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          grid
          w-full
          max-w-7xl
          grid-cols-1
          items-center
          gap-14
          px-6
          pb-20
          pt-36
          lg:grid-cols-2
          lg:gap-16
          lg:px-10
        "
      >
        {/* ======================================
            LEFT CONTENT
        ====================================== */}

        <div>
          {/* BADGE */}

          <div
            className="
              inline-flex
              items-center
              gap-3
              rounded-full
              border
              border-yellow-400/20
              bg-yellow-400/[0.07]
              px-5
              py-3
              backdrop-blur-xl
            "
          >
            <Layers3 size={18} className="text-yellow-300" />

            <span
              className="
                text-sm
                font-extrabold
                tracking-wide
                text-yellow-100
              "
            >
              Unified Smart Campus ERP
            </span>
          </div>

          {/* TITLE */}

          <h1
            className="
              mt-8
              text-5xl
              font-black
              leading-[1.03]
              text-white
              md:text-7xl
            "
          >
            One Campus.
            <br />
            <span
              className="
                bg-gradient-to-r
                from-[#F4C430]
                via-[#FFE082]
                to-white
                bg-clip-text
                text-transparent
              "
            >
              One Digital ERP.
            </span>
          </h1>

          {/* DESCRIPTION */}

          <p
            className="
              mt-8
              max-w-2xl
              text-lg
              leading-9
              text-slate-300
              md:text-xl
            "
          >
            CampusNexus connects student services, hostel operations, complaint
            management, maintenance workflows, inventory and administration
            through one structured digital platform.
          </p>

          {/* BUTTONS */}

          <div
            className="
              mt-10
              flex
              flex-wrap
              gap-4
            "
          >
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="
                group
                flex
                items-center
                justify-center
                gap-3
                rounded-2xl
                bg-gradient-to-r
                from-[#F4C430]
                to-[#FFD54F]
                px-8
                py-4
                font-black
                text-[#071120]
                shadow-[0_18px_45px_rgba(244,196,48,.28)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[0_22px_55px_rgba(244,196,48,.35)]
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

            <button
              type="button"
              onClick={handleExploreFeatures}
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/[0.05]
                px-8
                py-4
                font-bold
                text-white
                backdrop-blur-xl
                transition-all
                hover:border-white/20
                hover:bg-white/[0.08]
              "
            >
              Explore Platform
            </button>
          </div>

          {/* ======================================
              TRUST / SYSTEM CARDS
          ====================================== */}

          <div
            className="
              mt-14
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-3
            "
          >
            <TrustCard
              icon={<ShieldCheck size={22} className="text-emerald-400" />}
              title="Role-Based"
              text="Controlled Access"
            />

            <TrustCard
              icon={<ClipboardCheck size={22} className="text-yellow-300" />}
              title="Workflow Driven"
              text="Structured Operations"
            />

            <TrustCard
              icon={<Database size={22} className="text-blue-400" />}
              title="Centralized"
              text="Connected Records"
            />
          </div>
        </div>

        {/* ======================================
            RIGHT ERP PREVIEW
        ====================================== */}

        <div className="relative">
          {/* OUTER GLOW */}

          <div
            className="
              absolute
              inset-8
              rounded-[40px]
              bg-blue-500/10
              blur-3xl
            "
          />

          <div
            className="
              relative
              overflow-hidden
              rounded-[38px]
              border
              border-white/10
              bg-[#111D2E]/90
              p-6
              shadow-[0_30px_90px_rgba(0,0,0,.45)]
              backdrop-blur-2xl
              sm:p-8
            "
          >
            {/* TOP HEADER */}

            <div
              className="
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
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
                  CampusNexus ERP
                </p>

                <h2
                  className="
                    mt-2
                    text-2xl
                    font-black
                    text-white
                  "
                >
                  Campus Operations
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-400
                  "
                >
                  Structured workflow overview
                </p>
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
                  bg-emerald-400/10
                  px-4
                  py-2
                  text-xs
                  font-bold
                  text-emerald-300
                "
              >
                <ShieldCheck size={15} />
                ERP Operational
              </div>
            </div>

            {/* ======================================
                WORKFLOW
            ====================================== */}

            <div className="mt-8 space-y-4">
              {/* COMPLAINT */}

              <WorkflowItem
                icon={<ClipboardCheck size={21} className="text-blue-400" />}
                title="Complaint Registered"
                description="Student complaint enters the structured ERP workflow."
                badge="STEP 01"
              />

              {/* ASSIGNMENT */}

              <WorkflowItem
                icon={<UserCheck size={21} className="text-yellow-300" />}
                title="Worker Assignment"
                description="Maintenance Manager assigns the appropriate worker."
                badge="STEP 02"
              />

              {/* JOB CARD */}

              <WorkflowItem
                icon={<Wrench size={21} className="text-violet-400" />}
                title="Job Card & Execution"
                description="Work is organized and tracked through a Job Card."
                badge="STEP 03"
              />

              {/* VERIFICATION */}

              <WorkflowItem
                icon={<CheckCircle2 size={21} className="text-emerald-400" />}
                title="Final Verification"
                description="Completed work is verified before the complaint is closed."
                badge="STEP 04"
              />
            </div>

            {/* ======================================
                MODULE OVERVIEW
            ====================================== */}

            <div
              className="
                mt-7
                grid
                grid-cols-2
                gap-4
              "
            >
              <ModuleCard
                icon={<Building2 size={21} />}
                title="Hostel"
                subtitle="Operations"
              />

              <ModuleCard
                icon={<Wrench size={21} />}
                title="Maintenance"
                subtitle="Workflow"
              />

              <ModuleCard
                icon={<Database size={21} />}
                title="Inventory"
                subtitle="Materials"
              />

              <ModuleCard
                icon={<ShieldCheck size={21} />}
                title="Administration"
                subtitle="Role Access"
              />
            </div>

            {/* FOOT */}

            <div
              className="
                mt-6
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-white/5
                bg-[#081321]
                px-4
                py-3
              "
            >
              <ShieldCheck
                size={17}
                className="
                  shrink-0
                  text-emerald-400
                "
              />

              <p
                className="
                  text-xs
                  leading-5
                  text-slate-400
                "
              >
                Secure role-based campus workflows with centralized operational
                records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// TRUST CARD
// ==========================================

const TrustCard = ({ icon, title, text }) => {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/[0.045]
        p-5
        backdrop-blur-xl
      "
    >
      {icon}

      <h3
        className="
          mt-4
          text-base
          font-black
          text-white
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-1
          text-xs
          text-slate-400
        "
      >
        {text}
      </p>
    </div>
  );
};

// ==========================================
// WORKFLOW ITEM
// ==========================================

const WorkflowItem = ({ icon, title, description, badge }) => {
  return (
    <div
      className="
        group
        flex
        items-start
        gap-4
        rounded-2xl
        border
        border-white/[0.06]
        bg-[#081321]/80
        p-4
        transition-all
        duration-300
        hover:border-white/10
        hover:bg-[#0B1828]
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
          bg-white/[0.05]
        "
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-2
          "
        >
          <h3
            className="
              font-extrabold
              text-white
            "
          >
            {title}
          </h3>

          <span
            className="
              rounded-full
              bg-white/[0.05]
              px-2.5
              py-1
              text-[10px]
              font-bold
              tracking-wide
              text-slate-400
            "
          >
            {badge}
          </span>
        </div>

        <p
          className="
            mt-1.5
            text-xs
            leading-5
            text-slate-400
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
};

// ==========================================
// MODULE CARD
// ==========================================

const ModuleCard = ({ icon, title, subtitle }) => {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/[0.06]
        bg-white/[0.04]
        p-4
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
          bg-blue-500/10
          text-blue-300
        "
      >
        {icon}
      </div>

      <h3
        className="
          mt-3
          font-extrabold
          text-white
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-1
          text-xs
          text-slate-400
        "
      >
        {subtitle}
      </p>
    </div>
  );
};
