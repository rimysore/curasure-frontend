import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
 
const API_URL = import.meta.env.VITE_API_URL;
 
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
 
          // Step 3: Create user role-specific profile
          if (role === "doctor") {
            const hospitalResponse = await fetch(`${API_URL}/api/hospitals`);
            const hospitals = await hospitalResponse.json();
            const hospital = hospitals.find((h: any) => h.name === "City General Hospital");
            if (!hospital) throw new Error("Hospital not found");
 
            const doctorResponse = await fetch(`${API_URL}/api/doctor`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name,
                email,
                specialization: "General",
                hospital: hospital._id,
                rating: 0,
                experience: 0,
                profilePicture: "",
                available: true,
                covidCare: false,
              }),
            });
 
            if (!doctorResponse.ok) {
              const doctorData = await doctorResponse.json();
              throw new Error(doctorData.message || "Error saving doctor profile");
            }
          } else if (role === "patient") {
            const patientResponse = await fetch(`${API_URL}/api/patient`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name,
                age: 0,
                gender: "",
                contact: "",
                address: "",
              }),
            });
 
            if (!patientResponse.ok) {
              const patientData = await patientResponse.json();
              throw new Error(patientData.message || "Error saving patient profile");
            }
          } else if (role === "insurance_provider") {
            const providerResponse = await fetch(`${API_URL}/api/insurance-provider/insurance`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name,
                email,
                password,
                companyName: "CuraSure Insurance Co.",
              }),
            });
 
            if (!providerResponse.ok) {
              const providerData = await providerResponse.json();
              throw new Error(providerData.message || "Error creating insurance provider profile");
            }
          }
 
          setMessage("Registration successful! Redirecting to login...");
          setTimeout(() => navigate("/curasure/login"), 1500);
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
<option value="" disabled hidden>
                  Select a role
</option>
<option value="patient">Patient</option>
<option value="doctor">Doctor</option>
<option value="insurance_provider">Insurance Provider</option>
</select>
</div>
<div className="input-group">
<select value={theme} onChange={(e) => setTheme(e.target.value)} required>
<option value="" disabled hidden>
                  Select a theme
</option>
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
<a href="/curasure/login" className="signinLink">
                Login
</a>
</p>
</form>
</div>
</div>
</>
  );
}
 
export default Register;