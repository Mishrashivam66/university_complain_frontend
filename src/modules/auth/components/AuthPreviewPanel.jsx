import { Link } from "react-router-dom";

import {
  Sparkles,
  ShieldCheck,
  Building2,
  ChevronRight,
  ClipboardCheck,
  Wrench,
  Package,
  BarChart3,
  GraduationCap,
} from "lucide-react";

const AuthPreviewPanel = ({ mode }) => {
  const isLogin = mode === "login";

  // ==========================================
  // CONTENT
  // ==========================================

  const subtitle = isLogin
    ? "Access your role-based CampusNexus dashboard and manage campus operations through one structured ERP platform."
    : "Create your student account and access a secure digital platform designed for campus services and operational workflows.";

  const buttonText = isLogin ? "Create Student Account" : "Login Now";

  const buttonLink = isLogin ? "/register" : "/login";

  // ==========================================
  // FEATURES
  // ==========================================

  const features = [
    {
      title: "Complaint Management",
      icon: ClipboardCheck,
      color: "text-blue-300",
      bg: "bg-blue-500/10",
    },

    {
      title: "Hostel Operations",
      icon: Building2,
      color: "text-yellow-300",
      bg: "bg-yellow-400/10",
    },

    {
      title: "Maintenance & Job Cards",
      icon: Wrench,
      color: "text-red-300",
      bg: "bg-red-500/10",
    },

    {
      title: "Inventory & Material Workflow",
      icon: Package,
      color: "text-emerald-300",
      bg: "bg-emerald-500/10",
    },

    {
      title: "Reports & Operational Monitoring",
      icon: BarChart3,
      color: "text-indigo-300",
      bg: "bg-indigo-500/10",
    },
  ];

  return (
    <aside
      className="
        relative
        h-full
        overflow-hidden

        rounded-[36px]

        border
        border-white/10

        bg-gradient-to-br
        from-[#06101F]
        via-[#071B34]
        to-[#0F4C81]

        p-8
        text-white

        shadow-[0_25px_80px_rgba(0,0,0,.45)]

        lg:p-10
      "
    >
      {/* ======================================
          BACKGROUND DECORATION
      ====================================== */}

      <div
        className="
          pointer-events-none

          absolute
          -right-20
          -top-24

          h-[300px]
          w-[300px]

          rounded-full

          bg-[#F4C430]/15

          blur-[120px]
        "
      />

      <div
        className="
          pointer-events-none

          absolute
          -bottom-28
          -left-24

          h-[300px]
          w-[300px]

          rounded-full

          bg-blue-500/20

          blur-[120px]
        "
      />

      <div
        className="
          pointer-events-none

          absolute
          inset-0

          opacity-[0.04]

          [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]

          [background-size:60px_60px]
        "
      />

      {/* ======================================
          CONTENT
      ====================================== */}

      <div
        className="
          relative
          z-10

          flex
          h-full
          flex-col
        "
      >
        {/* ==================================
            BRAND
        ================================== */}

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
              from-[#2563EB]
              via-[#3B82F6]
              to-[#F4C430]

              shadow-[0_15px_40px_rgba(37,99,235,.35)]
            "
          >
            <Sparkles className="text-white" size={26} />
          </div>

          <div>
            <h2
              className="
                text-2xl
                font-black
                tracking-tight

                md:text-3xl
              "
            >
              CAMPUSNEXUS
            </h2>

            <p
              className="
                mt-1

                text-[10px]
                font-bold
                uppercase
                tracking-[0.28em]

                text-blue-200/70
              "
            >
              Smart Campus ERP
            </p>
          </div>
        </div>

        {/* ==================================
            BADGE
        ================================== */}

        <div
          className="
            mt-10

            inline-flex
            w-fit
            items-center
            gap-2

            rounded-full

            border
            border-yellow-400/20

            bg-yellow-400/[0.08]

            px-4
            py-2

            text-xs
            font-bold
            text-yellow-300

            backdrop-blur-xl
          "
        >
          <ShieldCheck size={15} />
          Secure Role-Based Campus ERP
        </div>

        {/* ==================================
            TITLE
        ================================== */}

        <h1
          className="
            mt-7

            text-4xl
            font-black
            leading-[1.08]
            tracking-tight

            md:text-5xl
            xl:text-6xl
          "
        >
          {isLogin ? (
            <>
              Welcome Back to
              <span
                className="
                  mt-2
                  block

                  bg-gradient-to-r
                  from-[#F4C430]
                  via-[#FFE082]
                  to-white

                  bg-clip-text
                  text-transparent
                "
              >
                CampusNexus
              </span>
            </>
          ) : (
            <>
              One Campus.
              <span
                className="
                  mt-2
                  block

                  bg-gradient-to-r
                  from-[#60A5FA]
                  via-white
                  to-[#F4C430]

                  bg-clip-text
                  text-transparent
                "
              >
                One Digital ERP.
              </span>
            </>
          )}
        </h1>

        {/* ==================================
            DESCRIPTION
        ================================== */}

        <p
          className="
            mt-6

            max-w-xl

            text-base
            leading-8
            text-slate-300
          "
        >
          {subtitle}
        </p>

        {/* ==================================
            FEATURES
        ================================== */}

        <div
          className="
            mt-8

            space-y-3
          "
        >
          {features.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="
                  flex
                  items-center
                  gap-3

                  rounded-2xl

                  border
                  border-white/[0.06]

                  bg-white/[0.035]

                  px-4
                  py-3

                  backdrop-blur-xl
                "
              >
                <div
                  className={`
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center

                    rounded-xl

                    ${item.bg}
                    ${item.color}
                  `}
                >
                  <Icon size={18} />
                </div>

                <span
                  className="
                    text-sm
                    font-semibold
                    text-slate-200
                  "
                >
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* ==================================
            AUTH BUTTON
        ================================== */}

        <Link
          to={buttonLink}
          className="
            group

            mt-9

            inline-flex
            w-fit
            items-center
            gap-3

            rounded-2xl

            bg-gradient-to-r
            from-[#F4C430]
            to-[#FFD54F]

            px-7
            py-4

            font-black
            text-[#071120]

            shadow-[0_15px_45px_rgba(244,196,48,.28)]

            transition-all
            duration-300

            hover:-translate-y-1
            hover:shadow-[0_20px_55px_rgba(244,196,48,.38)]
          "
        >
          {buttonText}

          <ChevronRight
            size={19}
            className="
              transition-transform
              group-hover:translate-x-1
            "
          />
        </Link>

        {/* ==================================
            PROJECT INFO
        ================================== */}

        <div
          className="
            mt-auto
            pt-10
          "
        >
          <div
            className="
              rounded-2xl

              border
              border-white/[0.07]

              bg-[#06101F]/40

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
              <GraduationCap
                size={19}
                className="
                  mt-0.5
                  shrink-0
                  text-yellow-300
                "
              />

              <div>
                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-blue-300
                  "
                >
                  Academic Project
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-6
                    text-slate-400
                  "
                >
                  Developed at Amity University Gwalior with academic guidance
                  from Dr. Dinesh Sharma.
                </p>
              </div>
            </div>
          </div>

          {/* TEAM */}

          <div
            className="
              mt-4

              border-t
              border-white/10

              pt-4
            "
          >
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.15em]
                text-slate-500
              "
            >
              Development Team
            </p>

            <div
              className="
                mt-2

                flex
                flex-wrap
                gap-x-2
                gap-y-1

                text-xs
                font-semibold
              "
            >
              <span className="text-yellow-300">Shivam Kumar Mishra</span>

              <span className="text-slate-600">•</span>

              <span className="text-blue-300">Dheeraj Kumar</span>

              <span className="text-slate-600">•</span>

              <span className="text-emerald-300">Ayush Tiwari</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AuthPreviewPanel;
