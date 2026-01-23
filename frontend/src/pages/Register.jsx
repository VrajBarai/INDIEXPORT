import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "BUYER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRoleSelect = (role) => {
    setForm({ ...form, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container slide-up">
        {/* Sidebar (Left) */}
        <div className="auth-sidebar" style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 100%)" }}>
          <div style={{ position: "relative", zIndex: 10 }}>
            <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "white" }}>Join Us</h1>
            <p style={{ fontSize: "1.25rem", opacity: 0.9, lineHeight: 1.6 }}>
              Create your account today and start your global trade journey with IndiExport.
            </p>
            <div style={{ marginTop: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "50%", padding: "0.5rem", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>🚀</div>
                <span>Instant Access to Global Markets</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "50%", padding: "0.5rem", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>🛡️</div>
                <span>Secure & Verified Transactions</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "50%", padding: "0.5rem", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>📈</div>
                <span>Advanced Analytics Dashboard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content (Right) */}
        <div className="auth-content">
          <div style={{ maxWidth: "440px", margin: "0 auto", width: "100%" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "var(--text-main)" }}>Create Account</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
              Fill in the details below to get started.
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

            <form onSubmit={handleSubmit}>
              <div className="auth-input-group">
                <input
                  name="name"
                  className="auth-input"
                  placeholder=" "
                  onChange={handleChange}
                  required
                />
                <label>Full Name</label>
              </div>

              <div className="auth-input-group">
                <input
                  name="email"
                  type="email"
                  className="auth-input"
                  placeholder=" "
                  onChange={handleChange}
                  required
                />
                <label>Email Address</label>
              </div>

              <div className="auth-input-group">
                <input
                  name="password"
                  type="password"
                  className="auth-input"
                  placeholder=" "
                  onChange={handleChange}
                  required
                />
                <label>Password</label>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label className="input-label" style={{ marginBottom: "0.75rem" }}>I want to...</label>
                <div className="grid-2" style={{ gap: "1rem" }}>
                  <div
                    onClick={() => handleRoleSelect("BUYER")}
                    style={{
                      padding: "1rem",
                      border: `2px solid ${form.role === "BUYER" ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: "var(--radius-lg)",
                      cursor: "pointer",
                      backgroundColor: form.role === "BUYER" ? "var(--primary-light)" : "white",
                      textAlign: "center",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>🛒</div>
                    <div style={{ fontWeight: 600, color: form.role === "BUYER" ? "var(--primary)" : "var(--text-main)" }}>Buy</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Source Products</div>
                  </div>

                  <div
                    onClick={() => handleRoleSelect("SELLER")}
                    style={{
                      padding: "1rem",
                      border: `2px solid ${form.role === "SELLER" ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: "var(--radius-lg)",
                      cursor: "pointer",
                      backgroundColor: form.role === "SELLER" ? "var(--primary-light)" : "white",
                      textAlign: "center",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>🏭</div>
                    <div style={{ fontWeight: 600, color: form.role === "SELLER" ? "var(--primary)" : "var(--text-main)" }}>Sell</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>List Products</div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: "100%", padding: "0.875rem", fontSize: "1rem", marginBottom: "1.5rem" }}
              >
                {loading ? <div className="loader" style={{ width: "1.25rem", height: "1.25rem", borderTopColor: "white", borderRightColor: "white" }}></div> : "Create Account"}
              </button>
            </form>

            <div style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              Already have an account?{" "}
              <Link to="/" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
                Login here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
