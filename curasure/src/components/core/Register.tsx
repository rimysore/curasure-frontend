import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const API_URL = import.meta.env.VITE_API_URL; // Accessing VITE_API_URL from .env

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [theme, setTheme] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      // Step 1: Send registration data to backend
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include', // Ensure credentials are included
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role, theme }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      // Step 2: If registration is successful, redirect to login
      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="header" style={{ cursor: "pointer" }} onClick={() => navigate("/curasure/")}>
        CuraSure
      </div>
      <div className="register-container">
        <div className="register-box">
          <h2 className="title">Register</h2>
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}
          <form onSubmit={handleRegister} className="register-form">
            <div className="input-group">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="" disabled hidden>Select a role</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="insurance_provider">Insurance Provider</option>
              </select>
            </div>
            <div className="input-group">
              <select value={theme} onChange={(e) => setTheme(e.target.value)} required>
                <option value="" disabled hidden>Select a theme</option>
                <option value="default">Default</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
            <button className="button" type="submit">
              {loading ? "Loading..." : "Create Account"}
            </button>
            <p className="signinText">
              Already Have An Account?{" "}
              <a href="/curasure/login" className="signinLink">Login</a>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default Register;
