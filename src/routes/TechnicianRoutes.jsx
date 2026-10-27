import { Navigate, Route } from "react-router-dom";

import TechnicianDashboard from "../modules/technician/pages/TechnicianDashboard";

// ==========================================
// AMIMAINTAIN - TECHNICIAN ROUTES
// ==========================================

const TechnicianRoutes = (
  <>
    {/* MAIN TECHNICIAN DASHBOARD */}

    <Route path="/technician/dashboard" element={<TechnicianDashboard />} />

    {/* OLD WORKER DASHBOARD URL COMPATIBILITY */}

    <Route
      path="/worker/dashboard"
      element={<Navigate to="/technician/dashboard" replace />}
    />
  </>
);

export default TechnicianRoutes;
