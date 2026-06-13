/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

import {
  Accessibility,
  Eye,
  Type,
  Sparkles,
  Volume2,
  ShieldCheck,
  Zap,
} from "lucide-react";

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
  // ANIMATIONS
  // ==========================================

  const toggleAnimations = () => {
    const updated = {
      ...config,
      simpleAnimations: !config.simpleAnimations,
    };

    onChange(updated);

    announceAction(
      `Motion and transition effects ${
        updated.simpleAnimations ? "reduced" : "fully enabled"
      }.`,
    );
  };

  // ==========================================
  // SCREEN READER
  // ==========================================

  const toggleScreenReader = () => {
    const updated = {
      ...config,
      screenReaderDescriptions: !config.screenReaderDescriptions,
    };

    onChange(updated);

    announceAction(
      `Acoustic page descriptions turned ${
        updated.screenReaderDescriptions ? "ON" : "OFF"
      }.`,
    );
  };

  return (
    <div className="relative inline-block" id="accessibility-menu">
      {/* ========================================== */}
      {/* BUTTON */}
      {/* ========================================== */}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          group

          flex
          items-center

          gap-3

          px-5
          py-3

          rounded-2xl

          border
          border-white/10

          bg-white/5

          backdrop-blur-xl

          text-white

          font-semibold

          hover:bg-white/10

          hover:scale-105

          transition-all
          duration-300

          shadow-[0_10px_35px_rgba(0,0,0,.25)]
        "
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Campus Accessibility Control Panel"
      >
        <div
          className="
            h-9
            w-9

            rounded-xl

            bg-gradient-to-br
            from-[#F4C430]
            to-[#FFD54F]

            flex
            items-center
            justify-center

            shadow-[0_8px_25px_rgba(244,196,48,.35)]
          "
        >
          <Accessibility
            className="
              w-5
              h-5

              text-[#071120]
            "
          />
        </div>

        <span className={config.textSize === "large" ? "text-base" : "text-sm"}>
          Accessibility
        </span>
      </button>

      {/* ========================================== */}
      {/* PANEL */}
      {/* ========================================== */}

      {isOpen && (
        <>
          {/* OVERLAY */}

          <div
            className="
              fixed
              inset-0
              z-40
            "
            onClick={() => setIsOpen(false)}
          />

          {/* MAIN BOX */}

          <div
            className="
              absolute
              right-0
              mt-4

              w-[360px]

              overflow-hidden

              rounded-[32px]

              border
              border-white/10

              bg-[#071120]/95

              backdrop-blur-2xl

              shadow-[0_25px_80px_rgba(0,0,0,.45)]

              z-50
            "
            role="dialog"
            aria-label="Universal Accessibility Panel"
          >
            {/* ========================================== */}
            {/* HEADER */}
            {/* ========================================== */}

            <div
              className="
                relative

                p-6

                border-b
                border-white/10
              "
            >
              {/* GLOW */}

              <div
                className="
                  absolute
                  top-[-40px]
                  right-[-30px]

                  w-32
                  h-32

                  rounded-full

                  bg-[#F4C430]/20

                  blur-3xl
                "
              />

              <div
                className="
                  relative

                  flex
                  items-center

                  gap-4
                "
              >
                <div
                  className="
                    h-14
                    w-14

                    rounded-2xl

                    bg-gradient-to-br
                    from-[#F4C430]
                    to-[#FFD54F]

                    flex
                    items-center
                    justify-center
                  "
                >
                  <Sparkles
                    className="
                      text-[#071120]
                    "
                    size={26}
                  />
                </div>

                <div>
                  <h3
                    className="
                      text-xl

                      font-black

                      text-white
                    "
                  >
                    Accessibility
                  </h3>

                  <p
                    className="
                      text-sm

                      text-slate-400

                      mt-1
                    "
                  >
                    Smart UI Controls
                  </p>
                </div>
              </div>
            </div>

            {/* ========================================== */}
            {/* CONTROLS */}
            {/* ========================================== */}

            <div className="p-6 space-y-5">
              {/* CONTROL ITEM */}

              <ControlItem
                title="High Contrast"
                desc="Improve readability and visual clarity"
                active={config.highContrast}
                onClick={toggleHighContrast}
                icon={Eye}
              />

              <ControlItem
                title="Large Text"
                desc="Increase overall font sizes"
                active={config.textSize === "large"}
                onClick={toggleTextSize}
                icon={Type}
              />

              <ControlItem
                title="Reduce Motion"
                desc="Disable heavy transitions and effects"
                active={config.simpleAnimations}
                onClick={toggleAnimations}
                icon={Zap}
              />

              <ControlItem
                title="Sound Feedback"
                desc="Enable voice guidance and actions"
                active={config.screenReaderDescriptions}
                onClick={toggleScreenReader}
                icon={Volume2}
              />
            </div>

            {/* ========================================== */}
            {/* FOOTER */}
            {/* ========================================== */}

            <div
              className="
                border-t
                border-white/10

                px-6
                py-4

                flex
                items-center
                justify-center

                gap-2

                text-xs

                text-slate-400
              "
            >
              <ShieldCheck
                className="
                  text-emerald-400
                "
                size={14}
              />
              WCAG 2.1 AA Compliant
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

function ControlItem({ title, desc, active, onClick, icon: Icon }) {
  return (
    <div
      className="
        flex
        items-center
        justify-between

        gap-4

        p-4

        rounded-2xl

        border
        border-white/5

        bg-white/[0.04]

        hover:bg-white/[0.07]

        transition-all
      "
    >
      {/* LEFT */}

      <div
        className="
          flex
          items-center

          gap-4
        "
      >
        <div
          className={`
            h-12
            w-12

            rounded-2xl

            flex
            items-center
            justify-center

            ${
              active
                ? `
                  bg-gradient-to-br
                  from-[#F4C430]
                  to-[#FFD54F]

                  text-[#071120]
                `
                : `
                  bg-white/10

                  text-white
                `
            }
          `}
        >
          <Icon size={22} />
        </div>

        <div>
          <h4
            className="
              text-white

              font-bold
            "
          >
            {title}
          </h4>

          <p
            className="
              text-xs

              text-slate-400

              mt-1
            "
          >
            {desc}
          </p>
        </div>
      </div>

      {/* SWITCH */}

      <button
        onClick={onClick}
        className={`
          relative

          w-14
          h-7

          rounded-full

          transition-all

          ${
            active
              ? `
                bg-gradient-to-r
                from-[#F4C430]
                to-[#FFD54F]
              `
              : `
                bg-white/10
              `
          }
        `}
      >
        <span
          className={`
            absolute
            top-1

            w-5
            h-5

            rounded-full

            bg-white

            transition-all

            ${active ? "left-8" : "left-1"}
          `}
        />
      </button>
    </div>
  );
}
