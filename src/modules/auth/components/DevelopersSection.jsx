import React, { useEffect, useState } from "react";

import {
  GraduationCap,
  Sparkles,
  Code2,
  Database,
  ShieldCheck,
  BrainCircuit,
} from "lucide-react";

export default function DevelopersSection() {
  const [flippedCard, setFlippedCard] = useState(null);

  const team = [
    {
      id: 1,

      name: "Shivam Kumar Mishra",

      role: "Founder & Lead Developer",

      image: "/shivam.jpeg",

      description:
        "Designed and developed the complete CampusNexus ERP ecosystem including frontend architecture, backend APIs, authentication systems, realtime workflows, analytics dashboards and smart campus automation systems.",

      tags: ["React.js", "Node.js", "MongoDB", "AI Systems"],

      contributions: [
        "Developed complete frontend architecture using React.js",
        "Built backend APIs using Node.js and Express.js",
        "Integrated MongoDB database workflows",
        "Designed realtime complaint management systems",
        "Implemented hostel allocation workflows",
        "Created AI powered analytics dashboards",
        "Developed inventory and maintenance modules",
        "Built responsive UI/UX with Tailwind CSS",
        "Integrated authentication and security systems",
        "Managed complete ERP project architecture",
      ],

      stats: [
        {
          icon: Code2,
          value: "50+",
          label: "Frontend",
        },

        {
          icon: Database,
          value: "30+",
          label: "Backend APIs",
        },

        {
          icon: BrainCircuit,
          value: "AI",
          label: "Automation",
        },

        {
          icon: ShieldCheck,
          value: "100%",
          label: "Project Lead",
        },
      ],
    },

    {
      id: 2,

      name: "Dheeraj Kumar",

      role: "Frontend & Testing Support",

      image: "/dheeraj.jpeg",

      description:
        "Contributed in frontend support, UI testing, deployment coordination and validation processes during the CampusNexus ERP development lifecycle.",

      tags: ["Frontend Support", "Testing", "Deployment", "Validation"],

      contributions: [
        "Assisted in frontend component testing",
        "Performed UI validation and responsiveness checks",
        "Supported deployment workflow processes",
        "Contributed in testing and debugging support",
        "Helped in system validation and optimization",
      ],
    },
  ];

  // AUTO FLIP

  //   useEffect(() => {
  //     const interval = setInterval(() => {
  //       setFlippedCard((prev) => {
  //         if (prev === null) return 1;

  //         if (prev === 1) return 2;

  //         return 1;
  //       });
  //     }, 3500);

  //     return () => clearInterval(interval);
  //   }, []);

  return (
    <section
      id="developers"
      className="
        relative
        overflow-hidden
        py-32

        bg-gradient-to-b
        from-black
        via-[#050B18]
        to-black
      "
    >
      {/* GRID */}

      <div
        className="
          absolute
          inset-0

          opacity-[0.04]

          bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]

          bg-[size:70px_70px]
        "
      />

      {/* GLOW */}

      <div
        className="
          absolute
          top-0
          left-0

          h-[500px]
          w-[500px]

          bg-blue-500/20

          blur-[180px]
        "
      />

      <div
        className="
          absolute
          bottom-0
          right-0

          h-[500px]
          w-[500px]

          bg-yellow-400/15

          blur-[180px]
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

              border
              border-yellow-400/20

              bg-yellow-400/10

              text-yellow-300

              font-semibold

              mb-8
            "
          >
            <Sparkles size={18} />
            CampusNexus Leadership
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
            Meet Our
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
              Development Team
            </span>
          </h2>
        </div>

        {/* MENTOR */}

        <div className="mb-24">
          <div className="text-center mb-10">
            <h3
              className="
                text-3xl
                md:text-4xl

                font-black

                text-white

                mb-3
              "
            >
              Project Mentor
            </h3>

            <p className="text-slate-400 text-lg">
              Academic Guidance & Technical Supervision
            </p>
          </div>

          <div className="flex justify-center">
            <div
              className="
                group

                relative

                overflow-hidden

                rounded-[40px]

                border
                border-yellow-400/20

                bg-white/[0.04]

                backdrop-blur-2xl

                p-10

                w-full
                max-w-2xl

                shadow-[0_20px_80px_rgba(0,0,0,.45)]

                hover:border-yellow-400/40

                hover:shadow-[0_35px_120px_rgba(244,196,48,.18)]

                transition-all
                duration-500
              "
            >
              {/* GLOW */}

              <div
                className="
                  absolute
                  -top-10
                  -right-10

                  h-60
                  w-60

                  rounded-full

                  bg-yellow-400/20

                  blur-[100px]

                  opacity-40

                  group-hover:opacity-80

                  transition-all
                  duration-500
                "
              />

              <div className="relative text-center">
                {/* IMAGE */}

                <div className="flex justify-center mb-8">
                  <div
                    className="
                      h-56
                      w-56

                      rounded-full

                      p-[5px]

                      bg-gradient-to-br
                      from-[#2563EB]
                      via-[#60A5FA]
                      to-[#F4C430]

                      shadow-[0_25px_80px_rgba(37,99,235,.35)]
                    "
                  >
                    <img
                      src="/dineshsir.jpeg"
                      alt="Dr. Dinesh Sharma"
                      className="
                        h-full
                        w-full

                        rounded-full

                        object-cover

                        border-[5px]
                        border-black
                      "
                    />
                  </div>
                </div>

                {/* BADGE */}

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
                  <GraduationCap size={18} />
                  Mentor
                </div>

                {/* NAME */}

                <h2
                  className="
                    text-4xl

                    font-black

                    text-white

                    mb-4
                  "
                >
                  Dr. Dinesh Sharma
                </h2>

                {/* ROLE */}

                <p
                  className="
                    text-yellow-300

                    text-xl

                    font-semibold

                    mb-8
                  "
                >
                  Associate Professor • Amity University
                </p>

                {/* DESCRIPTION */}

                <p
                  className="
                    text-slate-300

                    leading-8

                    text-base
                  "
                >
                  Guided and mentored the complete CampusNexus ERP development
                  lifecycle with expertise in intelligent systems and smart
                  educational technologies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TEAM */}

        <div className="text-center mb-14">
          <h3
            className="
              text-3xl
              md:text-4xl

              font-black

              text-white

              mb-3
            "
          >
            Core Development Team
          </h3>

          <p className="text-slate-400 text-lg">Smart Campus ERP Engineers</p>
        </div>

        {/* CARDS */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2

            gap-10
          "
        >
          {team.map((member) => {
            const flipped = flippedCard === member.id;

            return (
              <div
                key={member.id}
                className="
    group

    relative

    h-[700px]

    [perspective:2000px]
  "
              >
                <div
                  className="
    relative

    h-full
    w-full

    transition-transform
    duration-1000

    [transform-style:preserve-3d]

    group-hover:[transform:rotateY(180deg)]
  "
                >
                  {/* FRONT */}

                  <div
                    className="
                      absolute
                      inset-0

                      rounded-[36px]

                      border
                      border-white/10

                      bg-black/90

                      backdrop-blur-2xl

                      p-10

                      flex
                      flex-col
                      items-center
                      justify-center

                      shadow-[0_20px_80px_rgba(0,0,0,.45)]

                      hover:border-yellow-400/20

                      hover:shadow-[0_30px_100px_rgba(37,99,235,.18)]

                      transition-all
                      duration-500

                      [backface-visibility:hidden]
                    "
                  >
                    {/* IMAGE */}

                    <div
                      className="
                        h-64
                        w-64

                        rounded-full

                        p-[5px]

                        bg-gradient-to-br
                        from-[#2563EB]
                        via-[#60A5FA]
                        to-[#F4C430]

                        shadow-[0_25px_80px_rgba(37,99,235,.35)]

                        mb-10
                      "
                    >
                      <img
                        src={member.image}
                        alt={member.name}
                        className="
                          h-full
                          w-full

                          rounded-full

                          object-cover

                          border-[5px]
                          border-black
                        "
                      />
                    </div>

                    {/* NAME */}

                    <h2
                      className="
                        text-4xl

                        font-black

                        text-white

                        mb-4

                        text-center
                      "
                    >
                      {member.name}
                    </h2>

                    {/* ROLE */}

                    <p
                      className="
                        text-slate-300

                        text-xl

                        text-center
                      "
                    >
                      {member.role}
                    </p>
                  </div>

                  {/* BACK */}

                  <div
                    className="
                      absolute
                      inset-0

                      rounded-[36px]

                      border
                      border-white/10

                      bg-black/95

                      backdrop-blur-2xl

                      p-10

                      shadow-[0_20px_80px_rgba(0,0,0,.45)]

                      hover:border-yellow-400/20

                      hover:shadow-[0_30px_100px_rgba(244,196,48,.18)]

                      transition-all
                      duration-500

                      [transform:rotateY(180deg)]

                      [backface-visibility:hidden]

                      overflow-y-auto
                    "
                  >
                    {/* NAME */}

                    <h2
                      className="
                        text-4xl

                        font-black

                        text-white

                        mb-4
                      "
                    >
                      {member.name}
                    </h2>

                    {/* ROLE */}

                    <p
                      className="
                        text-yellow-300

                        text-xl

                        mb-8

                        font-semibold
                      "
                    >
                      {member.role}
                    </p>

                    {/* DESCRIPTION */}

                    <p
                      className="
                        text-slate-300

                        leading-9

                        text-base

                        mb-10
                      "
                    >
                      {member.description}
                    </p>

                    {/* CONTRIBUTIONS */}

                    <div className="mb-10">
                      <h3
                        className="
                          text-white

                          text-2xl

                          font-bold

                          mb-6
                        "
                      >
                        Key Contributions
                      </h3>

                      <div className="space-y-4">
                        {member.contributions.map((item, i) => (
                          <div
                            key={i}
                            className="
                              flex
                              items-start
                              gap-3
                            "
                          >
                            <div
                              className="
                                h-2.5
                                w-2.5

                                rounded-full

                                bg-yellow-400

                                mt-2
                              "
                            />

                            <p className="text-slate-300 leading-7">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* TAGS */}

                    <div
                      className="
                        flex
                        flex-wrap

                        gap-3

                        mb-12
                      "
                    >
                      {member.tags.map((tag, i) => (
                        <div
                          key={i}
                          className="
                            px-5
                            py-2

                            rounded-full

                            bg-white/10

                            border
                            border-white/10

                            text-slate-300

                            text-sm
                          "
                        >
                          {tag}
                        </div>
                      ))}
                    </div>

                    {/* STATS */}

                    {member.stats && (
                      <div
                        className="
                          grid
                          grid-cols-2

                          gap-5
                        "
                      >
                        {member.stats.map((item, index) => {
                          const Icon = item.icon;

                          return (
                            <div
                              key={index}
                              className="
                                rounded-3xl

                                border
                                border-white/10

                                bg-white/[0.05]

                                p-6

                                text-center
                              "
                            >
                              <div
                                className="
                                  h-14
                                  w-14

                                  rounded-2xl

                                  bg-gradient-to-br
                                  from-[#2563EB]
                                  to-[#60A5FA]

                                  flex
                                  items-center
                                  justify-center

                                  mx-auto

                                  mb-4
                                "
                              >
                                <Icon size={24} className="text-white" />
                              </div>

                              <h3
                                className="
                                  text-3xl

                                  font-black

                                  text-yellow-300

                                  mb-2
                                "
                              >
                                {item.value}
                              </h3>

                              <p className="text-slate-300 text-sm">
                                {item.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
