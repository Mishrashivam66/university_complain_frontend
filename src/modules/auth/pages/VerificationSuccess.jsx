import { Link } from "react-router-dom";

const VerificationSuccess = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {" "}
      <h1 className="text-3xl font-bold text-green-600">✅ Email Verified </h1>
      <p className="mt-4">Your account has been verified successfully.</p>
      <p className="mb-6">You can now login to Campus Nexus ERP.</p>
      <Link to="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg">
        Go to Login
      </Link>
    </div>
  );
};

export default VerificationSuccess;
