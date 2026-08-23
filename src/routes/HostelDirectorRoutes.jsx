import { Route } from "react-router-dom";

// ==========================================
// LAYOUT
// ==========================================

import HostelDirectorLayout from "../layouts/hostelDirector/HostelDirectorLayout";

// ==========================================
// PAGES
// ==========================================

import HostelDirectorDashboard from "../modules/hostelDirector/HostelDirectorDashboard";

import HostelOverview from "../modules/hostelDirector/HostelOverview";

import Wardens from "../modules/hostelDirector/Wardens";

import CreateWarden from "../modules/hostelDirector/CreateWarden";

import HostelStudents from "../modules/hostelDirector/HostelStudents";

import HostelComplaints from "../modules/hostelDirector/HostelComplaints";

// ==========================================
// HOSTEL DIRECTOR ROUTES
// ==========================================

const HostelDirectorRoutes = (
  <Route path="/hostel-director" element={<HostelDirectorLayout />}>
    {/* ======================================
        DEFAULT
    ====================================== */}

    <Route index element={<HostelDirectorDashboard />} />

    {/* ======================================
        DASHBOARD
    ====================================== */}

    <Route path="dashboard" element={<HostelDirectorDashboard />} />

    {/* ======================================
        HOSTEL OVERVIEW
    ====================================== */}

    <Route path="overview" element={<HostelOverview />} />

    {/* ======================================
        WARDENS
    ====================================== */}

    <Route path="wardens" element={<Wardens />} />

    {/* ======================================
        CREATE WARDEN
    ====================================== */}

    <Route path="create-warden" element={<CreateWarden />} />

    {/* ======================================
        HOSTEL STUDENTS
    ====================================== */}

    <Route path="students" element={<HostelStudents />} />

    {/* ======================================
        HOSTEL COMPLAINTS
    ====================================== */}

    <Route path="complaints" element={<HostelComplaints />} />
  </Route>
);

export default HostelDirectorRoutes;
