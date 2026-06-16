import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-email/${token}`,
        );

        console.log(res.data);

        alert("Email Verified Successfully");

        navigate("/login");
      } catch (error) {
        console.log(error);

        alert(error.response?.data?.message || "Verification Failed");

        navigate("/verification-failed");
      }
    };

    verify();
  }, [token, navigate]);

  return <div>Verifying Email...</div>;
};

export default VerifyEmail;
