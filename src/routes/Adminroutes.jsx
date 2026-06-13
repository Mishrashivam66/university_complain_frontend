import { Route } from "react-router-dom";

// ==========================================
// LAYOUT
// ==========================================

import AdminLayout from "../layouts/admin/AdminLayout";

import Notifications from "../modules/common/Notifications";
// ==========================================
// ADMIN PAGES
// ==========================================

import AdminDashboard from "../modules/admin/AdminDashboard";

import Announcements from "../modules/admin/Announcements";

import AuditLogs from "../modules/admin/AuditLogs";

import Categories from "../modules/admin/Categories";

import ComplaintMonitor from "../modules/admin/ComplaintMonitor";

import CreateUser from "../modules/admin/CreateUser";

import InventoryManagement from "../modules/admin/InventoryManagement";

import LocationsManagement from "../modules/admin/LocationsManagement";

import ManageComplaints from "../modules/admin/ManageComplaints";

import ManageStudents from "../modules/admin/ManageStudents";

import ManageUsers from "../modules/admin/ManageUsers";

import ManageWardens from "../modules/admin/ManageWardens";

import OverdueComplaints from "../modules/admin/OverdueComplaints";

import Reports from "../modules/admin/Reports";

import RolesPermissions from "../modules/admin/RolesPermissions";

import ManageBuildings from "../modules/admin/ManageBuildings";

import ManageHostels from "../modules/admin/ManageHostels";

// ==========================================
// ROUTES
// ==========================================

const Adminroutes = (
  <Route element={<AdminLayout />}>
    {/* DASHBOARD */}

    <Route path="/admin/dashboard" element={<AdminDashboard />} />

    {/* CREATE USER */}

    <Route path="/admin/create-user" element={<CreateUser />} />

    {/* MANAGE STUDENTS */}

    <Route path="/admin/manage-students" element={<ManageStudents />} />

    {/* MANAGE USERS */}

    <Route path="/admin/manage-users" element={<ManageUsers />} />

    {/* MANAGE WARDENS */}

    <Route path="/admin/manage-wardens" element={<ManageWardens />} />

    <Route path="/admin/manage-hostels" element={<ManageHostels />} />

    <Route path="/admin/manage-buildings" element={<ManageBuildings />} />

    {/* MANAGE COMPLAINTS */}

    <Route path="/admin/manage-complaints" element={<ManageComplaints />} />

    {/* COMPLAINT MONITOR */}

    <Route path="/admin/complaint-monitor" element={<ComplaintMonitor />} />

    {/* OVERDUE COMPLAINTS */}

    <Route path="/admin/overdue-complaints" element={<OverdueComplaints />} />

    {/* INVENTORY */}

    <Route
      path="/admin/inventory-management"
      element={<InventoryManagement />}
    />

    {/* LOCATIONS */}

    <Route
      path="/admin/locations-management"
      element={<LocationsManagement />}
    />

    {/* REPORTS */}

    <Route path="/admin/reports" element={<Reports />} />

    {/* ANNOUNCEMENTS */}

    <Route path="/admin/announcements" element={<Announcements />} />

    {/* ADMIN NOTIFICATIONS */}

    <Route path="/admin/notifications" element={<Notifications />} />

    {/* CATEGORIES */}

    <Route path="/admin/categories" element={<Categories />} />

    {/* AUDIT LOGS */}

    <Route path="/admin/audit-logs" element={<AuditLogs />} />

    {/* ROLES & PERMISSIONS */}

    <Route path="/admin/roles-permissions" element={<RolesPermissions />} />
  </Route>
);

export default Adminroutes;
