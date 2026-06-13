import api from "./api";



// ==========================================
// LOGIN
// ==========================================

export const loginUser =
(data) =>
  api.post(
    "/auth/login",
    data
  );



// ==========================================
// REGISTER
// ==========================================

export const registerUser =
(data) =>
  api.post(
    "/auth/register",
    data
  );



// ==========================================
// FORGOT PASSWORD
// ==========================================

export const forgotPassword =
(data) =>
  api.post(
    "/auth/forgot-password",
    data
  );



// ==========================================
// RESET PASSWORD
// ==========================================

export const resetPassword =
(token, data) =>
  api.post(
    `/auth/reset-password/${token}`,
    data
  );