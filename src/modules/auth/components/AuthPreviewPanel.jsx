import { Link } from "react-router-dom";

import { Sparkles, ShieldCheck, Building2, ChevronRight } from "lucide-react";

const AuthPreviewPanel = ({ mode }) => {
  const isLogin = mode === "login";

  const title = isLogin
    ? "Welcome Back to CampusNexus"
    : "Join the Future of Smart Campus ERP";

  const subtitle = isLogin
    ? "Access hostel management, maintenance workflows, realtime notifications and campus operations from one unified ERP platform."
    : "Create your ERP account and experience next-generation campus automation powered by realtime technologies.";

  const buttonText = isLogin ? "Create Account" : "Login Now";

  const buttonLink = isLogin ? "/register" : "/login";

  return (
    <aside
      className="
        relative

        overflow-hidden

        h-full

        rounded-[36px]

        border
        border-white/10

        bg-gradient-to-br
        from-[#06101F]
        via-[#071B34]
        to-[#0F4C81]

        p-10

        text-white

        shadow-[0_25px_80px_rgba(0,0,0,.45)]
      "
    >
      {/* ========================================== */}
      {/* PREMIUM GLOWS */}
      {/* ========================================== */}

      <div
        className="
          absolute
          top-[-100px]
          right-[-80px]

          h-[260px]
          w-[260px]

          rounded-full

          bg-[#F4C430]/20

          blur-[120px]
        "
      />

      <div
        className="
          absolute
          bottom-[-120px]
          left-[-100px]

          h-[260px]
          w-[260px]

          rounded-full

          bg-blue-500/20

          blur-[120px]
        "
      />

      {/* GRID */}

      <div
        className="
          absolute
          inset-0

          opacity-[0.06]

          [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]

          [background-size:60px_60px]
        "
      />

      {/* ========================================== */}
      {/* CONTENT */}
      {/* ========================================== */}

      <div className="relative z-10">
        {/* LOGO */}

        <div
          className="
            flex
            items-center

            gap-4

            mb-12
          "
        >
          <div
            className="
              h-16
              w-16

              rounded-3xl

              bg-gradient-to-br
              from-[#F4C430]
              to-[#FFD54F]

              flex
              items-center
              justify-center

              shadow-[0_15px_40px_rgba(244,196,48,.35)]
            "
          >
            <Sparkles className="text-[#071120]" size={30} />
          </div>

          <div>
            <h2
              className="
                text-3xl

                font-black

                tracking-tight
              "
            >
              CAMPUSNEXUS
            </h2>

            <p
              className="
                text-sm

                text-blue-100/70

                tracking-[3px]

                uppercase

                font-semibold
              "
            >
              Smart Campus ERP
            </p>
          </div>
        </div>

        {/* BADGE */}

        <div
          className="
            inline-flex
            items-center

            gap-2

            rounded-full

            border
            border-[#F4C430]/20

            bg-white/10

            px-5
            py-2

            text-sm

            font-semibold

            text-[#F4C430]

            backdrop-blur-xl

            mb-8
          "
        >
          <ShieldCheck size={16} />
          Enterprise Campus Platform
        </div>

        {/* TITLE */}

        <h1
          className="
            text-5xl
            md:text-6xl

            font-black

            leading-[1.05]

            tracking-tight

            mb-6
          "
        >
          {isLogin ? (
            <>
              Welcome Back to
              <span
                className="
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
              Smart ERP for
              <span
                className="
                  block

                  bg-gradient-to-r
                  from-[#60A5FA]
                  via-white
                  to-[#F4C430]

                  bg-clip-text
                  text-transparent
                "
              >
                Modern Universities
              </span>
            </>
          )}
        </h1>

        {/* DESCRIPTION */}

        <p
          className="
            max-w-xl

            text-lg

            leading-9

            text-slate-200

            mb-10
          "
        >
          {subtitle}
        </p>

        {/* FEATURES */}

        <div
          className="
            space-y-5

            mb-12
          "
        >
          {[
            "Realtime Complaint Management",
            "Hostel & Room Allocation System",
            "Inventory & Maintenance Tracking",
            "AI Powered ERP Dashboards",
          ].map((item, index) => (
            <div
              key={index}
              className="
                flex
                items-center

                gap-4
              "
            >
              <div
                className="
                  h-11
                  w-11

                  rounded-2xl

                  bg-white/10

                  border
                  border-white/10

                  flex
                  items-center
                  justify-center
                "
              >
                <Building2 className="text-[#F4C430]" size={20} />
              </div>

              <span
                className="
                  text-base

                  font-medium

                  text-slate-100
                "
              >
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* BUTTON */}

        <Link
          className="
            inline-flex
            items-center

            gap-3

            rounded-2xl

            bg-gradient-to-r
            from-[#F4C430]
            to-[#FFD54F]

            px-8
            py-4

            text-[#071120]

            font-black

            shadow-[0_15px_45px_rgba(244,196,48,.35)]

            hover:scale-105

            transition-all
            duration-300
          "
          to={buttonLink}
        >
          {buttonText}

          <ChevronRight size={20} />
        </Link>

        {/* FOOTER */}

        <div
          className="
            mt-14

            border-t
            border-white/10

            pt-6

            text-sm

            text-slate-400
          "
        >
          Developed by
          <span className="text-[#F4C430] font-bold"> Shivam Kumar Mishra</span>
          {" & "}
          <span className="text-blue-300 font-bold">Dheeraj Kumar</span>
          <div className="mt-1 text-xs text-slate-500">
            Mentor: Dr. Dinesh Sharma
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AuthPreviewPanel;
