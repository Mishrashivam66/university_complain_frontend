import { Navigate, Route } from "react-router-dom";

import TechnicianDashboard from "../modules/technician/pages/TechnicianDashboard";
import MyMaterials from "../modules/technician/MyMaterials";

// ==========================================
// AMI MAINT. — TECHNICIAN ROUTES
// ==========================================

const TechnicianRoutes = (
  <>
    {/* Main Technician Dashboard */}
    <Route path="/technician/dashboard" element={<TechnicianDashboard />} />

    {/* Technician Material Receiving */}
    <Route path="/technician/my-materials" element={<MyMaterials />} />

    {/* Legacy Worker URL */}
    <Route
      path="/worker/dashboard"
      element={<Navigate to="/technician/dashboard" replace />}
    />
  </>
);

export default TechnicianRoutes;
