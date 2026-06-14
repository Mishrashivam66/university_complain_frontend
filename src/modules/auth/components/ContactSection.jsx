import React from "react";

import {
  Sparkles,
  Info,
  AudioLines,
  Building2,
  ShieldCheck,
} from "lucide-react";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="
        relative

        overflow-hidden

        py-32

        bg-gradient-to-b
        from-[#050B18]
        via-[#071120]
        to-black

        border-t
        border-white/10
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

          h-[450px]
          w-[450px]

          bg-blue-500/20

          blur-[160px]
        "
      />

      <div
        className="
          absolute
          bottom-0
          right-0

          h-[450px]
          w-[450px]

          bg-yellow-400/10

          blur-[160px]
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
            Contact & Support
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
            Need Help With
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
              CampusNexus ERP?
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
            Facing technical issues, maintenance problems or need ERP
            assistance? Our support team is ready to help you anytime.
          </p>
        </div>

        {/* CONTACT CARDS */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-4

            gap-8
          "
        >
          {/* EMAIL */}

          <div
            className="
              group

              relative

              overflow-hidden

              rounded-[36px]

              border
              border-white/10

              bg-white/[0.04]

              backdrop-blur-2xl

              p-10

              hover:-translate-y-3

              hover:border-yellow-400/30

              transition-all
              duration-500
            "
          >
            <div
              className="
                h-20
                w-20

                rounded-3xl

                bg-gradient-to-br
                from-[#2563EB]
                to-[#60A5FA]

                flex
                items-center
                justify-center

                mb-8
              "
            >
              <Info size={34} className="text-white" />
            </div>

            <h3 className="text-3xl font-black text-white mb-5">
              Email Support
            </h3>

            <p className="text-slate-300 leading-8">
              Shivammgrmishra@gmail.com
            </p>
          </div>

          {/* PHONE */}

          <div
            className="
              group

              relative

              overflow-hidden

              rounded-[36px]

              border
              border-white/10

              bg-white/[0.04]

              backdrop-blur-2xl

              p-10

              hover:-translate-y-3

              hover:border-yellow-400/30

              transition-all
              duration-500
            "
          >
            <div
              className="
                h-20
                w-20

                rounded-3xl

                bg-gradient-to-br
                from-emerald-500
                to-green-400

                flex
                items-center
                justify-center

                mb-8
              "
            >
              <AudioLines size={34} className="text-white" />
            </div>

            <h3 className="text-3xl font-black text-white mb-5">
              Call Support
            </h3>

            <p className="text-slate-300 leading-8">+91 9341308920</p>
          </div>

          {/* OFFICE */}

          <div
            className="
              group

              relative

              overflow-hidden

              rounded-[36px]

              border
              border-white/10

              bg-white/[0.04]

              backdrop-blur-2xl

              p-10

              hover:-translate-y-3

              hover:border-yellow-400/30

              transition-all
              duration-500
            "
          >
            <div
              className="
                h-20
                w-20

                rounded-3xl

                bg-gradient-to-br
                from-yellow-500
                to-orange-400

                flex
                items-center
                justify-center

                mb-8
              "
            >
              <Building2 size={34} className="text-white" />
            </div>

            <h3 className="text-3xl font-black text-white mb-5">
              Campus Office
            </h3>

            <p className="text-slate-300 leading-8">Amity University Gwalior</p>
          </div>

          {/* SUPPORT */}

          <div
            className="
              group

              relative

              overflow-hidden

              rounded-[36px]

              border
              border-white/10

              bg-white/[0.04]

              backdrop-blur-2xl

              p-10

              hover:-translate-y-3

              hover:border-yellow-400/30

              transition-all
              duration-500
            "
          >
            <div
              className="
                h-20
                w-20

                rounded-3xl

                bg-gradient-to-br
                from-pink-500
                to-rose-400

                flex
                items-center
                justify-center

                mb-8
              "
            >
              <ShieldCheck size={34} className="text-white" />
            </div>

            <h3 className="text-3xl font-black text-white mb-5">
              24/7 Support
            </h3>

            <p className="text-slate-300 leading-8">
              Smart ERP technical assistance available anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
