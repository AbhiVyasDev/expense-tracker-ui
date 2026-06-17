import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await register(formData);
      alert(response.message || "Registration Successful");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Registration Failed");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px 12px 40px",
    border: "1.5px solid #E2E8F0",
    borderRadius: 10,
    fontSize: 14,
    color: "#0F172A",
    background: "#FFFFFF",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* ── Left brand panel ── */}
      <div style={{
        width: "42%",
        background: "#0F172A",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Geometric background accent */}
        <svg
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.07 }}
          viewBox="0 0 400 700"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="50" cy="580" r="280" stroke="#6366F1" strokeWidth="1.5" />
          <circle cx="50" cy="580" r="200" stroke="#6366F1" strokeWidth="1" />
          <circle cx="50" cy="580" r="120" stroke="#A5B4FC" strokeWidth="1" />
          <line x1="0" y1="0" x2="400" y2="700" stroke="#6366F1" strokeWidth="1" />
          <line x1="100" y1="0" x2="400" y2="500" stroke="#6366F1" strokeWidth="0.5" />
        </svg>

        {/* Logo */}
        {/* Logo */}
<div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
  <div style={{
    width: 44,
    height: 44,
    background: "#6366F1",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      {/* Bar chart bars */}
      <rect x="4" y="15" width="4" height="5" rx="1" fill="white" opacity="0.5"/>
      <rect x="10" y="11" width="4" height="9" rx="1" fill="white" opacity="0.7"/>
      <rect x="16" y="7" width="4" height="13" rx="1" fill="white"/>
      {/* Rising arrow */}
      <path d="M4 14 L18 5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9"/>
      <path d="M14 4 L18 5 L17 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  </div>
  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
    <span style={{
      color: "#F8FAFC",
      fontWeight: 800,
      fontSize: 17,
      letterSpacing: "-0.5px",
    }}>
      Expense
    </span>
    <span style={{
      color: "#6366F1",
      fontWeight: 600,
      fontSize: 10,
      letterSpacing: "2.5px",
      textTransform: "uppercase",
      marginTop: 2,
    }}>
      Tracker
    </span>
  </div>
</div>

        {/* Center copy */}
        <div style={{ position: "relative" }}>
          <p style={{ color: "#6366F1", fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16 }}>
            Get started
          </p>
          <h1 style={{
            color: "#F8FAFC",
            fontSize: 38,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-1px",
            margin: "0 0 20px",
          }}>
            Create your<br />account today
          </h1>
          <p style={{ color: "#94A3B8", fontSize: 15, lineHeight: 1.7, margin: 0, maxWidth: 260 }}>
            Join thousands of teams already using YourBrand to ship faster and stay organised.
          </p>

          {/* Trust badges */}
          <div style={{ display: "flex", gap: 24, marginTop: 36 }}>
            {[
              { value: "10k+", label: "Users" },
              { value: "99.9%", label: "Uptime" },
              { value: "Free", label: "To start" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p style={{ color: "#F8FAFC", fontSize: 20, fontWeight: 800, margin: "0 0 2px", letterSpacing: "-0.5px" }}>{value}</p>
                <p style={{ color: "#64748B", fontSize: 12, margin: 0, fontWeight: 500 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p style={{ color: "#334155", fontSize: 13, position: "relative", margin: 0 }}>
          © 2026 YourBrand. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        flex: 1,
        background: "#F8FAFC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 32px",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>

          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
              Create an account
            </h2>
            <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>
              Fill in the details below to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Full Name */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Full name
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="5.5" r="2.5" stroke="#94A3B8" strokeWidth="1.4" />
                    <path d="M2.5 13.5c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type="text"
                  name="name"
                  placeholder="Jane Smith"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#6366F1"}
                  onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4l6 5 6-5M2 4h12v9H2V4z" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#6366F1"}
                  onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="#94A3B8" strokeWidth="1.4" />
                    <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => e.target.style.borderColor = "#6366F1"}
                  onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", padding: 4,
                    color: "#94A3B8", display: "flex", alignItems: "center",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8z" stroke="#94A3B8" strokeWidth="1.4" />
                      <circle cx="8" cy="8" r="1.8" stroke="#94A3B8" strokeWidth="1.4" />
                      <line x1="3" y1="3" x2="13" y2="13" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8z" stroke="#94A3B8" strokeWidth="1.4" />
                      <circle cx="8" cy="8" r="1.8" stroke="#94A3B8" strokeWidth="1.4" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Terms note */}
            <p style={{ fontSize: 12, color: "#94A3B8", margin: "-4px 0 0", lineHeight: 1.6 }}>
              By registering, you agree to our{" "}
              <a href="#" style={{ color: "#6366F1", textDecoration: "none", fontWeight: 500 }}>Terms of Service</a>
              {" "}and{" "}
              <a href="#" style={{ color: "#6366F1", textDecoration: "none", fontWeight: 500 }}>Privacy Policy</a>.
            </p>

            {/* Submit */}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "13px",
                background: "#6366F1",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "-0.2px",
                marginTop: 4,
                transition: "background 0.2s, transform 0.1s",
              }}
              onMouseEnter={e => e.target.style.background = "#4F46E5"}
              onMouseLeave={e => e.target.style.background = "#6366F1"}
              onMouseDown={e => e.target.style.transform = "scale(0.98)"}
              onMouseUp={e => e.target.style.transform = "scale(1)"}
            >
              Create account
            </button>

          </form>

          {/* Footer */}
          <p style={{ textAlign: "center", marginTop: 32, fontSize: 13, color: "#94A3B8" }}>
            Already have an account?{" "}
            <Link
              to="/"
              style={{ color: "#6366F1", fontWeight: 600, textDecoration: "none" }}
              onMouseEnter={e => e.target.style.textDecoration = "underline"}
              onMouseLeave={e => e.target.style.textDecoration = "none"}
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Register;