import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const API_URL = import.meta.env.VITE_API_URL;  // Accessing VITE_API_URL from .env

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

  // useEffect to handle Duo callback after the popup is closed
  useEffect(() => {
    const duoCode = new URLSearchParams(window.location.search).get("duo_code");
    const duoState = new URLSearchParams(window.location.search).get("state");

    if (duoCode && duoState) {
      // Step 1: Verify Duo authentication with backend
      const verifyDuo = async () => {
        try {
          const res = await fetch(`${API_URL}/api/auth/duo/callback?duo_code=${duoCode}&state=${duoState}`, {
            method: "GET",
            credentials: "include",
          });
          const data = await res.json();

          if (res.ok && data.token) {
            // Step 2: Store the token in localStorage
            localStorage.setItem('token', data.token);
            setMessage("Duo Authentication Successful! Redirecting to login...");
            setTimeout(() => {
              navigate("/curasure/login");
            }, 1500);
          } else {
            alert("Duo verification failed. Please try again.");
            navigate("/curasure/login");
          }
        } catch (err) {
          console.error('Duo verification error:', err);
          alert('An error occurred during Duo verification. Please try again.');
          navigate("/curasure/login");
        }
      };

      verifyDuo();
    }
  }, [navigate]);  // Dependency on navigate so it runs when the component mounts

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      // Step 1: Initiate Duo + backend pre-check
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role, theme }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      // Step 2: Open Duo in popup
      const popup = window.open(data.duoAuthUrl, "duoPopup", "width=500,height=700");

      const interval = setInterval(async () => {
        if (popup && popup.closed) {
          clearInterval(interval);
        }
      }, 500);
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
