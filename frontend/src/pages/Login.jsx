import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { login, googleLogin } from "../services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const redirect = (role) => {
    if (role === "BUYER") navigate("/buyer");
    else if (role.includes("SELLER")) navigate("/seller");
    else navigate("/admin");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      redirect(res.data.role);
    } catch {
      setError("Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (res) => {
    setLoading(true);
    try {
      const r = await googleLogin(res.credential);
      localStorage.setItem("token", r.data.token);
      localStorage.setItem("role", r.data.role);
      redirect(r.data.role);
    } catch {
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container slide-up">
        {/* Sidebar (Left) */}
        <div className="auth-sidebar">
          <div style={{ position: "relative", zIndex: 10 }}>
            <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "white" }}>IndiExport</h1>
            <p style={{ fontSize: "1.25rem", opacity: 0.9, lineHeight: 1.6 }}>
              The premium B2B marketplace connecting Indian manufacturers with global buyers.
            </p>
            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
              <div className="badge badge-warning" style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.4)" }}>
                Global Reach
              </div>
              <div className="badge badge-warning" style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.4)" }}>
                Verified Suppliers
              </div>
            </div>
          </div>
        </div>

        {/* Content (Right) */}
        <div className="auth-content">
          <div style={{ maxWidth: "400px", margin: "0 auto", width: "100%" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "var(--text-main)" }}>Welcome Back</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
              Please enter your details to sign in.
            </p>

            {error && (
              <div className="animate-fade-in" style={{
                backgroundColor: "var(--error-bg)",
                color: "var(--error-text)",
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                marginBottom: "1.5rem",
                fontSize: "0.875rem",
                border: "1px solid var(--error)"
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="auth-input-group">
                <input
                  type="email"
                  className="auth-input"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label>Email Address</label>
              </div>

              <div className="auth-input-group">
                <input
                  type="password"
                  className="auth-input"
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label>Password</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: "100%", padding: "0.875rem", fontSize: "1rem", marginBottom: "1.5rem" }}
              >
                {loading ? <div className="loader" style={{ width: "1.25rem", height: "1.25rem", borderTopColor: "white", borderRightColor: "white" }}></div> : "Sign In"}
              </button>
            </form>

            <div style={{ position: "relative", textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ position: "absolute", left: 0, top: "50%", width: "100%", height: "1px", backgroundColor: "var(--border)" }}></div>
              <span style={{ position: "relative", backgroundColor: "white", padding: "0 10px", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                Or continue with
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google login failed")}
                type="standard"
                theme="outline"
                size="large"
                width="100%"
                text="signin_with"
                shape="rectangular"
              />
            </div>

            <div style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
