import React from "react";

import { Menu, X, ChevronRight, Sparkles, LogIn, UserPlus } from "lucide-react";

import { useNavigate } from "react-router-dom";

// ==========================================
// NAVIGATION ITEMS
// ==========================================

const navigationItems = [
  {
    label: "Solutions",
    id: "solutions",
  },

  {
    label: "ERP Demo",
    id: "portal-demo",
  },

  {
    label: "Features",
    id: "features",
  },

  {
    label: "Contact",
    id: "contact",
  },
];

// ==========================================
// HEADER
// ==========================================

export default function Header() {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const [showAuthModal, setShowAuthModal] = React.useState(false);

  // ==========================================
  // SCROLL TO SECTION
  // ==========================================

  const scrollToSection = (id) => {
    const element = document.getElementById(id);

    if (!element) {
      return;
    }

    const headerOffset = 95;

    const elementPosition =
      element.getBoundingClientRect().top + window.pageYOffset;

    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({
      top: offsetPosition,

      behavior: "smooth",
    });

    setMobileMenuOpen(false);
  };

  // ==========================================
  // SCROLL TO TOP
  // ==========================================

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,

      behavior: "smooth",
    });

    setMobileMenuOpen(false);
  };

  // ==========================================
  // OPEN ERP ACCESS
  // ==========================================

  const openERPAccess = () => {
    setMobileMenuOpen(false);

    setShowAuthModal(true);
  };

  return (
    <>
      {/* ======================================
          HEADER
      ====================================== */}

      <header
        className="
          fixed
          left-0
          top-0
          z-50

          w-full

          border-b
          border-white/10

          bg-[#06101F]/95

          shadow-[0_12px_45px_rgba(0,0,0,.30)]

          backdrop-blur-2xl
        "
      >
        {/* SUBTLE HEADER GLOW */}

        <div
          className="
            pointer-events-none

            absolute
            inset-0

            bg-gradient-to-r
            from-blue-500/[0.04]
            via-yellow-400/[0.04]
            to-blue-500/[0.04]
          "
        />

        <div
          className="
            relative

            mx-auto

            flex
            h-[88px]
            max-w-7xl
            items-center
            justify-between

            px-5
            sm:px-6
            md:px-10
          "
        >
          {/* ==================================
              BRAND
          ================================== */}

          <button
            type="button"
            onClick={scrollToTop}
            className="
              group

              flex
              items-center
              gap-3

              text-left

              sm:gap-4
            "
          >
            {/* LOGO */}

            <div
              className="
                relative

                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center

                rounded-2xl

                bg-gradient-to-br
                from-[#0F4C81]
                via-[#2563EB]
                to-[#F4C430]

                shadow-[0_12px_35px_rgba(37,99,235,.35)]

                transition-all
                duration-300

                group-hover:-translate-y-0.5
                group-hover:scale-105

                sm:h-14
                sm:w-14
              "
            >
              <Sparkles size={24} className="text-white" />

              <div
                className="
                  absolute
                  inset-0
                  -z-10

                  rounded-2xl

                  bg-[#F4C430]/20

                  blur-2xl
                "
              />
            </div>

            {/* TEXT */}

            <div>
              <h1
                className="
                  bg-gradient-to-r
                  from-white
                  via-[#F8FAFF]
                  to-[#F4C430]

                  bg-clip-text

                  text-[22px]
                  font-black
                  leading-none
                  tracking-tight
                  text-transparent

                  sm:text-[27px]
                  lg:text-[30px]
                "
              >
                CAMPUSNEXUS
              </h1>

              <p
                className="
                  mt-1

                  hidden

                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[3.5px]
                  text-[#9DBAF3]

                  sm:block
                "
              >
                Smart Campus ERP
              </p>
            </div>
          </button>

          {/* ==================================
              DESKTOP NAVIGATION
          ================================== */}

          <nav
            className="
              hidden
              items-center
              gap-8

              lg:flex
              xl:gap-10
            "
          >
            {navigationItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="
                    relative

                    py-2

                    text-sm
                    font-bold
                    text-slate-300

                    transition-all
                    duration-300

                    after:absolute
                    after:-bottom-1
                    after:left-0

                    after:h-[2px]
                    after:w-0

                    after:rounded-full

                    after:bg-[#F4C430]

                    after:transition-all
                    after:duration-300

                    hover:text-[#F4C430]
                    hover:after:w-full
                  "
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* ==================================
              RIGHT SIDE
          ================================== */}

          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            {/* LAUNCH ERP */}

            <button
              type="button"
              onClick={openERPAccess}
              className="
                group

                relative

                hidden
                items-center
                gap-2

                overflow-hidden

                rounded-2xl

                bg-gradient-to-r
                from-[#F4C430]
                via-[#FFD95A]
                to-[#F7C600]

                px-7
                py-3.5

                font-black
                text-[#071120]

                shadow-[0_14px_40px_rgba(244,196,48,.30)]

                transition-all
                duration-300

                hover:-translate-y-0.5
                hover:shadow-[0_18px_50px_rgba(244,196,48,.42)]

                md:flex
              "
            >
              {/* SHINE */}

              <span
                className="
                  absolute
                  -left-[120%]
                  top-0

                  h-full
                  w-[100px]

                  rotate-12

                  bg-white/35

                  blur-xl

                  transition-all
                  duration-700

                  group-hover:left-[120%]
                "
              />

              <span className="relative z-10">Launch ERP</span>

              <ChevronRight
                size={19}
                className="
                  relative
                  z-10

                  transition-transform
                  duration-300

                  group-hover:translate-x-1
                "
              />
            </button>

            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open navigation menu"
              className="
                flex
                h-11
                w-11
                items-center
                justify-center

                rounded-xl

                border
                border-white/10

                bg-white/[0.05]

                text-white

                transition-all

                hover:bg-white/[0.10]

                lg:hidden
              "
            >
              {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>

        {/* ==================================
            MOBILE MENU
        ================================== */}

        {mobileMenuOpen && (
          <div
            className="
              border-t
              border-white/10

              bg-[#071120]/98

              px-5
              py-5

              shadow-2xl

              backdrop-blur-2xl

              lg:hidden
            "
          >
            <div
              className="
                mx-auto
                flex
                max-w-7xl
                flex-col
                gap-2
              "
            >
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="
                      rounded-xl

                      px-4
                      py-3

                      text-left
                      font-bold
                      text-slate-200

                      transition-all

                      hover:bg-white/[0.06]
                      hover:text-yellow-300
                    "
                >
                  {item.label}
                </button>
              ))}

              <button
                type="button"
                onClick={openERPAccess}
                className="
                  mt-3

                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2

                  rounded-2xl

                  bg-gradient-to-r
                  from-[#F4C430]
                  to-[#FFD54F]

                  py-3.5

                  font-black
                  text-[#071120]
                "
              >
                Launch ERP
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ======================================
          AUTH MODAL
      ====================================== */}

      {showAuthModal && (
        <div
          className="
            fixed
            inset-0
            z-[999]

            flex
            items-center
            justify-center

            bg-black/80

            px-4

            backdrop-blur-md
          "
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="
              relative

              w-full
              max-w-2xl

              overflow-hidden

              rounded-[34px]

              border
              border-white/10

              bg-[#071120]

              shadow-[0_35px_100px_rgba(0,0,0,.70)]
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* TOP COLOR LINE */}

            <div
              className="
                absolute
                left-0
                top-0

                h-1
                w-full

                bg-gradient-to-r
                from-[#2563EB]
                via-[#F4C430]
                to-[#7A0019]
              "
            />

            {/* GLOW */}

            <div
              className="
                pointer-events-none

                absolute
                left-1/2
                top-0

                h-44
                w-[500px]

                -translate-x-1/2

                bg-blue-500/10

                blur-[100px]
              "
            />

            {/* CLOSE */}

            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              aria-label="Close ERP access window"
              className="
                absolute
                right-5
                top-5
                z-10

                flex
                h-10
                w-10
                items-center
                justify-center

                rounded-full

                border
                border-white/10

                bg-white/[0.05]

                text-white

                transition-all

                hover:border-red-400/30
                hover:bg-red-500/10
                hover:text-red-300
              "
            >
              <X size={20} />
            </button>

            {/* CONTENT */}

            <div
              className="
                relative

                p-7
                text-center

                sm:p-10
                md:p-12
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

                  bg-yellow-400/10

                  px-5
                  py-2.5

                  text-sm
                  font-bold
                  text-yellow-300
                "
              >
                <Sparkles size={16} />
                Campus ERP Access
              </div>

              {/* TITLE */}

              <h2
                className="
                  mt-7

                  text-3xl
                  font-black
                  text-white

                  sm:text-4xl
                "
              >
                Welcome to CampusNexus
              </h2>

              <p
                className="
                  mx-auto
                  mt-4
                  max-w-md

                  text-sm
                  leading-6
                  text-slate-400

                  sm:text-base
                "
              >
                Login to access your role-based ERP dashboard or create a
                student account.
              </p>

              {/* ACCESS CARDS */}

              <div
                className="
                  mt-9

                  grid
                  grid-cols-1
                  gap-5

                  md:grid-cols-2
                "
              >
                {/* LOGIN */}

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="
                    group

                    rounded-3xl

                    border
                    border-blue-400/15

                    bg-blue-500/[0.07]

                    p-7

                    text-left

                    transition-all
                    duration-300

                    hover:-translate-y-1
                    hover:border-blue-400/35
                    hover:bg-blue-500/[0.10]
                  "
                >
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center

                      rounded-xl

                      bg-blue-500/15

                      text-blue-300
                    "
                  >
                    <LogIn size={23} />
                  </div>

                  <h3
                    className="
                      mt-5

                      text-2xl
                      font-black
                      text-white
                    "
                  >
                    Login
                  </h3>

                  <p
                    className="
                      mt-2

                      text-sm
                      leading-6
                      text-slate-400
                    "
                  >
                    Continue to your assigned CampusNexus dashboard.
                  </p>

                  <div
                    className="
                      mt-5

                      flex
                      items-center
                      gap-2

                      text-sm
                      font-bold
                      text-blue-300
                    "
                  >
                    Continue
                    <ArrowIcon />
                  </div>
                </button>

                {/* REGISTER */}

                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="
                    group

                    rounded-3xl

                    border
                    border-yellow-400/20

                    bg-yellow-400/[0.07]

                    p-7

                    text-left

                    transition-all
                    duration-300

                    hover:-translate-y-1
                    hover:border-yellow-400/35
                    hover:bg-yellow-400/[0.10]
                  "
                >
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center

                      rounded-xl

                      bg-yellow-400/15

                      text-yellow-300
                    "
                  >
                    <UserPlus size={23} />
                  </div>

                  <h3
                    className="
                      mt-5

                      text-2xl
                      font-black
                      text-yellow-300
                    "
                  >
                    Student Signup
                  </h3>

                  <p
                    className="
                      mt-2

                      text-sm
                      leading-6
                      text-slate-400
                    "
                  >
                    Register a new student account using your university email.
                  </p>

                  <div
                    className="
                      mt-5

                      flex
                      items-center
                      gap-2

                      text-sm
                      font-bold
                      text-yellow-300
                    "
                  >
                    Create Account
                    <ArrowIcon />
                  </div>
                </button>
              </div>

              {/* NOTE */}

              <p
                className="
                  mt-7

                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                Staff and management accounts are provided according to
                authorized campus roles.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ==========================================
// SMALL ARROW
// ==========================================

const ArrowIcon = () => {
  return (
    <ChevronRight
      size={17}
      className="
        transition-transform
        duration-300

        group-hover:translate-x-1
      "
    />
  );
};
