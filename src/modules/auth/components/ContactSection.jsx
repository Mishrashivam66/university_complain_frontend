import {
  Sparkles,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  MapPin,
  Clock3,
  ArrowUpRight,
  LifeBuoy,
} from "lucide-react";

// ==========================================
// CONTACT SECTION
// ==========================================

export default function ContactSection() {
  const contactCards = [
    {
      title: "Email Support",

      value: "Shivammgrmishra@gmail.com",

      description:
        "For CampusNexus technical queries, project assistance and ERP related support.",

      icon: Mail,

      color: "from-[#1D4ED8] via-[#2563EB] to-[#60A5FA]",

      glow: "bg-blue-500/15",

      link: "mailto:Shivammgrmishra@gmail.com",
    },

    {
      title: "Contact Support",

      value: "+91 9341308920",

      description:
        "Contact the CampusNexus project team for technical and system related assistance.",

      icon: Phone,

      color: "from-[#047857] via-[#059669] to-[#34D399]",

      glow: "bg-emerald-500/15",

      link: "tel:+919341308920",
    },

    {
      title: "Campus",

      value: "Amity University Gwalior",

      description:
        "CampusNexus is designed around practical university and campus operational workflows.",

      icon: Building2,

      color: "from-[#B7791F] via-[#D4A72C] to-[#F4C430]",

      glow: "bg-yellow-400/15",

      link: null,
    },

    {
      title: "ERP Assistance",

      value: "Project Support",

      description:
        "Support for account access, ERP modules, workflow understanding and technical issues.",

      icon: LifeBuoy,

      color: "from-[#5B1025] via-[#7A0019] to-[#A61B3C]",

      glow: "bg-red-700/15",

      link: null,
    },
  ];

  return (
    <section
      id="contact"
      className="
        relative
        overflow-hidden

        border-t
        border-white/10

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

      {/* ======================================
          BLUE GLOW
      ====================================== */}

      <div
        className="
          pointer-events-none

          absolute
          -left-32
          top-0

          h-[480px]
          w-[480px]

          rounded-full

          bg-blue-600/15

          blur-[160px]
        "
      />

      {/* ======================================
          GOLD GLOW
      ====================================== */}

      <div
        className="
          pointer-events-none

          absolute
          -bottom-32
          -right-32

          h-[480px]
          w-[480px]

          rounded-full

          bg-yellow-400/10

          blur-[160px]
        "
      />

      {/* ======================================
          MAROON GLOW
      ====================================== */}

      <div
        className="
          pointer-events-none

          absolute
          left-1/2
          top-1/2

          h-[350px]
          w-[350px]

          -translate-x-1/2
          -translate-y-1/2

          rounded-full

          bg-[#7A0019]/10

          blur-[160px]
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
            SECTION HEADER
        ====================================== */}

        <div
          className="
            mx-auto
            max-w-4xl

            text-center
          "
        >
          {/* BADGE */}

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
            CampusNexus Support
          </div>

          {/* TITLE */}

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
            Connect With The
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
              CampusNexus Team
            </span>
          </h2>

          {/* DESCRIPTION */}

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
            For technical assistance, CampusNexus access queries, project
            information or ERP workflow support, connect with the project team
            using the available support channels.
          </p>
        </div>

        {/* ======================================
            CONTACT CARDS
        ====================================== */}

        <div
          className="
            mt-16

            grid
            grid-cols-1
            gap-6

            md:grid-cols-2
            xl:grid-cols-4
          "
        >
          {contactCards.map((item, index) => {
            const Icon = item.icon;

            const cardContent = (
              <>
                {/* TOP COLOR */}

                <div
                  className={`
                    absolute
                    left-0
                    top-0

                    h-[3px]
                    w-full

                    bg-gradient-to-r
                    ${item.color}

                    opacity-80
                  `}
                />

                {/* GLOW */}

                <div
                  className={`
                    pointer-events-none

                    absolute
                    -right-16
                    -top-16

                    h-44
                    w-44

                    rounded-full

                    ${item.glow}

                    blur-3xl

                    transition-opacity
                    duration-500

                    group-hover:opacity-100
                  `}
                />

                {/* CARD NUMBER */}

                <span
                  className="
                    absolute
                    right-6
                    top-6

                    text-[10px]
                    font-black
                    tracking-[0.2em]
                    text-white/20
                  "
                >
                  0{index + 1}
                </span>

                {/* ICON */}

                <div
                  className={`
                    relative

                    flex
                    h-16
                    w-16
                    items-center
                    justify-center

                    rounded-2xl

                    bg-gradient-to-br
                    ${item.color}

                    shadow-[0_15px_35px_rgba(0,0,0,.30)]

                    transition-all
                    duration-500

                    group-hover:-translate-y-1
                    group-hover:scale-105
                  `}
                >
                  <Icon size={28} className="text-white" />
                </div>

                {/* TITLE */}

                <h3
                  className="
                    relative

                    mt-7

                    text-xl
                    font-black
                    text-white

                    md:text-2xl
                  "
                >
                  {item.title}
                </h3>

                {/* VALUE */}

                <p
                  className="
                    relative

                    mt-3

                    break-words

                    text-sm
                    font-extrabold
                    text-yellow-300
                  "
                >
                  {item.value}
                </p>

                {/* DESCRIPTION */}

                <p
                  className="
                    relative

                    mt-4

                    text-sm
                    leading-7
                    text-slate-400
                  "
                >
                  {item.description}
                </p>

                {/* LINK INDICATOR */}

                {item.link && (
                  <div
                    className="
                      relative

                      mt-6

                      flex
                      items-center
                      gap-2

                      border-t
                      border-white/[0.07]

                      pt-5

                      text-xs
                      font-bold
                      text-blue-300
                    "
                  >
                    Contact Now
                    <ArrowUpRight
                      size={15}
                      className="
                        transition-transform

                        group-hover:-translate-y-0.5
                        group-hover:translate-x-0.5
                      "
                    />
                  </div>
                )}
              </>
            );

            if (item.link) {
              return (
                <a
                  key={index}
                  href={item.link}
                  className="
                    group

                    relative
                    overflow-hidden

                    rounded-[30px]

                    border
                    border-white/10

                    bg-[#0D192A]/85

                    p-7

                    shadow-[0_20px_60px_rgba(0,0,0,.30)]

                    backdrop-blur-xl

                    transition-all
                    duration-500

                    hover:-translate-y-2
                    hover:border-yellow-400/20
                  "
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <article
                key={index}
                className="
                  group

                  relative
                  overflow-hidden

                  rounded-[30px]

                  border
                  border-white/10

                  bg-[#0D192A]/85

                  p-7

                  shadow-[0_20px_60px_rgba(0,0,0,.30)]

                  backdrop-blur-xl

                  transition-all
                  duration-500

                  hover:-translate-y-2
                  hover:border-yellow-400/20
                "
              >
                {cardContent}
              </article>
            );
          })}
        </div>

        {/* ======================================
            SUPPORT INFORMATION PANEL
        ====================================== */}

        <div
          className="
            relative

            mt-14

            overflow-hidden

            rounded-[32px]

            border
            border-white/10

            bg-gradient-to-r
            from-blue-500/[0.06]
            via-white/[0.03]
            to-yellow-400/[0.06]

            p-6

            backdrop-blur-xl

            md:p-8
          "
        >
          {/* GLOW */}

          <div
            className="
              pointer-events-none

              absolute
              -right-20
              -top-20

              h-60
              w-60

              rounded-full

              bg-yellow-400/10

              blur-[100px]
            "
          />

          <div
            className="
              relative

              grid
              grid-cols-1
              gap-6

              lg:grid-cols-[1fr_auto]
              lg:items-center
            "
          >
            {/* LEFT */}

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

                  bg-blue-500/10

                  text-blue-300
                "
              >
                <ShieldCheck size={22} />
              </div>

              <div>
                <h3
                  className="
                    text-lg
                    font-black
                    text-white
                  "
                >
                  CampusNexus Project Support
                </h3>

                <p
                  className="
                    mt-2
                    max-w-2xl

                    text-sm
                    leading-6
                    text-slate-400
                  "
                >
                  Support is available for ERP access, module understanding,
                  workflow assistance and project related technical queries.
                </p>
              </div>
            </div>

            {/* RIGHT */}

            <div
              className="
                flex
                flex-wrap
                gap-3
              "
            >
              <SupportBadge
                icon={<MapPin size={15} />}
                text="Amity University Gwalior"
              />

              <SupportBadge
                icon={<Clock3 size={15} />}
                text="Project Support"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// SUPPORT BADGE
// ==========================================

const SupportBadge = ({ icon, text }) => {
  return (
    <div
      className="
        inline-flex
        items-center
        gap-2

        rounded-full

        border
        border-white/10

        bg-white/[0.04]

        px-4
        py-2.5

        text-xs
        font-bold
        text-slate-300
      "
    >
      <span className="text-yellow-300">{icon}</span>

      {text}
    </div>
  );
};
