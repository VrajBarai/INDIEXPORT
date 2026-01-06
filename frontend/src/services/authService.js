import axios from "axios";

const API = "/api/auth";

export const login = (email, password) =>
  axios.post(`${API}/login`, { email, password });

export const register = (data) => {
  console.log(data);
  axios.post(`${API}/register`, data);
}

export const googleLogin = (token) =>
  axios.post(`${API}/google`, { token });

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}
