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
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate("/");
    } catch {
      setError("Registration failed");
    }
  };

  return (
    <div className="container">
      <h2>Create Account</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} required />
        <input name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password"
          onChange={handleChange} required />
        <select name="role" onChange={handleChange}>
          <option value="BUYER">Buyer</option>
          <option value="SELLER">Seller</option>
        </select>
        <button>Register</button>
      </form>

      <div className="link">
        <Link to="/">Already have account?</Link>
      </div>
    </div>
  );
};

export default Register;
