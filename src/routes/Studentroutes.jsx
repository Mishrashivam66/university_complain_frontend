import { Route } from "react-router-dom";

// ==========================================
// LAYOUT
// ==========================================

import StudentLayout from "../layouts/student/StudentLayout";

// ==========================================
// PAGES
// ==========================================

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
const Studentroutes = (
  <Route element={<StudentLayout />}>
    <Route path="/dashboard" element={<Dashboard />} />

    <Route path="/complaints" element={<MyComplaints />} />

    <Route path="/create-complaint" element={<CreateComplaint />} />

    <Route path="/complaint/:id" element={<ComplaintDetails />} />

    <Route path="/student/notices" element={<StudentNotices />} />

    <Route path="/hostel-details" element={<HostelDetails />} />

    <Route path="/profile" element={<Profile />} />

    <Route path="/edit-profile" element={<EditProfile />} />

    <Route path="/change-password" element={<ChangePassword />} />
    <Route path="/notifications" element={<Notifications />} />

    <Route path="/student/mess-complaints" element={<MessComplaints />} />
  </Route>
);

export default Studentroutes;
