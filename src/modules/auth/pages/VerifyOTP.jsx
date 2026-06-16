import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

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
      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setSuccess(false);
      setMessage(error.response?.data?.message || "OTP Verification Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/resend-otp`,
        {
          email,
        },
      );

      alert("OTP Sent Successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-gradient-to-br
        from-blue-50
        via-white
        to-indigo-100
        px-4
        py-8
      "
    >
      <div
        className="
          w-full
          max-w-md
          sm:max-w-lg
          bg-white
          rounded-3xl
          shadow-2xl
          p-6
          sm:p-8
        "
      >
        {/* ICON */}
        <div className="text-center">
          <div
            className="
              w-20
              h-20
              mx-auto
              bg-blue-100
              rounded-full
              flex
              items-center
              justify-center
            "
          >
            <span className="text-4xl">📧</span>
          </div>

          <h1
            className="
              text-2xl
              sm:text-3xl
              font-bold
              text-gray-800
              mt-5
            "
          >
            Verify Your Email
          </h1>

          <p className="text-gray-500 mt-3 text-sm sm:text-base">
            Enter the OTP sent to
          </p>

          <p
            className="
              font-semibold
              text-blue-600
              break-all
              text-sm
              sm:text-base
              mt-1
            "
          >
            {email}
          </p>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className={`
              mt-6
              p-4
              rounded-2xl
              text-center
              font-medium
              text-sm
              sm:text-base
              ${
                success
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }
            `}
          >
            {message}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleVerify} className="mt-6">
          <input
            type="text"
            placeholder="Enter 6 Digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            maxLength={6}
            required
            className="
              w-full
              border-2
              border-gray-200
              rounded-2xl
              p-3
              sm:p-4
              text-center
              text-xl
              sm:text-2xl
              tracking-[6px]
              sm:tracking-[10px]
              font-semibold
              focus:outline-none
              focus:border-blue-500
              transition
            "
          />

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              mt-5
              bg-blue-600
              hover:bg-blue-700
              text-white
              py-3
              sm:py-4
              rounded-2xl
              font-semibold
              transition
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {/* RESEND */}
        <button
          onClick={handleResendOTP}
          className="
            w-full
            mt-4
            border
            border-gray-300
            py-3
            rounded-2xl
            font-medium
            hover:bg-gray-50
            transition
          "
        >
          Resend OTP
        </button>

        {/* FOOTER */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-xs sm:text-sm">
            CampusNexus ERP • Secure Email Verification
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
