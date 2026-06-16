import { Link } from "react-router-dom";

const VerificationFailed = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {" "}
      <h1 className="text-3xl font-bold text-red-600">
        ❌ Verification Failed{" "}
      </h1>
      <p className="mt-4">Invalid or expired verification link.</p>
      <p className="mb-6">Please request a new verification email.</p>
      <Link to="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg">
        Back to Login
      </Link>
    </div>
  );
};

export default VerificationFailed;
