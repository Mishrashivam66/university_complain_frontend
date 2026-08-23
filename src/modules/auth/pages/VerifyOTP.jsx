import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import {
  MailCheck,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  // ==========================================
  // STATES
  // ==========================================

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const [resending, setResending] = useState(false);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // ==========================================
  // CHECK EMAIL
  // ==========================================

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-email-otp`,
        {
          email,
          otp,
        },
      );

      setSuccess(true);

      setMessage(res?.data?.message || "Email verified successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setSuccess(false);

      setMessage(error?.response?.data?.message || "OTP Verification Failed");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESEND OTP
  // ==========================================

  const handleResendOTP = async () => {
    try {
      setResending(true);
      setMessage("");

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/resend-otp`,
        {
          email,
        },
      );

      setSuccess(true);
      setOtp("");

      setMessage("A new OTP has been sent to your email.");
    } catch (error) {
      setSuccess(false);

      setMessage(error?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#F4F7FC]
      "
    >
      {/* ======================================
          BACKGROUND DECORATION
      ====================================== */}

      <div
        className="
          absolute
          -left-32
          -top-32
          h-[420px]
          w-[420px]
          rounded-full
          bg-[#001B54]/10
          blur-3xl
        "
      />

      <div
        className="
          absolute
          -bottom-32
          -right-32
          h-[420px]
          w-[420px]
          rounded-full
          bg-[#7A0019]/10
          blur-3xl
        "
      />

      <div
        className="
          relative
          z-10
          flex
          min-h-screen
          items-center
          justify-center
          px-4
          py-10
        "
      >
        <div
          className="
            grid
            w-full
            max-w-5xl
            overflow-hidden
            rounded-[32px]
            bg-white
            shadow-[0_30px_80px_rgba(15,23,42,0.16)]
            lg:grid-cols-[0.9fr_1.1fr]
          "
        >
          {/* ======================================
              LEFT BRAND PANEL
          ====================================== */}

          <div
            className="
              relative
              hidden
              overflow-hidden
              bg-gradient-to-br
              from-[#001B54]
              via-[#003181]
              to-[#7A0019]
              p-10
              text-white
              lg:flex
              lg:flex-col
              lg:justify-between
            "
          >
            {/* Decorative circles */}

            <div
              className="
                absolute
                -right-24
                -top-24
                h-64
                w-64
                rounded-full
                border
                border-white/10
                bg-white/5
              "
            />

            <div
              className="
                absolute
                -bottom-20
                -left-20
                h-56
                w-56
                rounded-full
                border
                border-white/10
                bg-white/5
              "
            />

            {/* BRAND */}

            <div className="relative z-10">
              <div
                className="
                  inline-flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-white/15
                  bg-white/10
                  px-4
                  py-3
                  backdrop-blur
                "
              >
                <ShieldCheck size={24} />

                <div>
                  <p
                    className="
                      text-lg
                      font-black
                      tracking-wide
                    "
                  >
                    CAMPUSPULSE
                  </p>

                  <p
                    className="
                      text-[10px]
                      font-semibold
                      tracking-[0.18em]
                      text-blue-100
                    "
                  >
                    SMART CAMPUS ERP
                  </p>
                </div>
              </div>

              <div className="mt-14">
                <p
                  className="
                    text-sm
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-yellow-300
                  "
                >
                  Secure Verification
                </p>

                <h1
                  className="
                    mt-4
                    text-4xl
                    font-black
                    leading-tight
                  "
                >
                  One final step to secure your account.
                </h1>

                <p
                  className="
                    mt-5
                    max-w-sm
                    text-sm
                    leading-7
                    text-blue-100
                  "
                >
                  Verify your Amity email using the six-digit OTP sent to your
                  registered email address.
                </p>
              </div>
            </div>

            {/* SECURITY */}

            <div
              className="
                relative
                z-10
                rounded-3xl
                border
                border-white/10
                bg-white/10
                p-5
                backdrop-blur
              "
            >
              <div className="flex items-start gap-3">
                <KeyRound size={22} className="mt-1 text-yellow-300" />

                <div>
                  <p className="font-bold">Protected Verification</p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-blue-100
                    "
                  >
                    Never share your OTP with anyone. CampusPulse staff will
                    never ask for it.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================
              RIGHT OTP FORM
          ====================================== */}

          <div
            className="
              relative
              px-6
              py-8
              sm:px-10
              sm:py-10
              lg:px-14
              lg:py-12
            "
          >
            {/* BACK */}

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                px-2
                py-2
                text-sm
                font-bold
                text-gray-500
                transition
                hover:text-[#001B54]
              "
            >
              <ArrowLeft size={17} />
              Back
            </button>

            {/* MOBILE BRAND */}

            <div
              className="
                mt-5
                flex
                items-center
                gap-3
                lg:hidden
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#001B54]
                  text-white
                "
              >
                <ShieldCheck size={24} />
              </div>

              <div>
                <p
                  className="
                    font-black
                    text-[#001B54]
                  "
                >
                  CAMPUSPULSE
                </p>

                <p
                  className="
                    text-[10px]
                    font-bold
                    tracking-[0.15em]
                    text-gray-400
                  "
                >
                  AMITY GWALIOR
                </p>
              </div>
            </div>

            {/* ICON */}

            <div
              className="
                mt-8
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-3xl
                bg-gradient-to-br
                from-blue-100
                to-indigo-100
                shadow-inner
              "
            >
              <MailCheck size={38} className="text-[#001B54]" />
            </div>

            {/* TITLE */}

            <h1
              className="
                mt-7
                text-3xl
                font-black
                text-[#001B54]
                sm:text-4xl
              "
            >
              Verify Your Email
            </h1>

            <p
              className="
                mt-3
                max-w-md
                text-sm
                leading-6
                text-gray-500
              "
            >
              We have sent a 6-digit verification code to your registered email
              address.
            </p>

            {/* EMAIL BOX */}

            <div
              className="
                mt-5
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-blue-100
                bg-blue-50
                px-4
                py-3
              "
            >
              <MailCheck
                size={19}
                className="
                  shrink-0
                  text-blue-700
                "
              />

              <div className="min-w-0">
                <p
                  className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-gray-400
                  "
                >
                  OTP sent to
                </p>

                <p
                  className="
                    truncate
                    text-sm
                    font-extrabold
                    text-blue-800
                  "
                >
                  {email}
                </p>
              </div>
            </div>

            {/* MESSAGE */}

            {message && (
              <div
                className={`
                  mt-5
                  flex
                  items-start
                  gap-3
                  rounded-2xl
                  border
                  px-4
                  py-3.5
                  text-sm
                  font-semibold

                  ${
                    success
                      ? `
                        border-green-200
                        bg-green-50
                        text-green-700
                      `
                      : `
                        border-red-200
                        bg-red-50
                        text-red-700
                      `
                  }
                `}
              >
                {success ? (
                  <CheckCircle2
                    size={20}
                    className="
                      mt-0.5
                      shrink-0
                    "
                  />
                ) : (
                  <AlertCircle
                    size={20}
                    className="
                      mt-0.5
                      shrink-0
                    "
                  />
                )}

                <span>{message}</span>
              </div>
            )}

            {/* ======================================
                OTP FORM
            ====================================== */}

            <form onSubmit={handleVerify} className="mt-7">
              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-extrabold
                  text-gray-700
                "
              >
                Verification Code
              </label>

              <div className="relative">
                <KeyRound
                  size={20}
                  className="
                    absolute
                    left-5
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                />

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  required
                  className="
                    w-full
                    rounded-2xl
                    border-2
                    border-gray-200
                    bg-gray-50
                    py-4
                    pl-14
                    pr-5
                    text-center
                    text-2xl
                    font-black
                    tracking-[0.45em]
                    text-[#001B54]
                    outline-none
                    transition
                    placeholder:text-gray-300
                    focus:border-[#001B54]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-100
                  "
                />
              </div>

              <p
                className="
                  mt-2
                  text-xs
                  text-gray-400
                "
              >
                Enter the six-digit code exactly as shown in your email.
              </p>

              {/* VERIFY */}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="
                  mt-6
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-gradient-to-r
                  from-[#001B54]
                  to-[#003D92]
                  py-4
                  font-extrabold
                  text-white
                  shadow-lg
                  shadow-blue-900/20
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-xl
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  disabled:hover:translate-y-0
                "
              >
                {loading ? (
                  <>
                    <RefreshCw size={19} className="animate-spin" />
                    Verifying OTP...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={19} />
                    Verify & Continue
                  </>
                )}
              </button>
            </form>

            {/* ======================================
                RESEND
            ====================================== */}

            <div
              className="
                mt-6
                border-t
                border-gray-100
                pt-5
                text-center
              "
            >
              <p className="text-sm text-gray-500">
                Didn't receive the verification code?
              </p>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resending}
                className="
                  mt-2
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  px-4
                  py-2
                  text-sm
                  font-extrabold
                  text-[#7A0019]
                  transition
                  hover:bg-red-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <RefreshCw
                  size={16}
                  className={resending ? "animate-spin" : ""}
                />

                {resending ? "Sending OTP..." : "Resend OTP"}
              </button>
            </div>

            {/* FOOTER */}

            <div
              className="
                mt-7
                text-center
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  text-gray-400
                "
              >
                CampusPulse ERP • Secure Email Verification
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  text-gray-300
                "
              >
                Amity University Gwalior Campus
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
