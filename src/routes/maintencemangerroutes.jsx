// ==========================================
// maintencemangerroutes.jsx
// ==========================================

import { Route } from "react-router-dom";
import Notifications from "../modules/common/Notifications";

// ==========================================
// LAYOUT
// ==========================================

import MaintenanceManagerLayout from "../layouts/maintencemanager/MaintenanceManagerLayout";

// ==========================================
// PAGES
// ==========================================

import MaintenanceDashboard from "../modules/Maintenancemanager/MaintenanceDashboard";

import AssignWorker from "../modules/Maintenancemanager/AssignWorker";

import WorkersManagement from "../modules/Maintenancemanager/WorkersManagement";

import MaterialRequest from "../modules/Maintenancemanager/MaterialRequest";

import JobCards from "../modules/Maintenancemanager/JobCards";

import ReopenComplaints from "../modules/Maintenancemanager/ReopenComplaints";

import WorkerPerformance from "../modules/Maintenancemanager/WorkerPerformance";

import OverdueComplaints from "../modules/Maintenancemanager/OverdueComplaints";

import Reports from "../modules/Maintenancemanager/Reports";

import Complaints from "../modules/Maintenancemanager/Complaints";

const Maintencemangerroutes = (
  <Route element={<MaintenanceManagerLayout />}>
    {/* ========================================== */}
    {/* DASHBOARD */}
    {/* ========================================== */}

    <Route path="/maintenance/dashboard" element={<MaintenanceDashboard />} />

    {/* ========================================== */}
    {/* ASSIGN WORKER */}
    {/* ========================================== */}

    <Route path="/maintenance/assign-worker" element={<AssignWorker />} />

    {/* ========================================== */}
    {/* WORKERS */}
    {/* ========================================== */}

    <Route path="/maintenance/workers" element={<WorkersManagement />} />

    {/* ========================================== */}
    {/* JOB CARDS */}
    {/* ========================================== */}

    <Route path="/maintenance/job-cards" element={<JobCards />} />

    {/* ========================================== */}
    {/* MATERIAL REQUEST */}
    {/* ========================================== */}

    <Route
      path="/maintenance/material-requests"
      element={<MaterialRequest />}
    />

    {/* ========================================== */}
    {/* REOPEN COMPLAINTS */}
    {/* ========================================== */}

    <Route
      path="/maintenance/reopen-complaints"
      element={<ReopenComplaints />}
    />

    {/* ========================================== */}
    {/* PERFORMANCE */}
    {/* ========================================== */}

    <Route
      path="/maintenance/worker-performance"
      element={<WorkerPerformance />}
    />

    {/* ========================================== */}
    {/* OVERDUE COMPLAINTS */}
    {/* ========================================== */}

    <Route
      path="/maintenance/overdue-complaints"
      element={<OverdueComplaints />}
    />

    {/* ========================================== */}
    {/* REPORTS */}
    {/* ========================================== */}

    <Route path="/maintenance/reports" element={<Reports />} />

    {/* ========================================== */}
    {/* COMPLAINTS */}
    {/* ========================================== */}

    <Route path="/maintenance/complaints" element={<Complaints />} />

    {/* ========================================== */}
    {/* NOTIFICATIONS */}
    {/* ========================================== */}

    <Route path="/maintenance/notifications" element={<Notifications />} />
  </Route>
);

export default Maintencemangerroutes;
