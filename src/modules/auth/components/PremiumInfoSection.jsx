import React from "react";

import {
  Info,
  Building2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export default function PremiumInfoSection() {
  const cards = [
    {
      title: "Navigation Assistance Guide",
      icon: Info,
      color: "from-blue-600 to-cyan-400",
      description:
        "CampusNexus ERP is optimized for touchscreens, accessibility workflows and keyboard navigation for modern smart campus operations.",
    },

    {
      title: "Departmental Sitemaps",
      icon: Building2,
      color: "from-pink-500 to-rose-400",
      description:
        "AI powered routing automatically forwards complaints to wardens, electricians, maintenance teams and inventory departments instantly.",
    },

    {
      title: "Security & Monitoring",
      icon: ShieldCheck,
      color: "from-emerald-500 to-green-400",
      description:
        "Enterprise grade monitoring with realtime issue tracking, secure access control and operational analytics dashboards.",
    },
  ];

  return (
    <section
      className="
        relative

        overflow-hidden

        py-28

        bg-gradient-to-b
        from-[#071120]
        via-[#0B1730]
        to-[#071120]
      "
    >
      {/* GRID BACKGROUND */}

      <div
        className="
          absolute
          inset-0

          opacity-[0.04]

          bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]

          bg-[size:70px_70px]
        "
      />

      {/* BLUE GLOW */}

      <div
        className="
          absolute
          top-0
          left-0

          h-[400px]
          w-[400px]

          bg-blue-500/20

          blur-[140px]
        "
      />

      {/* YELLOW GLOW */}

      <div
        className="
          absolute
          bottom-0
          right-0

          h-[400px]
          w-[400px]

          bg-yellow-400/10

          blur-[140px]
        "
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10">
        {/* TOP */}

        <div className="text-center mb-20">
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

              mb-6
            "
          >
            <Sparkles size={16} />
            Campus Intelligence
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
            Premium ERP
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
              Information Center
            </span>
          </h2>

          <p
            className="
              max-w-3xl
              mx-auto

              mt-8

              text-lg
              md:text-xl

              leading-9

              text-slate-300
            "
          >
            CampusNexus combines smart campus workflows, AI powered automation,
            maintenance systems and realtime operational intelligence into one
            premium ERP experience.
          </p>
        </div>

        {/* CARDS */}

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-3

            gap-8
          "
        >
          {cards.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="
                  group

                  relative

                  overflow-hidden

                  rounded-[34px]

                  border
                  border-yellow-400/10

                  bg-[#0F172A]/80

                  backdrop-blur-2xl

                  p-9

                  shadow-[0_20px_60px_rgba(0,0,0,.35)]

                  hover:-translate-y-3

                  hover:border-yellow-400/30

                  hover:shadow-[0_20px_60px_rgba(244,196,48,.15)]

                  transition-all
                  duration-500
                "
              >
                {/* CARD GLOW */}

                <div
                  className={`
                    absolute
                    -top-10
                    -right-10

                    h-40
                    w-40

                    rounded-full

                    bg-gradient-to-br
                    ${item.color}

                    opacity-20

                    blur-3xl
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

                    mb-8

                    shadow-[0_15px_45px_rgba(0,0,0,.25)]
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

                {/* DESCRIPTION */}

                <p
                  className="
                    text-slate-300

                    leading-8

                    text-lg

                    mb-8
                  "
                >
                  {item.description}
                </p>

                {/* BUTTON */}

                <button
                  className="
                    inline-flex
                    items-center
                    gap-2

                    text-yellow-300

                    font-semibold

                    group-hover:gap-3

                    transition-all
                  "
                >
                  Learn More
                  <ChevronRight size={18} />
                </button>
              </div>
            );
          })}
        </div>

        {/* BOTTOM PANEL */}

        <div
          className="
            relative

            overflow-hidden

            mt-24

            rounded-[40px]

            border
            border-yellow-400/10

            bg-white/[0.04]

            backdrop-blur-2xl

            p-10
            md:p-16

            shadow-[0_25px_80px_rgba(0,0,0,.45)]
          "
        >
          {/* PANEL GLOW */}

          <div
            className="
              absolute
              top-0
              right-0

              h-72
              w-72

              bg-yellow-400/20

              blur-[120px]
            "
          />

          <div
            className="
              absolute
              bottom-0
              left-0

              h-72
              w-72

              bg-blue-500/20

              blur-[120px]
            "
          />

          <div
            className="
              relative

              grid
              grid-cols-1
              md:grid-cols-4

              gap-8
            "
          >
            {[
              {
                value: "12K+",
                label: "Students Managed",
              },

              {
                value: "24/7",
                label: "Realtime Monitoring",
              },

              {
                value: "99%",
                label: "Issue Resolution",
              },

              {
                value: "4.8★",
                label: "Campus Rating",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="
                  rounded-3xl

                  border
                  border-white/10

                  bg-white/[0.05]

                  p-8

                  text-center

                  backdrop-blur-xl

                  hover:border-yellow-400/20

                  hover:-translate-y-2

                  transition-all
                  duration-500
                "
              >
                <h3
                  className="
                    text-5xl

                    font-black

                    text-yellow-300

                    mb-4
                  "
                >
                  {item.value}
                </h3>

                <p className="text-slate-300">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
