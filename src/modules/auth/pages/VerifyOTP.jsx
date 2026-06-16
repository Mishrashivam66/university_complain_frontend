import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">
          Verify Email OTP
        </h1>

        <p className="text-center text-gray-600 mb-6">
          Enter the OTP sent to:
          <br />
          <strong>{email}</strong>
        </p>

        {message && (
          <div className="mb-4 p-3 rounded bg-gray-100 text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="Enter 6 Digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
            className="w-full border p-3 rounded mb-4"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <button
          onClick={handleResendOTP}
          className="w-full mt-4 border p-3 rounded"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
};

export default VerifyOTP;
