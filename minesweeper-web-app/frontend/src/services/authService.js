import { apiPost } from "./api";

export function registerUser({ username, email, password, confirmPassword }) {
  return apiPost("register.php", {
    username,
    email,
    password,
    confirm_password: confirmPassword,
  });
}

export function loginUser({ email, password }) {
  return apiPost("login.php", { email, password });
}

export function logoutUser() {
  return apiPost("logout.php", {});
}
