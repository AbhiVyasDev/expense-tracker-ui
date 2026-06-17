import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
    const token = await login(formData); // login() returns response.data = raw JWT string
    console.log("TOKEN:", token);        // verify it looks like a real JWT
    localStorage.setItem("token", token); // ✅ saves the actual JWT
    navigate("/dashboard");
  } catch (error) {
    console.error(error);
    alert("Login Failed");
  }
};

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── Left brand panel ── */}
      <div
        style={{
          width: "42%",
          background: "#0F172A",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Geometric background accent */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0.07,
          }}
          viewBox="0 0 400 700"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle
            cx="350"
            cy="120"
            r="280"
            stroke="#6366F1"
            strokeWidth="1.5"
          />
          <circle cx="350" cy="120" r="200" stroke="#6366F1" strokeWidth="1" />
          <circle cx="350" cy="120" r="120" stroke="#A5B4FC" strokeWidth="1" />
          <line
            x1="0"
            y1="700"
            x2="400"
            y2="0"
            stroke="#6366F1"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1="500"
            x2="300"
            y2="0"
            stroke="#6366F1"
            strokeWidth="0.5"
          />
        </svg>

        {/* Logo */}
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              background: "#6366F1",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              {/* Bar chart bars */}
              <rect
                x="4"
                y="15"
                width="4"
                height="5"
                rx="1"
                fill="white"
                opacity="0.5"
              />
              <rect
                x="10"
                y="11"
                width="4"
                height="9"
                rx="1"
                fill="white"
                opacity="0.7"
              />
              <rect x="16" y="7" width="4" height="13" rx="1" fill="white" />
              {/* Rising arrow */}
              <path
                d="M4 14 L18 5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity="0.9"
              />
              <path
                d="M14 4 L18 5 L17 9"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}
          >
            <span
              style={{
                color: "#F8FAFC",
                fontWeight: 800,
                fontSize: 17,
                letterSpacing: "-0.5px",
              }}
            >
              Expense
            </span>
            <span
              style={{
                color: "#6366F1",
                fontWeight: 600,
                fontSize: 10,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              Tracker
            </span>
          </div>
        </div>

        {/* Center copy */}
        <div style={{ position: "relative" }}>
          <p
            style={{
              color: "#6366F1",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Welcome back
          </p>
          <h1
            style={{
              color: "#F8FAFC",
              fontSize: 38,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-1px",
              margin: "0 0 20px",
            }}
          >
            Sign in to your
            <br />
            workspace
          </h1>
          <p
            style={{
              color: "#94A3B8",
              fontSize: 15,
              lineHeight: 1.7,
              margin: 0,
              maxWidth: 260,
            }}
          >
            Access your dashboard, manage your projects, and pick up right where
            you left off.
          </p>
        </div>

        {/* Bottom tagline */}
        <p
          style={{
            color: "#334155",
            fontSize: 13,
            position: "relative",
            margin: 0,
          }}
        >
          © 2026 YourBrand. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div
        style={{
          flex: 1,
          background: "#F8FAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 32px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#0F172A",
                margin: "0 0 8px",
                letterSpacing: "-0.5px",
              }}
            >
              Sign in
            </h2>
            <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>
              Enter your credentials to continue
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            {/* Email field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94A3B8",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 4l6 5 6-5M2 4h12v9H2V4z"
                      stroke="#94A3B8"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  onChange={handleChange}
                  required
                  style={{
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
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <label
                  style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}
                >
                  Password
                </label>
                <a
                  href="#"
                  style={{
                    fontSize: 12,
                    color: "#6366F1",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.textDecoration = "underline")
                  }
                  onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
                >
                  Forgot password?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94A3B8",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="3"
                      y="7"
                      width="10"
                      height="7"
                      rx="1.5"
                      stroke="#94A3B8"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M5.5 7V5a2.5 2.5 0 015 0v2"
                      stroke="#94A3B8"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 44px 12px 40px",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: 10,
                    fontSize: 14,
                    color: "#0F172A",
                    background: "#FFFFFF",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    color: "#94A3B8",
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8z"
                        stroke="#94A3B8"
                        strokeWidth="1.4"
                      />
                      <circle
                        cx="8"
                        cy="8"
                        r="1.8"
                        stroke="#94A3B8"
                        strokeWidth="1.4"
                      />
                      <line
                        x1="3"
                        y1="3"
                        x2="13"
                        y2="13"
                        stroke="#94A3B8"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8z"
                        stroke="#94A3B8"
                        strokeWidth="1.4"
                      />
                      <circle
                        cx="8"
                        cy="8"
                        r="1.8"
                        stroke="#94A3B8"
                        strokeWidth="1.4"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

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
              onMouseEnter={(e) => (e.target.style.background = "#4F46E5")}
              onMouseLeave={(e) => (e.target.style.background = "#6366F1")}
              onMouseDown={(e) => (e.target.style.transform = "scale(0.98)")}
              onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
            >
              Sign in
            </button>
          </form>

          {/* Footer */}
          <p
            style={{
              textAlign: "center",
              marginTop: 32,
              fontSize: 13,
              color: "#94A3B8",
            }}
          >
            Don't have an account?{" "}
            <a
              href="/register"
              style={{
                color: "#6366F1",
                fontWeight: 600,
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                (e.target.style.textDecoration = "underline")
              }
              onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
            >
              Register Now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
