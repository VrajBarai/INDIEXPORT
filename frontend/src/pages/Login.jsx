import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { login, googleLogin } from "../services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const redirect = (role) => {
    if (role === "BUYER") navigate("/buyer");
    else if (role.includes("SELLER")) navigate("/seller");
    else navigate("/admin");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(email, password);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      redirect(res.data.role);
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="container">
      <h2>IndiExport Login</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleLogin}>
        <input placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button>Login</button>
      </form>

      <GoogleLogin
        onSuccess={async (res) => {
          const r = await googleLogin(res.credential);
          localStorage.setItem("token", r.data.token);
          localStorage.setItem("role", r.data.role);
          redirect(r.data.role);
        }}
        onError={() => setError("Google login failed")}
      />

      <div className="link">
        <Link to="/register">Create account</Link>
      </div>
    </div>
  );
};

export default Login;
