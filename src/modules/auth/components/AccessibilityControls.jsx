import React from "react";

import {
  Accessibility,
  Eye,
  Type,
  Volume2,
  ShieldCheck,
  Zap,
  Check,
  X,
} from "lucide-react";

// ==========================================
// ACCESSIBILITY CONTROLS
// ==========================================

export default function AccessibilityControls({
  config,
  onChange,
  announceAction,
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  // ==========================================
  // HIGH CONTRAST
  // ==========================================

  const toggleHighContrast = () => {
    const updated = {
      ...config,

      highContrast: !config.highContrast,
    };

    onChange(updated);

    announceAction(
      `High Contrast Mode turned ${updated.highContrast ? "ON" : "OFF"}.`,
    );
  };

  // ==========================================
  // TEXT SIZE
  // ==========================================

  const toggleTextSize = () => {
    const updated = {
      ...config,

      textSize: config.textSize === "normal" ? "large" : "normal",
    };

    onChange(updated);

    announceAction(
      `Text size set to ${
        updated.textSize === "large" ? "Large" : "Standard"
      }.`,
    );
  };

  // ==========================================
  // REDUCE MOTION
  // ==========================================

  const toggleAnimations = () => {
    const updated = {
      ...config,

      simpleAnimations: !config.simpleAnimations,
    };

    onChange(updated);

    announceAction(
      `Motion effects ${updated.simpleAnimations ? "reduced" : "enabled"}.`,
    );
  };

  // ==========================================
  // VOICE GUIDE
  // ==========================================

  const toggleScreenReader = () => {
    const updated = {
      ...config,

      screenReaderDescriptions: !config.screenReaderDescriptions,
    };

    onChange(updated);

    announceAction(
      `Voice guidance turned ${
        updated.screenReaderDescriptions ? "ON" : "OFF"
      }.`,
    );
  };

  return (
    <div
      className="
        relative
        inline-block
      "
      id="accessibility-menu"
    >
      {/* ======================================
          MAIN BUTTON
      ====================================== */}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Open accessibility controls"
        className="
          group

          flex
          items-center
          gap-3

          rounded-2xl

          border
          border-white/10

          bg-white/[0.05]

          px-4
          py-2.5

          font-bold
          text-white

          shadow-[0_10px_30px_rgba(0,0,0,.20)]

          backdrop-blur-xl

          transition-all
          duration-300

          hover:border-yellow-400/25
          hover:bg-white/[0.08]
        "
      >
        {/* ICON */}

        <div
          className="
            flex
            h-9
            w-9
            items-center
            justify-center

            rounded-xl

            bg-gradient-to-br
            from-[#F4C430]
            to-[#FFD54F]

            text-[#071120]

            shadow-[0_8px_22px_rgba(244,196,48,.25)]
          "
        >
          <Accessibility size={19} />
        </div>

        <span
          className={`
            hidden
            sm:block

            ${config.textSize === "large" ? "text-base" : "text-sm"}
          `}
        >
          Accessibility
        </span>
      </button>

      {/* ======================================
          PANEL
      ====================================== */}

      {isOpen && (
        <>
          {/* OUTSIDE OVERLAY */}

          <div
            className="
              fixed
              inset-0
              z-40
            "
            onClick={() => setIsOpen(false)}
          />

          {/* PANEL */}

          <div
            role="dialog"
            aria-label="Accessibility controls"
            className="
              absolute
              right-0
              z-50

              mt-4

              w-[330px]
              max-w-[calc(100vw-24px)]

              overflow-hidden

              rounded-[28px]

              border
              border-white/10

              bg-[#081321]/98

              shadow-[0_30px_90px_rgba(0,0,0,.55)]

              backdrop-blur-2xl

              sm:w-[370px]
            "
          >
            {/* ==================================
                TOP COLOR LINE
            ================================== */}

            <div
              className="
                h-[3px]
                w-full

                bg-gradient-to-r
                from-[#2563EB]
                via-[#F4C430]
                to-[#7A0019]
              "
            />

            {/* ==================================
                HEADER
            ================================== */}

            <div
              className="
                relative

                border-b
                border-white/10

                p-5
                sm:p-6
              "
            >
              {/* GLOW */}

              <div
                className="
                  pointer-events-none

                  absolute
                  -right-10
                  -top-10

                  h-36
                  w-36

                  rounded-full

                  bg-yellow-400/10

                  blur-3xl
                "
              />

              <div
                className="
                  relative

                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                <div
                  className="
                    flex
                    items-center
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

                      rounded-2xl

                      bg-gradient-to-br
                      from-[#2563EB]
                      via-[#3B82F6]
                      to-[#F4C430]

                      text-white

                      shadow-lg
                    "
                  >
                    <Accessibility size={23} />
                  </div>

                  <div>
                    <h3
                      className="
                        text-lg
                        font-black
                        text-white
                      "
                    >
                      Accessibility
                    </h3>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-400
                      "
                    >
                      Personalize your CampusNexus experience
                    </p>
                  </div>
                </div>

                {/* CLOSE */}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close accessibility controls"
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center

                    rounded-xl

                    border
                    border-white/[0.07]

                    bg-white/[0.04]

                    text-slate-400

                    transition-all

                    hover:bg-red-500/10
                    hover:text-red-300
                  "
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ==================================
                CONTROLS
            ================================== */}

            <div
              className="
                space-y-3

                p-4
                sm:p-5
              "
            >
              <ControlItem
                title="High Contrast"
                desc="Improve visual contrast and readability"
                active={config.highContrast}
                onClick={toggleHighContrast}
                icon={Eye}
                accent="blue"
              />

              <ControlItem
                title="Large Text"
                desc="Increase overall text size"
                active={config.textSize === "large"}
                onClick={toggleTextSize}
                icon={Type}
                accent="gold"
              />

              <ControlItem
                title="Reduce Motion"
                desc="Reduce animations and transition effects"
                active={config.simpleAnimations}
                onClick={toggleAnimations}
                icon={Zap}
                accent="maroon"
              />

              <ControlItem
                title="Voice Guide"
                desc="Enable spoken page feedback"
                active={config.screenReaderDescriptions}
                onClick={toggleScreenReader}
                icon={Volume2}
                accent="emerald"
              />
            </div>

            {/* ==================================
                FOOTER
            ================================== */}

            <div
              className="
                flex
                items-center
                justify-center
                gap-2

                border-t
                border-white/10

                bg-white/[0.02]

                px-5
                py-4

                text-xs
                font-semibold
                text-slate-400
              "
            >
              <ShieldCheck size={14} className="text-emerald-400" />
              Accessibility Support Enabled
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ==========================================
// CONTROL ITEM
// ==========================================

function ControlItem({ title, desc, active, onClick, icon: Icon, accent }) {
  // ==========================================
  // ACCENT COLORS
  // ==========================================

  const accentClasses = {
    blue: {
      active: "from-[#1D4ED8] to-[#60A5FA]",

      inactive: "bg-blue-500/10 text-blue-300",
    },

    gold: {
      active: "from-[#B7791F] to-[#F4C430]",

      inactive: "bg-yellow-400/10 text-yellow-300",
    },

    maroon: {
      active: "from-[#7A0019] to-[#A61B3C]",

      inactive: "bg-red-500/10 text-red-300",
    },

    emerald: {
      active: "from-[#047857] to-[#34D399]",

      inactive: "bg-emerald-500/10 text-emerald-300",
    },
  };

  const colors = accentClasses[accent] || accentClasses.blue;

  return (
    <div
      className={`
        flex
        items-center
        justify-between
        gap-3

        rounded-2xl

        border

        p-3.5

        transition-all
        duration-300

        ${
          active
            ? `
              border-yellow-400/15
              bg-white/[0.055]
            `
            : `
              border-white/[0.06]
              bg-white/[0.025]
            `
        }

        hover:bg-white/[0.055]
      `}
    >
      {/* ======================================
          LEFT
      ====================================== */}

      <div
        className="
          flex
          min-w-0
          items-center
          gap-3
        "
      >
        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center

            rounded-xl

            transition-all
            duration-300

            ${
              active
                ? `
                  bg-gradient-to-br
                  ${colors.active}
                  text-white
                  shadow-lg
                `
                : colors.inactive
            }
          `}
        >
          <Icon size={19} />
        </div>

        <div className="min-w-0">
          <h4
            className="
              text-sm
              font-extrabold
              text-white
            "
          >
            {title}
          </h4>

          <p
            className="
              mt-1

              text-[11px]
              leading-4
              text-slate-500
            "
          >
            {desc}
          </p>
        </div>
      </div>

      {/* ======================================
          SWITCH
      ====================================== */}

      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        aria-label={`${title} ${active ? "enabled" : "disabled"}`}
        className={`
          relative

          h-7
          w-13
          shrink-0

          rounded-full

          border

          transition-all
          duration-300

          ${
            active
              ? `
                border-yellow-400/20
                bg-gradient-to-r
                ${colors.active}
              `
              : `
                border-white/10
                bg-white/10
              `
          }
        `}
        style={{
          width: "52px",
        }}
      >
        <span
          className={`
            absolute
            top-[3px]

            flex
            h-5
            w-5
            items-center
            justify-center

            rounded-full

            bg-white

            shadow-md

            transition-all
            duration-300

            ${active ? "left-[27px]" : "left-[3px]"}
          `}
        >
          {active && <Check size={11} className="text-[#071120]" />}
        </span>
      </button>
    </div>
  );
}
