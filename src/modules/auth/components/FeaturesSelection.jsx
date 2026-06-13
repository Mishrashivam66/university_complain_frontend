// ==========================================
// FEATURESSELECTION.jsx
// PREMIUM VC LEVEL VERSION
// ==========================================

import React from "react";

import {
  FileText,
  Home,
  ShieldCheck,
  Package,
  Bell,
  ChevronRight,
  Sparkles,
  Activity,
} from "lucide-react";

export default function FeaturesSelection() {
  const [activeCard, setActiveCard] = React.useState(null);

  const features = [
    {
      title: "Smart Complaint Management",

      icon: FileText,

      color: "from-blue-600 via-cyan-500 to-sky-400",

      glow: "bg-blue-500/20",

      desc: "AI powered complaint routing with realtime maintenance workflows.",

      points: [
        "Realtime complaint updates",
        "Priority routing",
        "Technician assignment",
        "Smart analytics",
      ],
    },

    {
      title: "Hostel Management",

      icon: Home,

      color: "from-yellow-500 via-amber-400 to-orange-300",

      glow: "bg-yellow-400/20",

      desc: "Modern hostel operations with digital room allocation system.",

      points: [
        "Room allocation",
        "Occupancy tracking",
        "Digital records",
        "Student room services",
      ],
    },

    {
      title: "Maintenance Workflow",

      icon: ShieldCheck,

      color: "from-indigo-600 via-violet-500 to-purple-400",

      glow: "bg-violet-500/20",

      desc: "Track repair workflows and service resolution efficiently.",

      points: [
        "Issue escalation",
        "Realtime workflows",
        "Repair analytics",
        "Technician tracking",
      ],
    },

    {
      title: "Inventory Management",

      icon: Package,

      color: "from-emerald-600 via-green-500 to-lime-400",

      glow: "bg-emerald-500/20",

      desc: "Advanced inventory system for campus assets and equipment.",

      points: [
        "Realtime stock updates",
        "Inventory alerts",
        "Asset monitoring",
        "Purchase records",
      ],
    },

    {
      title: "Realtime Notifications",

      icon: Bell,

      color: "from-rose-600 via-pink-500 to-fuchsia-400",

      glow: "bg-pink-500/20",

      desc: "Broadcast announcements and campus alerts instantly.",

      points: [
        "Emergency alerts",
        "Realtime notifications",
        "Live announcements",
        "Role based alerts",
      ],
    },

    {
      title: "AI Analytics Dashboard",

      icon: Activity,

      color: "from-cyan-600 via-sky-500 to-blue-400",

      glow: "bg-cyan-500/20",

      desc: "AI powered operational insights and campus analytics.",

      points: [
        "Realtime reports",
        "Performance analytics",
        "AI insights",
        "Advanced monitoring",
      ],
    },
  ];

  return (
    <section
      id="features"
      className="
        relative

        overflow-hidden

        py-32

        bg-gradient-to-b
        from-[#071120]
        via-[#081426]
        to-[#071120]
      "
    >
      {/* GRID BACKGROUND */}

      <div
        className="
          absolute
          inset-0

          opacity-[0.06]

          bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]

          bg-[size:70px_70px]
        "
      />

      {/* TOP GLOW */}

      <div
        className="
          absolute
          top-0
          left-1/2
          -translate-x-1/2

          h-[350px]
          w-[900px]

          bg-gradient-to-r
          from-blue-500/15
          via-yellow-400/15
          to-blue-500/15

          blur-[140px]
        "
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10">
        {/* TOP */}

        <div className="text-center mb-24">
          <div
            className="
              inline-flex
              items-center
              gap-2

              px-6
              py-3

              rounded-full

              bg-yellow-400/10

              border
              border-yellow-400/20

              text-yellow-300

              font-semibold

              backdrop-blur-xl

              shadow-[0_10px_40px_rgba(244,196,48,.12)]

              mb-8
            "
          >
            <Sparkles size={18} />
            Smart ERP Features
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
            Powerful Campus
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
              ERP Modules
            </span>
          </h2>

          <p
            className="
              max-w-3xl
              mx-auto

              mt-8

              text-lg
              md:text-xl

              text-slate-300

              leading-9
            "
          >
            CampusNexus combines AI powered automation, hostel management,
            maintenance workflows and realtime notifications into one futuristic
            smart campus ecosystem.
          </p>
        </div>

        {/* GRID */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3

            gap-8
          "
        >
          {features.map((item, index) => {
            const Icon = item.icon;

            const active = activeCard === index;

            return (
              <div
                key={index}
                onClick={() => setActiveCard(active ? null : index)}
                className="
                  group

                  relative

                  overflow-hidden

                  rounded-[36px]

                  border
                  border-white/10

                  bg-white/[0.04]

                  backdrop-blur-2xl

                  p-8

                  cursor-pointer

                  shadow-[0_20px_60px_rgba(0,0,0,.35)]

                  transition-all
                  duration-500

                  hover:-translate-y-3

                  hover:border-yellow-400/30

                  hover:shadow-[0_25px_80px_rgba(37,99,235,.18)]
                "
              >
                {/* GLOW */}

                <div
                  className={`
                    absolute
                    -top-16
                    -right-16

                    h-44
                    w-44

                    rounded-full

                    ${item.glow}

                    blur-3xl

                    opacity-40
                  `}
                />

                {/* ICON */}

                <div
                  className={`
                    relative

                    h-20
                    w-20

                    rounded-3xl

                    bg-gradient-to-br
                    ${item.color}

                    flex
                    items-center
                    justify-center

                    shadow-[0_20px_40px_rgba(0,0,0,.25)]

                    mb-8

                    group-hover:scale-110
                    group-hover:rotate-3

                    transition-all
                    duration-500
                  `}
                >
                  <Icon size={34} className="text-white" />
                </div>

                {/* TITLE */}

                <h3
                  className="
                    text-3xl

                    font-black

                    text-white

                    mb-5
                  "
                >
                  {item.title}
                </h3>

                {/* DESC */}

                <p
                  className="
                    text-slate-300

                    leading-8

                    text-lg

                    mb-7
                  "
                >
                  {item.desc}
                </p>

                {/* DETAILS */}

                <div
                  className={`
                    overflow-hidden

                    transition-all
                    duration-500

                    ${
                      active ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                    }
                  `}
                >
                  <div
                    className="
                      border-t
                      border-white/10

                      pt-6

                      space-y-4
                    "
                  >
                    {item.points.map((point, i) => (
                      <div
                        key={i}
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >
                        <div
                          className="
                            h-2.5
                            w-2.5

                            rounded-full

                            bg-yellow-400

                            shadow-[0_0_15px_rgba(244,196,48,.8)]
                          "
                        />

                        <span className="text-slate-200">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FOOTER */}

                <div
                  className="
                    mt-8

                    flex
                    items-center
                    justify-between
                  "
                >
                  <span
                    className="
                      text-yellow-300

                      font-semibold
                    "
                  >
                    {active ? "Hide Details" : "Explore Module"}
                  </span>

                  <ChevronRight
                    size={20}
                    className={`
                      text-yellow-300

                      transition-all
                      duration-300

                      ${active ? "rotate-90" : "group-hover:translate-x-1"}
                    `}
                  />
                </div>

                {/* BOTTOM LINE */}

                <div
                  className="
                    absolute
                    bottom-0
                    left-0

                    h-[3px]
                    w-0

                    bg-gradient-to-r
                    from-[#2563EB]
                    via-[#60A5FA]
                    to-[#F4C430]

                    group-hover:w-full

                    transition-all
                    duration-500
                  "
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
