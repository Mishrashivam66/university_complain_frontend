import React from "react";

import { Menu, X, ChevronRight, Sparkles, Sun, Moon } from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const [showAuthModal, setShowAuthModal] = React.useState(false);

  const [darkMode, setDarkMode] = React.useState(
    localStorage.getItem("theme") !== "light",
  );

  const navigate = useNavigate();

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");

      document.body.style.background = "#071120";

      document.body.style.color = "white";

      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");

      document.body.style.background = "#F7F9FC";

      document.body.style.color = "#071120";

      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);

    if (element) {
      const offset = 100;

      const bodyRect = document.body.getBoundingClientRect().top;

      const elementRect = element.getBoundingClientRect().top;

      const elementPosition = elementRect - bodyRect;

      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* HEADER */}

      <header
        className="
          fixed
          top-0
          left-0
          w-full
          z-50

          border-b
          border-[#F4C430]/10

          bg-[#06101F]/75
          dark:bg-[#06101F]/75

          backdrop-blur-2xl

          shadow-[0_10px_40px_rgba(0,0,0,.35)]
        "
      >
        {/* TOP GLOW */}

        <div
          className="
            absolute
            inset-0

            bg-gradient-to-r
            from-blue-500/5
            via-yellow-400/5
            to-blue-500/5

            blur-3xl
          "
        />

        <div
          className="
            relative

            max-w-7xl
            mx-auto

            px-6
            md:px-10

            h-[88px]

            flex
            items-center
            justify-between
          "
        >
          {/* LOGO */}

          <div
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="
              flex
              items-center
              gap-4

              cursor-pointer

              group
            "
          >
            {/* ICON */}

            <div
              className="
                relative

                h-14
                w-14

                rounded-2xl

                bg-gradient-to-br
                from-[#0F4C81]
                via-[#2563EB]
                to-[#F4C430]

                flex
                items-center
                justify-center

                shadow-[0_15px_45px_rgba(37,99,235,.45)]

                group-hover:scale-105

                transition-all
                duration-300
              "
            >
              <Sparkles size={24} className="text-white" />

              <div
                className="
                  absolute
                  inset-0

                  rounded-2xl

                  bg-[#F4C430]/30

                  blur-2xl

                  -z-10
                "
              />
            </div>

            {/* TEXT */}

            <div>
              <h1
                className="
                  text-[32px]

                  leading-none

                  font-black

                  tracking-tight

                  bg-gradient-to-r
                  from-white
                  via-[#F4F7FF]
                  to-[#F4C430]

                  bg-clip-text
                  text-transparent
                "
              >
                CAMPUSNEXUS
              </h1>

              <p
                className="
                  mt-1

                  text-[11px]

                  font-bold

                  uppercase

                  tracking-[4px]

                  text-[#9DBAF3]
                "
              >
                Smart Campus ERP
              </p>
            </div>
          </div>

          {/* DESKTOP NAV */}

          <nav
            className="
              hidden
              lg:flex

              items-center

              gap-10
            "
          >
            {[
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
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(item.id)}
                className="
                  relative

                  text-sm
                  font-semibold

                  text-slate-300

                  hover:text-[#F4C430]

                  after:absolute
                  after:left-0
                  after:-bottom-1

                  after:h-[2px]
                  after:w-0

                  after:bg-[#F4C430]

                  after:transition-all

                  hover:after:w-full

                  transition-all
                "
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* RIGHT */}

          <div
            className="
              flex
              items-center

              gap-4
            "
          >
            {/* THEME TOGGLE */}

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="
                hidden
                md:flex

                h-12
                w-12

                rounded-2xl

                border
                border-white/10

                bg-white/5

                text-white

                items-center
                justify-center

                hover:border-[#F4C430]/40
                hover:bg-white/10

                transition-all
              "
            >
              {darkMode ? (
                <Sun size={20} className="text-[#F4C430]" />
              ) : (
                <Moon size={20} className="text-[#2563EB]" />
              )}
            </button>

            {/* LAUNCH ERP */}

            <button
              onClick={() => setShowAuthModal(true)}
              className="
                relative

                hidden
                md:flex

                items-center
                gap-2

                overflow-hidden

                px-8
                py-3.5

                rounded-2xl

                bg-gradient-to-r
                from-[#F4C430]
                via-[#FFD95A]
                to-[#F7C600]

                text-[#071120]

                font-black

                shadow-[0_15px_45px_rgba(244,196,48,.40)]

                hover:scale-105
                hover:shadow-[0_20px_55px_rgba(244,196,48,.55)]

                transition-all
                duration-300
              "
            >
              {/* SHINE */}

              <div
                className="
                  absolute
                  top-0
                  left-[-120%]

                  h-full
                  w-[120px]

                  rotate-12

                  bg-white/40

                  blur-xl

                  transition-all
                  duration-700

                  group-hover:left-[120%]
                "
              />

              <span className="relative z-10">Launch ERP</span>

              <ChevronRight size={20} className="relative z-10" />
            </button>

            {/* MOBILE MENU */}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="
                lg:hidden

                h-12
                w-12

                rounded-2xl

                border
                border-white/10

                bg-white/5

                text-white

                flex
                items-center
                justify-center
              "
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}

        {mobileMenuOpen && (
          <div
            className="
              lg:hidden

              border-t
              border-white/10

              bg-[#071120]/95

              backdrop-blur-2xl

              px-6
              py-6

              animate-fadeIn
            "
          >
            <div className="flex flex-col gap-5">
              <button
                onClick={() => scrollToSection("solutions")}
                className="text-left text-white font-semibold"
              >
                Solutions
              </button>

              <button
                onClick={() => scrollToSection("portal-demo")}
                className="text-left text-white font-semibold"
              >
                ERP Demo
              </button>

              <button
                onClick={() => scrollToSection("features")}
                className="text-left text-white font-semibold"
              >
                Features
              </button>

              <button
                onClick={() => scrollToSection("contact")}
                className="text-left text-white font-semibold"
              >
                Contact
              </button>

              <button
                onClick={() => setShowAuthModal(true)}
                className="
                  mt-2

                  w-full

                  py-3

                  rounded-2xl

                  bg-gradient-to-r
                  from-[#F4C430]
                  to-[#FFD54F]

                  text-[#071120]

                  font-black
                "
              >
                Launch ERP
              </button>
            </div>
          </div>
        )}
      </header>

      {/* AUTH MODAL */}

      {showAuthModal && (
        <div
          className="
            fixed
            inset-0
            z-[999]

            flex
            items-center
            justify-center

            bg-black/75

            backdrop-blur-md

            px-5
          "
        >
          <div
            className="
              relative

              w-full
              max-w-2xl

              rounded-[36px]

              border
              border-white/10

              bg-[#071120]

              overflow-hidden

              shadow-[0_30px_80px_rgba(0,0,0,.65)]

              animate-fadeIn
            "
          >
            {/* TOP LINE */}

            <div
              className="
                absolute
                top-0
                left-0

                w-full
                h-1

                bg-gradient-to-r
                from-[#0F4C81]
                via-[#F4C430]
                to-[#2563EB]
              "
            />

            {/* CLOSE */}

            <button
              onClick={() => setShowAuthModal(false)}
              className="
                absolute
                top-5
                right-5

                h-10
                w-10

                rounded-full

                bg-white/5

                text-white

                flex
                items-center
                justify-center

                hover:bg-red-500/20

                transition-all
              "
            >
              <X size={20} />
            </button>

            {/* CONTENT */}

            <div className="p-12 text-center">
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
                Smart Campus ERP Access
              </div>

              <h2
                className="
                  text-5xl

                  font-black

                  text-white
                "
              >
                Welcome to
              </h2>

              <h1
                className="
                  mt-2

                  text-6xl

                  font-black

                  bg-gradient-to-r
                  from-[#F4C430]
                  via-white
                  to-[#2563EB]

                  bg-clip-text
                  text-transparent
                "
              >
                CAMPUSNEXUS
              </h1>

              <p
                className="
                  mt-5

                  text-slate-300

                  text-lg
                "
              >
                Access your Smart Campus ERP services
              </p>

              {/* BUTTONS */}

              <div
                className="
                  mt-12

                  grid
                  md:grid-cols-2

                  gap-6
                "
              >
                {/* LOGIN */}

                <button
                  onClick={() => navigate("/login")}
                  className="
                    group

                    relative

                    overflow-hidden

                    p-8

                    rounded-3xl

                    border
                    border-white/10

                    bg-white/5

                    hover:border-[#2563EB]

                    hover:-translate-y-2

                    transition-all
                    duration-300
                  "
                >
                  <div
                    className="
                      absolute
                      inset-0

                      bg-gradient-to-br
                      from-blue-500/10
                      to-transparent

                      opacity-0

                      group-hover:opacity-100

                      transition-all
                    "
                  />

                  <h3
                    className="
                      relative

                      text-3xl
                      font-black
                      text-white
                    "
                  >
                    Login
                  </h3>

                  <p
                    className="
                      relative

                      mt-3

                      text-slate-400
                    "
                  >
                    Continue to your ERP dashboard
                  </p>
                </button>

                {/* SIGNUP */}

                <button
                  onClick={() => navigate("/register")}
                  className="
                    group

                    relative

                    overflow-hidden

                    p-8

                    rounded-3xl

                    border
                    border-[#F4C430]/30

                    bg-[#F4C430]/10

                    hover:bg-[#F4C430]/20

                    hover:-translate-y-2

                    transition-all
                    duration-300
                  "
                >
                  <div
                    className="
                      absolute
                      inset-0

                      bg-gradient-to-br
                      from-yellow-400/20
                      to-transparent

                      opacity-0

                      group-hover:opacity-100

                      transition-all
                    "
                  />

                  <h3
                    className="
                      relative

                      text-3xl
                      font-black

                      text-[#F4C430]
                    "
                  >
                    Signup
                  </h3>

                  <p
                    className="
                      relative

                      mt-3

                      text-[#F4C430]/80
                    "
                  >
                    Create your Smart Campus account
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
