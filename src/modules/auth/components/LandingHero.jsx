import React from "react";

import {
  ArrowRight,
  Bell,
  ShieldCheck,
  Activity,
  Users,
  CheckCircle2,
  Clock3,
  Sparkles,
  Zap,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function LandingHero() {
  const navigate = useNavigate();

  return (
    <section
      className="
        relative
        overflow-hidden

        min-h-screen

        bg-[#06101F]

        flex
        items-center
      "
    >
      {/* ========================================== */}
      {/* PREMIUM BACKGROUND */}
      {/* ========================================== */}

      <div
        className="
          absolute
          inset-0

          bg-[radial-gradient(circle_at_top_right,rgba(244,196,48,.18),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,.20),transparent_30%)]
        "
      />

      <div
        className="
          absolute
          inset-0

          opacity-[0.05]

          [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]

          [background-size:70px_70px]
        "
      />

      {/* GLOW */}

      <div
        className="
          absolute
          top-[-200px]
          right-[-150px]

          h-[500px]
          w-[500px]

          rounded-full

          bg-[#F4C430]/20

          blur-[140px]
        "
      />

      <div
        className="
          absolute
          bottom-[-200px]
          left-[-150px]

          h-[500px]
          w-[500px]

          rounded-full

          bg-[#2563EB]/20

          blur-[140px]
        "
      />

      {/* ========================================== */}
      {/* MAIN */}
      {/* ========================================== */}

      <div
        className="
          relative
          z-10

          max-w-7xl
          mx-auto

          px-6
          lg:px-10

          pt-36
          pb-20

          grid
          lg:grid-cols-2

          gap-20

          items-center
        "
      >
        {/* ========================================== */}
        {/* LEFT */}
        {/* ========================================== */}

        <div>
          {/* BADGE */}

          <div
            className="
              inline-flex
              items-center
              gap-3

              px-5
              py-3

              rounded-full

              border
              border-[#F4C430]/20

              bg-white/5

              backdrop-blur-xl

              mb-8
            "
          >
            <Zap className="text-[#F4C430]" size={18} />

            <span
              className="
                text-sm
                font-bold
                tracking-wide

                text-white
              "
            >
              AI Powered Smart Campus ERP
            </span>
          </div>

          {/* TITLE */}

          <h1
            className="
              text-5xl
              md:text-7xl

              leading-[1]

              font-black

              text-white
            "
          >
            The Future Of
            <span
              className="
                block
                mt-3

                bg-gradient-to-r
                from-[#F4C430]
                via-[#FFE082]
                to-[#ffffff]

                bg-clip-text
                text-transparent
              "
            >
              Campus ERP
            </span>
          </h1>

          {/* SUB */}

          <p
            className="
              mt-8

              text-xl

              leading-9

              text-slate-300

              max-w-2xl
            "
          >
            Streamline hostel management, complaint resolution, inventory
            tracking, maintenance workflows, and real-time campus operations
            through one intelligent digital ecosystem.
          </p>

          {/* BUTTONS */}

          <div
            className="
              mt-10

              flex
              flex-wrap

              gap-5
            "
          >
            {/* BUTTON */}

            <button
              onClick={() => navigate("/login")}
              className="
                group

                px-9
                py-4

                rounded-2xl

                bg-gradient-to-r
                from-[#F4C430]
                to-[#FFD54F]

                text-[#071120]

                font-black

                shadow-[0_18px_45px_rgba(244,196,48,.35)]

                hover:scale-105

                transition-all
                duration-300
              "
            >
              <div className="flex items-center gap-3">
                Launch ERP
                <ArrowRight
                  size={18}
                  className="
                    transition-all
                    group-hover:translate-x-1
                  "
                />
              </div>
            </button>

            {/* BUTTON */}

            <button
              onClick={() => {
                const el = document.getElementById("solutions");

                if (el) {
                  el.scrollIntoView({
                    behavior: "smooth",
                  });
                }
              }}
              className="
                px-9
                py-4

                rounded-2xl

                border
                border-white/10

                bg-white/5

                backdrop-blur-xl

                text-white

                font-semibold

                hover:bg-white/10

                transition-all
              "
            >
              Explore Features
            </button>
          </div>

          {/* STATS */}

          <div
            className="
              mt-16

              grid
              grid-cols-3

              gap-5
            "
          >
            {/* CARD */}

            <div
              className="
                rounded-3xl

                border
                border-white/10

                bg-white/5

                backdrop-blur-xl

                p-6
              "
            >
              <Users className="text-[#F4C430] mb-3" />

   <h2 className="text-4xl font-black text-white">
  4.8K+
</h2>

              <p className="text-slate-300 mt-2 text-sm">Active Students</p>
            </div>

            {/* CARD */}

            <div
              className="
                rounded-3xl

                border
                border-white/10

                bg-white/5

                backdrop-blur-xl

                p-6
              "
            >
              <CheckCircle2 className="text-emerald-400 mb-3" />

              <h3
                className="
                  text-4xl
                  font-black
                  text-white
                "
              >
                18K+
              </h3>

              <p className="text-slate-300 mt-2 text-sm">Tickets Solved</p>
            </div>

            {/* CARD */}

            <div
              className="
                rounded-3xl

                border
                border-white/10

                bg-white/5

                backdrop-blur-xl

                p-6
              "
            >
              <Clock3 className="text-cyan-400 mb-3" />

              <h3
                className="
                  text-4xl
                  font-black
                  text-white
                "
              >
                3.2h
              </h3>

              <p className="text-slate-300 mt-2 text-sm">Avg Response</p>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT SIDE */}
        {/* ========================================== */}

        <div className="relative">
          {/* MAIN PANEL */}

          <div
            className="
              relative

              rounded-[38px]

              border
              border-white/10

              bg-white/10

              backdrop-blur-2xl

              p-8

              shadow-[0_30px_80px_rgba(0,0,0,.45)]
            "
          >
            {/* TOP */}

            <div
              className="
                flex
                items-center
                justify-between

                mb-8
              "
            >
              <div>
                <h3
                  className="
                    text-2xl
                    font-black
                    text-white
                  "
                >
                  Campus Operations
                </h3>

                <p className="text-slate-300 mt-1">Real-time ERP Monitoring</p>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-2

                  px-4
                  py-2

                  rounded-full

                  bg-emerald-500/20

                  text-emerald-300

                  font-semibold
                  text-sm
                "
              >
                <Activity size={16} />
                Live
              </div>
            </div>

            {/* LIVE FEED */}

            <div className="space-y-5">
              {/* ITEM */}

              <div
                className="
                  p-5

                  rounded-3xl

                  bg-[#0A1324]/80

                  border
                  border-white/5

                  flex
                  justify-between
                  items-start
                "
              >
                <div>
                  <h4 className="text-white font-bold">Complaint Submitted</h4>

                  <p className="text-slate-400 text-sm mt-2">
                    Room 302 • Electrical Issue
                  </p>
                </div>

                <span
                  className="
                    px-3
                    py-1

                    rounded-full

                    bg-yellow-500/20

                    text-yellow-300

                    text-xs
                    font-bold
                  "
                >
                  HIGH
                </span>
              </div>

              {/* ITEM */}

              <div
                className="
                  p-5

                  rounded-3xl

                  bg-[#0A1324]/80

                  border
                  border-white/5

                  flex
                  justify-between
                  items-start
                "
              >
                <div>
                  <h4 className="text-white font-bold">Technician Assigned</h4>

                  <p className="text-slate-400 text-sm mt-2">
                    Maintenance team dispatched
                  </p>
                </div>

                <ShieldCheck className="text-cyan-400" />
              </div>

              {/* ITEM */}

              <div
                className="
                  p-5

                  rounded-3xl

                  bg-[#0A1324]/80

                  border
                  border-white/5

                  flex
                  justify-between
                  items-start
                "
              >
                <div>
                  <h4 className="text-white font-bold">ERP Notification</h4>

                  <p className="text-slate-400 text-sm mt-2">
                    Water supply maintenance scheduled
                  </p>
                </div>

                <Bell className="text-[#F4C430]" />
              </div>
            </div>

            {/* ANALYTICS */}

            <div
              className="
                mt-8

                grid
                grid-cols-2

                gap-5
              "
            >
              <div
                className="
                  rounded-3xl

                  bg-gradient-to-br
                  from-[#0F4C81]
                  to-[#2563EB]

                  p-6

                  text-white
                "
              >
                <p className="text-blue-100 text-sm">Open Complaints</p>

                <h3
                  className="
                    text-5xl
                    font-black
                    mt-3
                  "
                >
                  42
                </h3>
              </div>

              <div
                className="
                  rounded-3xl

                  bg-gradient-to-br
                  from-[#7A0019]
                  to-[#B91C1C]

                  p-6

                  text-white
                "
              >
                <p className="text-red-100 text-sm">Resolved Today</p>

                <h3
                  className="
                    text-5xl
                    font-black
                    mt-3
                  "
                >
                  118
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
