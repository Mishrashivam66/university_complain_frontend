import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-email/${token}`,
        );

        navigate("/verification-success");
      } catch (error) {
        console.error("Verification Error:", error);

        navigate("/verification-failed");
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {" "}
      <h2 className="text-xl font-semibold">Verifying your email... </h2>{" "}
    </div>
  );
};

export default VerifyEmail;
