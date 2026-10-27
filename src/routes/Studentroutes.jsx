import { Route } from "react-router-dom";

// =====================================================
// AMI MAINTENANCE - STUDENT ROUTES
// =====================================================

// =====================================================
// LAYOUT
// =====================================================

import StudentLayout from "../layouts/student/StudentLayout";

// =====================================================
// STUDENT PAGES
// =====================================================

import Dashboard from "../modules/Student/Dashboard";

import CreateComplaint from "../modules/Student/CreateComplaint";

import MyComplaints from "../modules/Student/MyComplaints";

import ComplaintDetails from "../modules/Student/ComplaintDetails";

import StudentNotices from "../modules/Student/StudentNotices";

import HostelDetails from "../modules/Student/HostelDetails";

import Profile from "../modules/Student/Profile";

import EditProfile from "../modules/Student/EditProfile";

import ChangePassword from "../modules/Student/ChangePassword";

import MessComplaints from "../mess/MessComplaints";

import Notifications from "../modules/common/Notifications";

// =====================================================
// STUDENT ROUTE CONFIGURATION
// =====================================================

const Studentroutes = (
  <Route element={<StudentLayout />}>
    {/* ================================================
        STUDENT DASHBOARD
    ================================================= */}

    <Route path="/dashboard" element={<Dashboard />} />

    {/* ================================================
        CREATE COMPLAINT
    ================================================= */}

    <Route path="/create-complaint" element={<CreateComplaint />} />

    {/* ================================================
        MY COMPLAINTS
    ================================================= */}

    <Route path="/complaints" element={<MyComplaints />} />

    {/* ================================================
        COMPLAINT DETAILS - NEW PREMIUM PAGE

        Example:
        /complaints/COMPLAINT_MONGODB_ID
    ================================================= */}

    <Route path="/complaints/:id" element={<ComplaintDetails />} />

    {/* ================================================
        COMPLAINT DETAILS - OLD ROUTE

        Kept for backward compatibility.
    ================================================= */}

    <Route path="/complaint/:id" element={<ComplaintDetails />} />

    {/* ================================================
        STUDENT NOTICES
    ================================================= */}

    <Route path="/student/notices" element={<StudentNotices />} />

    {/* ================================================
        HOSTEL DETAILS
    ================================================= */}

    <Route path="/hostel-details" element={<HostelDetails />} />

    {/* ================================================
        STUDENT PROFILE
    ================================================= */}

    <Route path="/profile" element={<Profile />} />

    {/* ================================================
        EDIT STUDENT PROFILE
    ================================================= */}

    <Route path="/edit-profile" element={<EditProfile />} />

    {/* ================================================
        CHANGE PASSWORD

        Existing route preserved.
    ================================================= */}

    <Route path="/change-password" element={<ChangePassword />} />

    {/* ================================================
        STUDENT NOTIFICATIONS
    ================================================= */}

    <Route path="/notifications" element={<Notifications />} />

    {/* ================================================
        LEGACY MESS COMPLAINTS

        Route preserved for compatibility.
        It can remain hidden from the sidebar.
    ================================================= */}

    <Route path="/student/mess-complaints" element={<MessComplaints />} />
  </Route>
);

// =====================================================
// EXPORT
// =====================================================

export default Studentroutes;
