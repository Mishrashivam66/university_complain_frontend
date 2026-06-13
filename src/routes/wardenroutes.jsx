import { Route } from "react-router-dom";

// ==========================================
// LAYOUT
// ==========================================

import WardenLayout from "../layouts/warden/WardenLayout";

// ==========================================
// PAGES
// ==========================================
import Notifications from "../modules/common/Notifications";
import WardenDashboard from "../modules/warden/WardenDashboard";

import ManageStudents from "../modules/warden/ManageStudents";

import HostelComplaints from "../modules/warden/HostelComplaints";

import PendingStudents from "../modules/warden/PendingStudents";

import EmergencyAlerts from "../modules/warden/EmergencyAlerts";

import ComplaintEscalation from "../modules/warden/ComplaintEscalation";

import WardenReports from "../modules/warden/WardenReports";

import RoomAllocation from "../modules/warden/RoomAllocation";

import VisitorManagement from "../modules/warden/VisitorManagement";

import HostelDiscipline from "../modules/warden/HostelDiscipline";

import HostelNotices from "../modules/warden/HostelNotices";

import MessComplaints from "../modules/warden/MessComplaints";

import StudentHistory from "../modules/warden/StudentHistory";

import StudentProfile from "../modules/warden/StudentProfile";

// ==========================================
// ROUTES
// ==========================================

const Wardenroutes = (
  <Route path="/warden" element={<WardenLayout />}>
    {/* DASHBOARD */}

    <Route path="dashboard" element={<WardenDashboard />} />

    {/* STUDENTS */}

    <Route path="manage-students" element={<ManageStudents />} />

    <Route path="pending-students" element={<PendingStudents />} />

    <Route path="student-history" element={<StudentHistory />} />

    <Route path="student-profile/:id" element={<StudentProfile />} />

    {/* COMPLAINTS */}

    <Route path="complaints" element={<HostelComplaints />} />

    <Route path="mess-complaints" element={<MessComplaints />} />

    <Route path="escalation" element={<ComplaintEscalation />} />

    {/* EMERGENCY */}

    <Route path="emergency-alerts" element={<EmergencyAlerts />} />

    {/* ROOM */}

    <Route path="room-allocation" element={<RoomAllocation />} />

    {/* VISITOR */}

    <Route path="visitor-management" element={<VisitorManagement />} />

    {/* DISCIPLINE */}

    <Route path="discipline" element={<HostelDiscipline />} />

    {/* NOTICES */}

    <Route path="notices" element={<HostelNotices />} />

    {/* REPORTS */}

    <Route path="reports" element={<WardenReports />} />

    {/* NOTIFICATIONS */}
    <Route path="notifications" element={<Notifications />} />
  </Route>
);

export default Wardenroutes;
