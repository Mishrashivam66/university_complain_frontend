import React from "react";

import {
  Activity,
  Bell,
  Users,
  Wrench,
  Package,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  MonitorSmartphone,
  BarChart3,
} from "lucide-react";

export default function PortalDemo() {
  const complaints = [
    {
      id: 1,
      title: "Water Leakage in Hostel A",
      status: "Pending",
      priority: "High",
    },

    {
      id: 2,
      title: "WiFi Issue in Block C",
      status: "Resolved",
      priority: "Medium",
    },

    {
      id: 3,
      title: "Room Fan Repair",
      status: "In Progress",
      priority: "Low",
    },
  ];

  return (
    <section
      id="portal-demo"
      className="
        relative

        overflow-hidden

        py-32

        bg-[#071120]
      "
    >
      {/* ========================================== */}
      {/* BACKGROUND */}
      {/* ========================================== */}

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
          top-[-250px]
          left-[-150px]

          h-[500px]
          w-[500px]

          rounded-full

          bg-blue-600/20

          blur-[120px]
        "
      />

      <div
        className="
          absolute
          bottom-[-250px]
          right-[-150px]

          h-[500px]
          w-[500px]

          rounded-full

          bg-[#F4C430]/20

          blur-[120px]
        "
      />

      {/* ========================================== */}
      {/* CONTAINER */}
      {/* ========================================== */}

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
        {/* ========================================== */}
        {/* TOP */}
        {/* ========================================== */}

        <div className="text-center mb-24">
          <div
            className="
              inline-flex
              items-center
              gap-2

              px-5
              py-2

              rounded-full

              border
              border-yellow-400/20

              bg-yellow-400/10

              text-yellow-300

              font-semibold

              mb-7
            "
          >
            <Sparkles size={18} />
            Live ERP Experience
          </div>

          <h2
            className="
              text-5xl
              md:text-7xl

              font-black

              leading-tight

              text-white
            "
          >
            Smart Campus
            <br />
            <span
              className="
                bg-gradient-to-r
                from-[#2563EB]
                via-[#60A5FA]
                to-[#F4C430]

                bg-clip-text
                text-transparent
              "
            >
              ERP Dashboard
            </span>
          </h2>

          <p
            className="
              max-w-3xl
              mx-auto

              mt-8

              text-lg
              md:text-xl

              leading-relaxed

              text-slate-300
            "
          >
            Experience realtime complaint management, AI analytics, hostel
            automation and enterprise-grade campus workflows powered by
            CampusNexus.
          </p>
        </div>

        {/* ========================================== */}
        {/* STATS */}
        {/* ========================================== */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-4

            gap-7

            mb-16
          "
        >
          {[
            {
              title: "Total Students",
              value: "5,420",
              icon: Users,
              color: "from-blue-600 to-cyan-400",
            },

            {
              title: "Pending Complaints",
              value: "86",
              icon: AlertTriangle,
              color: "from-red-500 to-rose-500",
            },

            {
              title: "Resolved Today",
              value: "312",
              icon: CheckCircle2,
              color: "from-emerald-500 to-green-400",
            },

            {
              title: "System Efficiency",
              value: "98%",
              icon: Activity,
              color: "from-[#F4C430] to-[#FFD54F]",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="
                  relative

                  overflow-hidden

                  rounded-[34px]

                  border
                  border-white/10

                  bg-white/5

                  backdrop-blur-xl

                  p-8

                  hover:-translate-y-2

                  transition-all
                  duration-500
                "
              >
                <div
                  className={`
                    absolute
                    top-[-60px]
                    right-[-60px]

                    h-40
                    w-40

                    rounded-full

                    bg-gradient-to-br
                    ${item.color}

                    opacity-20

                    blur-[80px]
                  `}
                />

                <div
                  className={`
                    h-16
                    w-16

                    rounded-2xl

                    bg-gradient-to-br
                    ${item.color}

                    flex
                    items-center
                    justify-center

                    mb-6
                  `}
                >
                  <Icon className="text-white" size={30} />
                </div>

                <p className="text-slate-400 text-sm">{item.title}</p>

                <h3
                  className="
                    text-5xl

                    font-black

                    text-white

                    mt-3
                  "
                >
                  {item.value}
                </h3>
              </div>
            );
          })}
        </div>

        {/* ========================================== */}
        {/* MAIN GRID */}
        {/* ========================================== */}

        <div
          className="
            grid
            grid-cols-1
            xl:grid-cols-3

            gap-8
          "
        >
          {/* ========================================== */}
          {/* LEFT */}
          {/* ========================================== */}

          <div
            className="
              xl:col-span-2

              rounded-[40px]

              border
              border-white/10

              bg-white/5

              backdrop-blur-2xl

              overflow-hidden
            "
          >
            {/* TOP */}

            <div
              className="
                flex
                items-center
                justify-between

                border-b
                border-white/10

                px-8
                py-6
              "
            >
              <div>
                <h3
                  className="
                    text-3xl

                    font-black

                    text-white
                  "
                >
                  ERP Control Center
                </h3>

                <p className="text-slate-400 mt-2">
                  Smart campus operational monitoring
                </p>
              </div>

              <button
                className="
                  px-6
                  py-3

                  rounded-2xl

                  bg-gradient-to-r
                  from-[#2563EB]
                  to-[#F4C430]

                  text-[#071120]

                  font-bold

                  flex
                  items-center
                  gap-2

                  hover:scale-105

                  transition-all
                "
              >
                Launch ERP
                <ChevronRight size={18} />
              </button>
            </div>

            {/* MODULES */}

            <div className="p-8">
              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2

                  gap-6
                "
              >
                {[
                  {
                    title: "Student Portal",
                    icon: Users,
                    color: "from-blue-600 to-cyan-400",
                  },

                  {
                    title: "Maintenance Workflow",
                    icon: Wrench,
                    color: "from-red-500 to-pink-500",
                  },

                  {
                    title: "Inventory Control",
                    icon: Package,
                    color: "from-yellow-500 to-amber-300",
                  },

                  {
                    title: "Realtime Notifications",
                    icon: Bell,
                    color: "from-emerald-500 to-green-400",
                  },

                  {
                    title: "AI Monitoring",
                    icon: Cpu,
                    color: "from-violet-600 to-indigo-500",
                  },

                  {
                    title: "Analytics Dashboard",
                    icon: BarChart3,
                    color: "from-cyan-500 to-sky-400",
                  },
                ].map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={index}
                      className="
                        rounded-[30px]

                        border
                        border-white/10

                        bg-white/[0.04]

                        p-7

                        hover:-translate-y-2

                        transition-all
                        duration-500
                      "
                    >
                      <div
                        className={`
                          h-16
                          w-16

                          rounded-2xl

                          bg-gradient-to-br
                          ${item.color}

                          flex
                          items-center
                          justify-center

                          mb-6
                        `}
                      >
                        <Icon className="text-white" size={28} />
                      </div>

                      <h4
                        className="
                          text-2xl

                          font-bold

                          text-white
                        "
                      >
                        {item.title}
                      </h4>

                      <p
                        className="
                          mt-3

                          leading-7

                          text-slate-400
                        "
                      >
                        Enterprise-grade intelligent campus operations powered
                        by realtime infrastructure.
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* RIGHT */}
          {/* ========================================== */}

          <div
            className="
              rounded-[40px]

              border
              border-white/10

              bg-white/5

              backdrop-blur-2xl

              overflow-hidden
            "
          >
            {/* HEADER */}

            <div
              className="
                border-b
                border-white/10

                px-7
                py-6
              "
            >
              <div className="flex items-center gap-3">
                <MonitorSmartphone className="text-yellow-300" size={24} />

                <h3
                  className="
                    text-3xl

                    font-black

                    text-white
                  "
                >
                  Live Activities
                </h3>
              </div>

              <p className="text-slate-400 mt-3">
                Realtime complaint activity monitoring
              </p>
            </div>

            {/* COMPLAINTS */}

            <div className="p-6 space-y-5">
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="
                    rounded-[28px]

                    border
                    border-white/10

                    bg-white/[0.04]

                    p-5
                  "
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4
                        className="
                          text-lg

                          font-bold

                          text-white
                        "
                      >
                        {complaint.title}
                      </h4>

                      <div className="flex items-center gap-2 mt-3">
                        <Clock3 size={15} className="text-slate-400" />

                        <span className="text-sm text-slate-400">
                          Priority: {complaint.priority}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`
                        px-3
                        py-1.5

                        rounded-full

                        text-xs
                        font-bold

                        ${
                          complaint.status === "Resolved"
                            ? `
                              bg-emerald-500/20
                              text-emerald-300
                            `
                            : complaint.status === "Pending"
                              ? `
                                bg-red-500/20
                                text-red-300
                              `
                              : `
                                bg-yellow-500/20
                                text-yellow-300
                              `
                        }
                      `}
                    >
                      {complaint.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FOOTER */}

            <div
              className="
                border-t
                border-white/10

                px-7
                py-5
              "
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-emerald-400" size={18} />

                <span className="text-slate-300 text-sm">
                  Enterprise Security & Realtime Monitoring Enabled
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
