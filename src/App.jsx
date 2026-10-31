import { Route, Routes } from "react-router-dom";

import LandingPage from "./modules/auth/pages/LandingPage";
import Login from "./modules/auth/pages/Login";
import Register from "./modules/auth/pages/Register";

import GlobalAutoRefresh from "./components/GlobalAutoRefresh";

export default function App() {
  return (
    <>
      <GlobalAutoRefresh />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Keep your existing protected dashboard
            and authentication routes here. */}
      </Routes>
    </>
  );
}
