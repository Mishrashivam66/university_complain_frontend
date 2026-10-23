import { Route, Routes } from "react-router-dom";
import LandingPage from "./modules/auth/pages/LandingPage";
import Login from "./modules/auth/pages/Login";
import Register from "./modules/auth/pages/Register";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Merge your existing /verify-otp, /forgot-password and protected
          dashboard routes here, using their actual imported components.
          They cannot be reconstructed from the files supplied so far. */}
    </Routes>
  );
}
