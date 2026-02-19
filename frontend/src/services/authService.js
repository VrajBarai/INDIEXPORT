import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API = `${BASE_URL}/api/auth`;

export const login = (email, password) =>
  axios.post(`${API}/login`, { email, password });

export const register = (data) =>
  axios.post(`${API}/register`, data);

export const googleLogin = (token) =>
  axios.post(`${API}/google`, { token });

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};
