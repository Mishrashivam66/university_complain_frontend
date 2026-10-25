import { Route } from "react-router-dom";

// ==========================================
// AMIMAINTAIN ADMIN LAYOUT
// ==========================================

import AdminLayout from "../layouts/admin/AdminLayout";

// ==========================================
// DASHBOARD
// ==========================================

import AdminDashboard from "../modules/admin/AdminDashboard";

// ==========================================
// USERS & ACCESS
// ==========================================

import CreateUser from "../modules/admin/CreateUser";
import ManageUsers from "../modules/admin/ManageUsers";
import ManageStudents from "../modules/admin/ManageStudents";

// ==========================================
// CAMPUS SETUP
// ==========================================

import ManageBuildings from "../modules/admin/ManageBuildings";
import ManageHostels from "../modules/admin/ManageHostels";
import LocationsManagement from "../modules/admin/LocationsManagement";

// ==========================================
// CATEGORIES & PRIORITIES
// ==========================================

import Categories from "../modules/admin/Categories";

// ==========================================
// COMPLAINT MONITORING
// ==========================================

import ComplaintMonitor from "../modules/admin/ComplaintMonitor";
import OverdueComplaints from "../modules/admin/OverdueComplaints";

// ==========================================
// REPORTS & ANALYTICS
// ==========================================

import Reports from "../modules/admin/Reports";

// ==========================================
// FINAL ADMIN ROUTES
// ==========================================

const Adminroutes = (
  <Route element={<AdminLayout />}>
    {/* DASHBOARD */}
    <Route path="/admin/dashboard" element={<AdminDashboard />} />

    {/* USERS & ACCESS */}
    <Route path="/admin/create-user" element={<CreateUser />} />

    <Route path="/admin/manage-users" element={<ManageUsers />} />

    <Route path="/admin/manage-students" element={<ManageStudents />} />

    {/* CAMPUS SETUP */}
    <Route path="/admin/manage-buildings" element={<ManageBuildings />} />

    <Route path="/admin/manage-hostels" element={<ManageHostels />} />

    <Route
      path="/admin/locations-management"
      element={<LocationsManagement />}
    />

    {/* CATEGORIES & PRIORITIES */}
    <Route path="/admin/categories" element={<Categories />} />

    {/* COMPLAINT MONITORING */}
    <Route path="/admin/complaint-monitor" element={<ComplaintMonitor />} />

    <Route path="/admin/overdue-complaints" element={<OverdueComplaints />} />

    {/* REPORTS & ANALYTICS */}
    <Route path="/admin/reports" element={<Reports />} />
  </Route>
);

export default Adminroutes;
