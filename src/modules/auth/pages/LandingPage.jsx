import React, { useState, useEffect } from "react";

import {
  Building2,
  AudioLines,
  Info,
  Landmark,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import Header from "../components/Header";

import LandingHero from "../components/LandingHero";

import FeaturesSelector from "../components/FeaturesSelection";

import PortalDemo from "../components/PortalDemo";
import DevelopersSection from "../components/DevelopersSection";

export default function LandingPage() {
  const [accessibilityConfig, setAccessibilityConfig] = useState({
    highContrast: false,
    textSize: "normal",
    simpleAnimations: false,
    screenReaderDescriptions: false,
  });

  const [verbalNotification, setVerbalNotification] = useState("");

  const announceAction = (message) => {
    setVerbalNotification(message);

    if (
      accessibilityConfig.screenReaderDescriptions &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(message);

      utterance.rate = 1.0;

      utterance.pitch = 1.0;

      window.speechSynthesis.speak(utterance);
    }

    setTimeout(() => {
      setVerbalNotification("");
    }, 4000);
  };

  useEffect(() => {
    announceAction("CampusNexus ERP portal landing page loaded successfully.");
  }, []);

  return (
    <div
      className={`
        min-h-screen

        transition-all
        duration-300

        ${accessibilityConfig.textSize === "large" ? "text-lg" : "text-sm"}

        ${
          accessibilityConfig.highContrast
            ? "bg-black text-white"
            : "bg-[#071120] text-white"
        }
      `}
    >
      {/* SCREEN READER */}

      <div
        aria-live="assertive"
        className="
          sr-only
          fixed
          -top-40
          left-0
          w-1
          p-1
          overflow-hidden
        "
      >
        {verbalNotification}
      </div>

      {/* HEADER */}

      <Header
        config={accessibilityConfig}
        onConfigChange={setAccessibilityConfig}
        announceAction={announceAction}
      />

      {/* MAIN */}

      <main id="main-content">
        {/* ACCESSIBILITY */}

        {accessibilityConfig.screenReaderDescriptions && (
          <div
            className="
              bg-emerald-600

              text-white

              p-3

              sticky
              top-[72px]

              z-30

              text-center

              font-bold

              shadow-lg

              flex
              items-center
              justify-center
              gap-2
            "
          >
            <AudioLines className="w-5 h-5 animate-pulse" />

            <span>Voice Guide Narrator Enabled</span>
          </div>
        )}

        {/* HERO */}

        <LandingHero
          config={accessibilityConfig}
          announceAction={announceAction}
        />

        {/* FEATURES */}

        <FeaturesSelector config={accessibilityConfig} />

        {/* PORTAL */}

        <PortalDemo
          config={accessibilityConfig}
          announceAction={announceAction}
        />

        {/* PREMIUM INFO SECTION */}

        <section
          className="
            relative

            overflow-hidden

            py-32

            bg-gradient-to-b
            from-[#071120]
            via-[#0B1730]
            to-[#050B18]

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
                Future Ready Smart ERP
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
                Complete University
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
                  Digital Transformation
                </span>
              </h2>

              <p
                className="
                  max-w-4xl
                  mx-auto

                  mt-10

                  text-lg
                  md:text-xl

                  leading-10

                  text-slate-300
                "
              >
                CampusNexus ERP provides an advanced digital infrastructure for
                universities and educational institutions with AI powered
                automation, smart complaint routing, realtime monitoring, hostel
                workflows and intelligent analytics systems.
              </p>
            </div>

            {/* CARDS */}

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-3

                gap-8
              "
            >
              {/* CARD 1 */}

              <div
                className="
                  group

                  relative

                  overflow-hidden

                  rounded-[36px]

                  border
                  border-yellow-400/10

                  bg-[#0F172A]/80

                  backdrop-blur-2xl

                  p-10

                  shadow-[0_20px_60px_rgba(0,0,0,.35)]

                  hover:-translate-y-3

                  hover:border-yellow-400/30

                  hover:shadow-[0_20px_60px_rgba(244,196,48,.15)]

                  transition-all
                  duration-500
                "
              >
                <div
                  className="
                    absolute
                    -top-12
                    -right-12

                    h-48
                    w-48

                    rounded-full

                    bg-blue-500/20

                    blur-3xl
                  "
                />

                <div
                  className="
                    relative

                    h-24
                    w-24

                    rounded-[28px]

                    bg-gradient-to-br
                    from-[#2563EB]
                    to-[#60A5FA]

                    flex
                    items-center
                    justify-center

                    mb-10

                    shadow-[0_15px_45px_rgba(37,99,235,.35)]
                  "
                >
                  <Info size={38} className="text-white" />
                </div>

                <h3
                  className="
                    text-3xl

                    font-black

                    text-white

                    mb-6
                  "
                >
                  Intelligent Automation
                </h3>

                <p
                  className="
                    text-slate-300

                    leading-9

                    text-lg
                  "
                >
                  Automate complaint workflows, maintenance operations, room
                  allocation systems and campus services using intelligent
                  digital technologies.
                </p>
              </div>

              {/* CARD 2 */}

              <div
                className="
                  group

                  relative

                  overflow-hidden

                  rounded-[36px]

                  border
                  border-yellow-400/10

                  bg-[#0F172A]/80

                  backdrop-blur-2xl

                  p-10

                  shadow-[0_20px_60px_rgba(0,0,0,.35)]

                  hover:-translate-y-3

                  hover:border-yellow-400/30

                  hover:shadow-[0_20px_60px_rgba(244,196,48,.15)]

                  transition-all
                  duration-500
                "
              >
                <div
                  className="
                    absolute
                    -top-12
                    -right-12

                    h-48
                    w-48

                    rounded-full

                    bg-pink-500/20

                    blur-3xl
                  "
                />

                <div
                  className="
                    relative

                    h-24
                    w-24

                    rounded-[28px]

                    bg-gradient-to-br
                    from-pink-500
                    to-rose-400

                    flex
                    items-center
                    justify-center

                    mb-10

                    shadow-[0_15px_45px_rgba(236,72,153,.35)]
                  "
                >
                  <Building2 size={38} className="text-white" />
                </div>

                <h3
                  className="
                    text-3xl

                    font-black

                    text-white

                    mb-6
                  "
                >
                  Smart Campus Operations
                </h3>

                <p
                  className="
                    text-slate-300

                    leading-9

                    text-lg
                  "
                >
                  Manage hostels, departments, student services, maintenance
                  teams and realtime notifications from one centralized ERP
                  platform.
                </p>
              </div>

              {/* CARD 3 */}

              <div
                className="
                  group

                  relative

                  overflow-hidden

                  rounded-[36px]

                  border
                  border-yellow-400/10

                  bg-[#0F172A]/80

                  backdrop-blur-2xl

                  p-10

                  shadow-[0_20px_60px_rgba(0,0,0,.35)]

                  hover:-translate-y-3

                  hover:border-yellow-400/30

                  hover:shadow-[0_20px_60px_rgba(244,196,48,.15)]

                  transition-all
                  duration-500
                "
              >
                <div
                  className="
                    absolute
                    -top-12
                    -right-12

                    h-48
                    w-48

                    rounded-full

                    bg-emerald-500/20

                    blur-3xl
                  "
                />

                <div
                  className="
                    relative

                    h-24
                    w-24

                    rounded-[28px]

                    bg-gradient-to-br
                    from-emerald-500
                    to-green-400

                    flex
                    items-center
                    justify-center

                    mb-10

                    shadow-[0_15px_45px_rgba(16,185,129,.35)]
                  "
                >
                  <ShieldCheck size={38} className="text-white" />
                </div>

                <h3
                  className="
                    text-3xl

                    font-black

                    text-white

                    mb-6
                  "
                >
                  Secure Digital Infrastructure
                </h3>

                <p
                  className="
                    text-slate-300

                    leading-9

                    text-lg
                  "
                >
                  Enterprise grade security systems, realtime dashboards, secure
                  authentication and intelligent campus analytics
                  infrastructure.
                </p>
              </div>
            </div>
          </div>
        </section>

        <DevelopersSection />
      </main>

      {/* FOOTER */}

      {/* FOOTER */}

      <footer
        className="
    relative

    overflow-hidden

    bg-[#050B18]

    border-t
    border-white/10

    pt-24
    pb-12
  "
      >
        {/* GRID */}

        <div
          className="
      absolute
      inset-0

      opacity-[0.03]

      bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]

      bg-[size:70px_70px]
    "
        />

        {/* GLOW */}

        <div
          className="
      absolute
      top-0
      left-1/2
      -translate-x-1/2

      w-[900px]
      h-[300px]

      bg-yellow-400/10

      blur-[160px]
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

          mb-8
        "
            >
              <Sparkles size={16} />
              Premium Smart Campus ERP
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
              Future Of
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
                Campus Automation
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
              Intelligent ERP ecosystem designed for universities, hostels and
              smart educational infrastructures with realtime automation.
            </p>
          </div>

          {/* PREMIUM CARDS */}

          <div
            className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4

        gap-8

        mb-24
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
                value: "AI",
                label: "Powered Automation",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="
            relative

            overflow-hidden

            rounded-[34px]

            border
            border-yellow-400/10

            bg-[#0F172A]/80

            backdrop-blur-2xl

            p-10

            text-center

            shadow-[0_20px_60px_rgba(0,0,0,.35)]

            hover:-translate-y-3

            hover:border-yellow-400/30

            hover:shadow-[0_20px_60px_rgba(244,196,48,.15)]

            transition-all
            duration-500
          "
              >
                <div
                  className="
              absolute
              -top-10
              -right-10

              h-40
              w-40

              rounded-full

              bg-yellow-400/10

              blur-3xl
            "
                />

                <h3
                  className="
              text-6xl

              font-black

              text-yellow-300

              mb-5
            "
                >
                  {item.value}
                </h3>

                <p
                  className="
              text-slate-300

              text-lg
            "
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {/* BRAND */}

          <div
            className="
        flex
        flex-col

        items-center
        justify-center

        text-center
      "
          >
            <div
              className="
          h-24
          w-24

          rounded-[32px]

          bg-gradient-to-br
          from-[#2563EB]
          via-[#3B82F6]
          to-[#F4C430]

          flex
          items-center
          justify-center

          mb-8

          shadow-[0_20px_60px_rgba(59,130,246,.35)]
        "
            >
              <Landmark className="text-white" size={42} />
            </div>

            <h2
              className="
          text-5xl

          font-black

          text-white

          mb-4
        "
            >
              CampusNexus
            </h2>

            <p
              className="
          uppercase

          tracking-[8px]

          text-blue-200/60

          text-sm

          mb-8
        "
            >
              Smart Campus ERP
            </p>

            <p
              className="
          max-w-3xl

          text-slate-400

          leading-9

          text-lg
        "
            >
              AI powered smart campus ecosystem for universities and educational
              institutions with intelligent automation workflows, realtime
              monitoring and digital infrastructure.
            </p>
          </div>

          {/* BOTTOM */}

          <div
            className="
        mt-20
        pt-8

        border-t
        border-white/10

        flex
        flex-col
        md:flex-row

        items-center
        justify-between

        gap-4
      "
          >
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} CampusNexus ERP. All rights reserved.
            </p>

            <p className="text-slate-500 text-sm">
              Powered by React.js & Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
