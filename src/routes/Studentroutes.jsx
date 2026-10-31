import { Navigate, Route } from "react-router-dom";

// =====================================================
// STUDENT LAYOUT
// =====================================================

import StudentLayout from "../layouts/student/StudentLayout";

// =====================================================
// STUDENT PAGES
// =====================================================

import Dashboard from "../modules/Student/Dashboard";

import CreateComplaint from "../modules/Student/CreateComplaint";

import MyComplaints from "../modules/Student/MyComplaints";

import ComplaintDetails from "../modules/Student/ComplaintDetails";

import Profile from "../modules/Student/Profile";

import EditProfile from "../modules/Student/EditProfile";

import ChangePassword from "../modules/Student/ChangePassword";

import MessComplaints from "../mess/MessComplaints";

import Notifications from "../modules/common/Notifications";

// =====================================================
// AMI MAINT. - STUDENT ROUTES
// =====================================================

const Studentroutes = (
  <Route element={<StudentLayout />}>
    {/* DASHBOARD */}

    <Route path="/dashboard" element={<Dashboard />} />

    {/* CREATE COMPLAINT */}

    <Route path="/create-complaint" element={<CreateComplaint />} />

    {/* MY COMPLAINTS */}

    <Route path="/complaints" element={<MyComplaints />} />

    {/* PREMIUM COMPLAINT DETAILS */}

    <Route path="/complaints/:id" element={<ComplaintDetails />} />

    {/* LEGACY COMPLAINT DETAILS */}

    <Route path="/complaint/:id" element={<ComplaintDetails />} />

    {/* ========================================
        COMBINED STUDENT PROFILE
    ======================================== */}

    <Route path="/profile" element={<Profile />} />

    {/* ========================================
        OLD HOSTEL PAGE -> PROFILE HOSTEL SECTION
    ======================================== */}

    <Route
      path="/hostel-details"
      element={<Navigate to="/profile#hostel" replace />}
    />

    {/* ========================================
        OLD NOTICES PAGE -> PROFILE NOTICES SECTION
    ======================================== */}

    <Route
      path="/student/notices"
      element={<Navigate to="/profile#notices" replace />}
    />

    {/* EDIT PROFILE */}

    <Route path="/edit-profile" element={<EditProfile />} />

    {/* CHANGE PASSWORD */}

    <Route path="/change-password" element={<ChangePassword />} />

    {/* NOTIFICATIONS */}

    <Route path="/notifications" element={<Notifications />} />

    {/* MESS COMPLAINTS */}

    <Route path="/student/mess-complaints" element={<MessComplaints />} />
  </Route>
);

export default Studentroutes;
