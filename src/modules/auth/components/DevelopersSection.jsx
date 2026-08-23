import { useState } from "react";

import {
  GraduationCap,
  Sparkles,
  Code2,
  Database,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Users,
  Monitor,
} from "lucide-react";

// ==========================================
// DEVELOPERS SECTION
// ==========================================

export default function DevelopersSection() {
  const [flippedCard, setFlippedCard] = useState(null);

  // ==========================================
  // DEVELOPMENT TEAM
  // ==========================================

  const team = [
    {
      id: 1,

      name: "Shivam Kumar Mishra",

      role: "Project Lead & Full Stack Developer",

      image: "/shivam.jpeg",

      description:
        "Led the design and development of the CampusNexus ERP platform, including frontend architecture, backend APIs, authentication, complaint workflows, hostel operations, maintenance management, inventory integration and overall system architecture.",

      tags: [
        "React.js",
        "Node.js",
        "Express.js",
        "MongoDB",
        "System Architecture",
      ],

      contributions: [
        "Designed the overall CampusNexus ERP architecture",
        "Developed frontend modules using React.js and Tailwind CSS",
        "Built backend REST APIs using Node.js and Express.js",
        "Integrated MongoDB database models and workflows",
        "Implemented authentication and role-based authorization",
        "Developed complaint management and maintenance workflows",
        "Implemented worker assignment and Job Card management",
        "Developed material request and inventory workflows",
        "Integrated hostel and Warden management modules",
        "Managed integration, debugging and complete project development",
      ],

      stats: [
        {
          icon: Code2,
          value: "Full Stack",
          label: "Development",
        },

        {
          icon: Database,
          value: "MERN",
          label: "Architecture",
        },

        {
          icon: ShieldCheck,
          value: "RBAC",
          label: "Security",
        },

        {
          icon: Monitor,
          value: "Lead",
          label: "Project Role",
        },
      ],
    },

    {
      id: 2,

      name: "Dheeraj Kumar",

      role: "Frontend & Testing Support",

      image: "/dheeraj.jpeg",

      description:
        "Contributed to frontend support, interface validation, testing and deployment coordination during the CampusNexus ERP development lifecycle.",

      tags: [
        "Frontend Support",
        "UI Testing",
        "Validation",
        "Deployment Support",
      ],

      contributions: [
        "Assisted in frontend component testing",
        "Performed UI validation and responsiveness checks",
        "Supported testing of CampusNexus modules",
        "Contributed to debugging and issue validation",
        "Supported deployment workflow processes",
        "Assisted in overall system testing",
      ],

      stats: [
        {
          icon: Monitor,
          value: "UI",
          label: "Support",
        },

        {
          icon: CheckCircle2,
          value: "QA",
          label: "Testing",
        },

        {
          icon: ShieldCheck,
          value: "Check",
          label: "Validation",
        },

        {
          icon: Code2,
          value: "Web",
          label: "Support",
        },
      ],
    },

    {
      id: 3,

      name: "Ayush Tiwari",

      role: "Frontend Development & Documentation",

      image: "/ayush.jpeg",

      description:
        "Contributed to CampusNexus frontend development and project documentation, supporting user interface implementation, documentation preparation and presentation of ERP modules and workflows.",

      tags: [
        "Frontend Development",
        "React.js",
        "Documentation",
        "Project Support",
      ],

      contributions: [
        "Contributed to frontend development and UI implementation",
        "Supported React.js based interface development",
        "Prepared and maintained project documentation",
        "Documented CampusNexus modules and system workflows",
        "Supported technical documentation preparation",
        "Assisted in project presentation and reporting",
      ],

      stats: [
        {
          icon: Code2,
          value: "React",
          label: "Frontend",
        },

        {
          icon: FileText,
          value: "Docs",
          label: "Documentation",
        },

        {
          icon: Monitor,
          value: "UI",
          label: "Development",
        },

        {
          icon: Users,
          value: "Team",
          label: "Support",
        },
      ],
    },
  ];

  // ==========================================
  // FLIP CARD
  // ==========================================

  const toggleCard = (id) => {
    setFlippedCard((current) => (current === id ? null : id));
  };

  return (
    <section
      id="developers"
      className="
        relative
        overflow-hidden

        bg-gradient-to-b
        from-[#06101F]
        via-[#081526]
        to-[#040A14]

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

          bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]

          bg-[size:70px_70px]
        "
      />

      {/* BLUE GLOW */}

      <div
        className="
          pointer-events-none

          absolute
          -left-40
          top-0

          h-[520px]
          w-[520px]

          rounded-full

          bg-blue-600/15

          blur-[170px]
        "
      />

      {/* GOLD GLOW */}

      <div
        className="
          pointer-events-none

          absolute
          -bottom-40
          -right-40

          h-[520px]
          w-[520px]

          rounded-full

          bg-yellow-400/10

          blur-[170px]
        "
      />

      {/* MAROON GLOW */}

      <div
        className="
          pointer-events-none

          absolute
          left-1/2
          top-[45%]

          h-[400px]
          w-[400px]

          -translate-x-1/2

          rounded-full

          bg-[#7A0019]/10

          blur-[170px]
        "
      />

      {/* ======================================
          MAIN CONTAINER
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
            SECTION HEADING
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

              text-sm
              font-bold
              text-yellow-300

              backdrop-blur-xl
            "
          >
            <Sparkles size={17} />
            CampusNexus Project Team
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
            Guided By Experience.
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
              Built By Students.
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
            CampusNexus has been developed as a collaborative academic project
            with technical guidance, full-stack development, frontend support,
            testing and structured project documentation.
          </p>
        </div>

        {/* ======================================
            PROJECT MENTOR
        ====================================== */}

        <div className="mt-20">
          {/* MENTOR HEADING */}

          <div className="text-center">
            <p
              className="
                text-sm
                font-bold
                uppercase
                tracking-[0.2em]
                text-blue-300
              "
            >
              Academic Guidance
            </p>

            <h3
              className="
                mt-3

                text-3xl
                font-black
                text-white

                md:text-4xl
              "
            >
              Project Mentor
            </h3>

            <p
              className="
                mt-2
                text-sm
                text-slate-400
              "
            >
              Academic Guidance & Technical Supervision
            </p>
          </div>

          {/* MENTOR CARD */}

          <div
            className="
              mt-10
              flex
              justify-center
            "
          >
            <div
              className="
                group

                relative

                w-full
                max-w-3xl

                overflow-hidden

                rounded-[36px]

                border
                border-yellow-400/15

                bg-[#0B1727]/90

                p-7

                shadow-[0_30px_90px_rgba(0,0,0,.40)]

                backdrop-blur-2xl

                md:p-10
              "
            >
              {/* GLOW */}

              <div
                className="
                  pointer-events-none

                  absolute
                  -right-20
                  -top-20

                  h-72
                  w-72

                  rounded-full

                  bg-yellow-400/15

                  blur-[100px]
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

                  bg-blue-600/15

                  blur-[100px]
                "
              />

              {/* MENTOR BADGE */}

              <div
                className="
                  absolute
                  right-5
                  top-5

                  z-10

                  inline-flex
                  items-center
                  gap-2

                  rounded-full

                  border
                  border-yellow-400/20

                  bg-yellow-400/10

                  px-4
                  py-2

                  text-xs
                  font-bold
                  text-yellow-300
                "
              >
                <GraduationCap size={15} />
                Project Mentor
              </div>

              <div
                className="
                  relative

                  grid
                  grid-cols-1
                  gap-8

                  md:grid-cols-[250px_1fr]
                  md:items-center
                "
              >
                {/* IMAGE */}

                <div
                  className="
                    mx-auto

                    h-56
                    w-56

                    rounded-full

                    bg-gradient-to-br
                    from-[#2563EB]
                    via-[#60A5FA]
                    to-[#F4C430]

                    p-[5px]

                    shadow-[0_20px_60px_rgba(37,99,235,.30)]

                    md:mx-0
                  "
                >
                  <img
                    src="/dineshsir.jpeg"
                    alt="Dr. Dinesh Sharma"
                    className="
                      h-full
                      w-full

                      rounded-full

                      border-[5px]
                      border-[#071120]

                      object-cover
                    "
                  />
                </div>

                {/* DETAILS */}

                <div
                  className="
                    text-center
                    md:text-left
                  "
                >
                  <div
                    className="
                      inline-flex
                      items-center
                      gap-2

                      rounded-full

                      bg-blue-500/10

                      px-4
                      py-2

                      text-xs
                      font-bold
                      text-blue-300
                    "
                  >
                    <GraduationCap size={15} />
                    Academic Mentor
                  </div>

                  <h2
                    className="
                      mt-5

                      text-3xl
                      font-black
                      text-white

                      md:text-4xl
                    "
                  >
                    Dr. Dinesh Sharma
                  </h2>

                  <p
                    className="
                      mt-2

                      text-base
                      font-semibold
                      text-yellow-300

                      md:text-lg
                    "
                  >
                    Associate Professor • Amity University
                  </p>

                  <p
                    className="
                      mt-5

                      text-sm
                      leading-7
                      text-slate-400
                    "
                  >
                    Provided academic guidance, technical supervision and system
                    design feedback throughout the CampusNexus ERP development
                    lifecycle.
                  </p>

                  {/* MENTOR CONTRIBUTIONS */}

                  <div
                    className="
                      mt-6

                      grid
                      grid-cols-1
                      gap-3

                      sm:grid-cols-2
                    "
                  >
                    {[
                      "Technical supervision",
                      "System design guidance",
                      "Project review",
                      "Academic mentoring",
                    ].map((item) => (
                      <div
                        key={item}
                        className="
                          flex
                          items-center
                          gap-2

                          rounded-xl

                          border
                          border-white/[0.06]

                          bg-white/[0.035]

                          px-3
                          py-2.5

                          text-left
                        "
                      >
                        <CheckCircle2
                          size={15}
                          className="
                            shrink-0
                            text-emerald-400
                          "
                        />

                        <span
                          className="
                            text-xs
                            font-medium
                            text-slate-300
                          "
                        >
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================
            CORE TEAM
        ====================================== */}

        <div className="mt-24">
          <div className="text-center">
            <p
              className="
                text-sm
                font-bold
                uppercase
                tracking-[0.2em]
                text-blue-300
              "
            >
              Development
            </p>

            <h3
              className="
                mt-3

                text-3xl
                font-black
                text-white

                md:text-4xl
              "
            >
              Core Development Team
            </h3>

            <p
              className="
                mt-2
                text-sm
                text-slate-400
              "
            >
              CampusNexus ERP Development, Testing & Documentation
            </p>
          </div>

          {/* ==================================
              TEAM CARDS
          ================================== */}

          <div
            className="
              mt-12

              grid
              grid-cols-1
              gap-7

              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {team.map((member) => {
              const flipped = flippedCard === member.id;

              return (
                <div
                  key={member.id}
                  className="
                    relative
                    h-[680px]
                    cursor-pointer

                    [perspective:1800px]
                  "
                  onClick={() => toggleCard(member.id)}
                >
                  {/* FLIP CONTAINER */}

                  <div
                    className={`
                      relative

                      h-full
                      w-full

                      transition-transform
                      duration-700

                      [transform-style:preserve-3d]

                      ${flipped ? "[transform:rotateY(180deg)]" : ""}
                    `}
                  >
                    {/* ==================================
                        FRONT SIDE
                    ================================== */}

                    <div
                      className="
                        absolute
                        inset-0

                        overflow-hidden

                        rounded-[32px]

                        border
                        border-white/10

                        bg-[#0B1727]/95

                        p-7

                        shadow-[0_25px_70px_rgba(0,0,0,.35)]

                        backdrop-blur-2xl

                        [backface-visibility:hidden]
                      "
                    >
                      {/* GLOW */}

                      <div
                        className="
                          pointer-events-none

                          absolute
                          -right-20
                          -top-20

                          h-64
                          w-64

                          rounded-full

                          bg-blue-600/15

                          blur-[110px]
                        "
                      />

                      <div
                        className="
                          pointer-events-none

                          absolute
                          -bottom-20
                          -left-20

                          h-64
                          w-64

                          rounded-full

                          bg-yellow-400/10

                          blur-[110px]
                        "
                      />

                      {/* FRONT CONTENT */}

                      <div
                        className="
                          relative

                          flex
                          h-full
                          flex-col
                        "
                      >
                        {/* ROLE NUMBER */}

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                          "
                        >
                          <span
                            className="
                              text-xs
                              font-black
                              tracking-[0.2em]
                              text-white/20
                            "
                          >
                            TEAM 0{member.id}
                          </span>

                          <span
                            className="
                              rounded-full

                              border
                              border-white/10

                              bg-white/[0.04]

                              px-3
                              py-1.5

                              text-[10px]
                              font-bold
                              text-slate-400
                            "
                          >
                            Click for details
                          </span>
                        </div>

                        {/* IMAGE */}

                        <div
                          className="
                            mx-auto
                            mt-10

                            h-52
                            w-52

                            rounded-full

                            bg-gradient-to-br
                            from-[#2563EB]
                            via-[#60A5FA]
                            to-[#F4C430]

                            p-[5px]

                            shadow-[0_20px_60px_rgba(37,99,235,.30)]
                          "
                        >
                          <img
                            src={member.image}
                            alt={member.name}
                            className="
                              h-full
                              w-full

                              rounded-full

                              border-[5px]
                              border-[#071120]

                              object-cover
                            "
                          />
                        </div>

                        {/* NAME */}

                        <h2
                          className="
                            mt-8

                            text-center

                            text-2xl
                            font-black
                            text-white

                            md:text-3xl
                          "
                        >
                          {member.name}
                        </h2>

                        {/* ROLE */}

                        <p
                          className="
                            mt-3

                            min-h-[48px]

                            text-center

                            text-sm
                            font-bold
                            leading-6
                            text-yellow-300
                          "
                        >
                          {member.role}
                        </p>

                        {/* DESCRIPTION */}

                        <p
                          className="
                            mt-5

                            line-clamp-4

                            text-center

                            text-sm
                            leading-6
                            text-slate-400
                          "
                        >
                          {member.description}
                        </p>

                        {/* TAGS */}

                        <div
                          className="
                            mt-auto

                            flex
                            flex-wrap
                            justify-center
                            gap-2

                            pt-6
                          "
                        >
                          {member.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="
                                  rounded-full

                                  border
                                  border-white/[0.07]

                                  bg-white/[0.04]

                                  px-3
                                  py-1.5

                                  text-[10px]
                                  font-bold
                                  text-slate-400
                                "
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ==================================
                        BACK SIDE
                    ================================== */}

                    <div
                      className="
                        absolute
                        inset-0

                        overflow-y-auto

                        rounded-[32px]

                        border
                        border-yellow-400/15

                        bg-[#081321]

                        p-7

                        shadow-[0_25px_70px_rgba(0,0,0,.40)]

                        [transform:rotateY(180deg)]

                        [backface-visibility:hidden]
                      "
                    >
                      {/* NAME */}

                      <h2
                        className="
                          text-2xl
                          font-black
                          text-white
                        "
                      >
                        {member.name}
                      </h2>

                      <p
                        className="
                          mt-2

                          text-sm
                          font-bold
                          text-yellow-300
                        "
                      >
                        {member.role}
                      </p>

                      {/* DESCRIPTION */}

                      <p
                        className="
                          mt-5

                          text-sm
                          leading-7
                          text-slate-400
                        "
                      >
                        {member.description}
                      </p>

                      {/* CONTRIBUTIONS */}

                      <div className="mt-7">
                        <h3
                          className="
                            text-base
                            font-black
                            text-white
                          "
                        >
                          Key Contributions
                        </h3>

                        <div
                          className="
                            mt-4
                            space-y-3
                          "
                        >
                          {member.contributions.map((item, index) => (
                            <div
                              key={index}
                              className="
                                  flex
                                  items-start
                                  gap-3
                                "
                            >
                              <CheckCircle2
                                size={15}
                                className="
                                    mt-1
                                    shrink-0
                                    text-emerald-400
                                  "
                              />

                              <p
                                className="
                                    text-xs
                                    leading-6
                                    text-slate-300
                                  "
                              >
                                {item}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* TAGS */}

                      <div
                        className="
                          mt-7

                          flex
                          flex-wrap
                          gap-2
                        "
                      >
                        {member.tags.map((tag) => (
                          <span
                            key={tag}
                            className="
                                rounded-full

                                border
                                border-blue-400/10

                                bg-blue-400/[0.06]

                                px-3
                                py-1.5

                                text-[10px]
                                font-bold
                                text-blue-300
                              "
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* STATS */}

                      {member.stats && (
                        <div
                          className="
                            mt-7

                            grid
                            grid-cols-2
                            gap-3
                          "
                        >
                          {member.stats.map((item, index) => {
                            const Icon = item.icon;

                            return (
                              <div
                                key={index}
                                className="
                                    rounded-2xl

                                    border
                                    border-white/[0.07]

                                    bg-white/[0.035]

                                    p-4

                                    text-center
                                  "
                              >
                                <div
                                  className="
                                      mx-auto

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
                                  <Icon size={18} />
                                </div>

                                <h4
                                  className="
                                      mt-3

                                      text-sm
                                      font-black
                                      text-yellow-300
                                    "
                                >
                                  {item.value}
                                </h4>

                                <p
                                  className="
                                      mt-1

                                      text-[10px]
                                      text-slate-500
                                    "
                                >
                                  {item.label}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* BACK HINT */}

                      <div
                        className="
                          mt-7

                          border-t
                          border-white/[0.07]

                          pt-4

                          text-center
                        "
                      >
                        <p
                          className="
                            text-[10px]
                            font-bold
                            text-slate-500
                          "
                        >
                          Click again to return
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================
            TEAM MESSAGE
        ====================================== */}

        <div
          className="
            mx-auto
            mt-16

            max-w-4xl

            rounded-[28px]

            border
            border-white/10

            bg-gradient-to-r
            from-blue-500/[0.05]
            via-white/[0.025]
            to-yellow-400/[0.05]

            p-6

            text-center
          "
        >
          <div
            className="
              mx-auto

              flex
              h-12
              w-12
              items-center
              justify-center

              rounded-xl

              bg-yellow-400/10

              text-yellow-300
            "
          >
            <Users size={22} />
          </div>

          <h3
            className="
              mt-4

              text-lg
              font-black
              text-white
            "
          >
            Collaborative Campus Innovation
          </h3>

          <p
            className="
              mx-auto
              mt-2
              max-w-2xl

              text-sm
              leading-6
              text-slate-400
            "
          >
            CampusNexus represents a collaborative effort combining software
            development, testing, documentation and academic guidance to solve
            practical campus management challenges.
          </p>
        </div>
      </div>
    </section>
  );
}
