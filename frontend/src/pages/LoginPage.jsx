import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [apcs, setApcs] = useState([]);
  const [selectedApc, setSelectedApc] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingApcs, setLoadingApcs] = useState(true);
  const [mode, setMode] = useState("login");
  const [resetDone, setResetDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    api
      .get("/auth/apc-list")
      .then((r) => setApcs(r.data.apcs || []))
      .catch(() => setApcs([]))
      .finally(() => setLoadingApcs(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApc) {
      toast.error("Please select your name");
      return;
    }
    setLoading(true);
    try {
      const apc = apcs.find((a) => a.id === parseInt(selectedApc));
      await login(apc.email, password);
      toast.success(`Welcome back, ${apc.name}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!selectedApc) {
      toast.error("Please select your name first");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { apcId: selectedApc });
      setResetDone(true);
      toast.success("Password reset to default!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Decorative Grid Overlay & Light Blobs */}
      <div style={s.gridBg} />
      <div style={s.glowBlob} />
      <div style={s.glowBlob2} />

      <div style={s.container}>
        {/* Unified Top Branding with Modern Double-Chevron Flow Logo */}
        <div style={s.brandHeader} onClick={() => navigate("/")}>
          <div style={s.logoContainer}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="34" height="34" fill="none">
              <defs>
                <linearGradient id="logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c6bff" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
                <linearGradient id="logo-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#22d3a0" />
                </linearGradient>
              </defs>
              <path d="M5 4l7 8-7 8" stroke="url(#logo-grad-1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 2px 6px rgba(124, 107, 255, 0.35))" }} />
              <path d="M12 4l7 8-7 8" stroke="url(#logo-grad-2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 2px 6px rgba(56, 189, 248, 0.35))" }} />
            </svg>
          </div>
          <h1 style={s.brandTitle}>InterviewFlow</h1>
          <p style={s.brandSubtitle}>Interview Operations Platform</p>
        </div>

        {/* Centralized Login Card */}
        <div style={s.card} className="card glass grad-border animate-scale">
          {mode === "login" ? (
            <>
              <div style={s.cardHeader}>
                <h2 style={s.title}>Sign in to Dashboard</h2>
                <p style={s.subtitle}>
                  Choose your coordinator profile and enter your access password
                </p>
              </div>
              <form onSubmit={handleSubmit} style={s.form}>
                <div>
                  <label>APC PROFILE</label>
                  {loadingApcs ? (
                    <div
                      className="skeleton"
                      style={{ height: 46, borderRadius: 10 }}
                    />
                  ) : (
                    <select
                      className="input input-lg"
                      value={selectedApc}
                      onChange={(e) => setSelectedApc(e.target.value)}
                      required
                      style={s.selectField}
                    >
                      <option value="">Select your APC name…</option>
                      {apcs.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label>PASSWORD</label>
                    <button
                      type="button"
                      style={s.forgotLinkSmall}
                      onClick={() => setMode("forgot")}
                    >
                      Forgot?
                    </button>
                  </div>
                  <div style={{ position: "relative" }}>
                    <input
                      className="input input-lg"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      style={{ paddingRight: 48 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={s.eyeButton}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)' }}>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)' }}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div style={s.noticeBox}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span style={s.noticeText}>To test, select any APC profile & use password <strong style={{ color: "var(--text-1)", fontFamily: "var(--mono)" }}>admin123</strong></span>
                </div>

                <button
                  className="btn btn-primary btn-lg"
                  type="submit"
                  disabled={loading}
                  style={{ width: "100%", marginTop: 8 }}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner"
                        style={{ width: 16, height: 16 }}
                      />{" "}
                      Signing in…
                    </>
                  ) : (
                    "Sign in to dashboard"
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={s.cardHeader}>
                <h2 style={s.title}>Reset Password</h2>
                <p style={s.subtitle}>
                  Select your name to reset your coordinator profile password to default
                </p>
              </div>
              {resetDone ? (
                <div style={{ textAlign: "center", padding: "12px 0 0" }}>
                  <div style={s.resetSuccessIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--green)" }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h3
                    style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, color: "var(--text-1)" }}
                  >
                    Password reset successfully!
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-3)",
                      marginBottom: 20,
                      lineHeight: 1.5
                    }}
                  >
                    Your coordinator profile credentials have been restored.
                  </p>
                  <div style={s.resetDoneBox}>
                    <span style={{ color: "var(--text-3)", fontSize: 12 }}>
                      New password:
                    </span>
                    <span
                      className="mono"
                      style={{
                        color: "var(--green)",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      admin123
                    </span>
                  </div>
                  <button
                    className="btn btn-primary btn-lg"
                    style={{ marginTop: 24, width: "100%" }}
                    onClick={() => {
                      setMode("login");
                      setResetDone(false);
                      setPassword("");
                    }}
                  >
                    Back to sign in →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} style={s.form}>
                  <div>
                    <label>YOUR NAME</label>
                    {loadingApcs ? (
                      <div
                        className="skeleton"
                        style={{ height: 46, borderRadius: 10 }}
                      />
                    ) : (
                      <select
                        className="input input-lg"
                        value={selectedApc}
                        onChange={(e) => setSelectedApc(e.target.value)}
                        required
                        style={s.selectField}
                      >
                        <option value="">Select your name…</option>
                        {apcs.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="alert alert-info" style={{ fontSize: 13, display: "flex", gap: 10, alignItems: "center" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span>
                      Password will be reset to <strong className="mono" style={{ color: "var(--text-1)" }}>admin123</strong>. Change it after login.
                    </span>
                  </div>
                  <button
                    className="btn btn-primary btn-lg"
                    type="submit"
                    disabled={loading || !selectedApc}
                    style={{ width: "100%", marginTop: 8 }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner"
                          style={{ width: 16, height: 16 }}
                        />{" "}
                        Resetting…
                      </>
                    ) : (
                      "Reset my password"
                    )}
                  </button>
                  <button
                    type="button"
                    style={s.backToSignInButton}
                    onClick={() => setMode("login")}
                  >
                    ← Cancel and back to sign in
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Minimal Feature List Footer */}
        <div style={s.featureFooter}>
          <span style={s.featureItem}>Real-time Queue Management</span>
          <span style={s.featureDot}>•</span>
          <span style={s.featureItem}>Excel Import</span>
          <span style={s.featureDot}>•</span>
          <span style={s.featureItem}>Live Occupancy</span>
          <span style={s.featureDot}>•</span>
          <span style={s.featureItem}>WebSocket Sync</span>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    background: "#060609",
    padding: "40px 20px",
  },
  gridBg: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
    `,
    backgroundSize: "45px 45px",
    backgroundPosition: "center center",
    pointerEvents: "none",
    maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 40%, transparent 100%)",
    WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 40%, transparent 100%)",
  },
  glowBlob: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(124,107,255,0.06) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  glowBlob2: {
    position: "absolute",
    top: "30%",
    left: "40%",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(34,211,160,0.02) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    width: "100%",
    maxWidth: "460px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 1,
  },
  brandHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
    cursor: "pointer",
    textAlign: "center",
  },
  logoContainer: {
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--accent)",
  },
  brandTitle: {
    fontWeight: 800,
    fontSize: 26,
    letterSpacing: "-0.02em",
    color: "var(--text-1)",
    lineHeight: 1.1,
  },
  brandSubtitle: {
    color: "var(--text-3)",
    fontSize: 12.5,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  card: {
    width: "100%",
    padding: "44px 40px",
    borderRadius: 22,
    boxShadow: "0 30px 60px rgba(0, 0, 0, 0.45)",
    background: "rgba(13,13,20,0.7)",
    backdropFilter: "blur(24px)",
    border: "1px solid var(--border-2)",
  },
  cardHeader: {
    marginBottom: 28,
    textAlign: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    marginBottom: 8,
    color: "var(--text-1)",
  },
  subtitle: {
    fontSize: 13.5,
    color: "var(--text-3)",
    lineHeight: 1.5,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  selectField: {
    background: "var(--bg-3)",
  },
  forgotLinkSmall: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--accent)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0 0 6px 0",
    transition: "color 0.2s ease, opacity 0.2s",
    opacity: 0.85,
  },
  eyeButton: {
    position: "absolute",
    right: 4,
    top: "50%",
    transform: "translateY(-50%)",
    width: 38,
    height: 38,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    borderRadius: "50%",
    transition: "background-color 0.2s",
  },
  noticeBox: {
    display: "flex",
    gap: 10,
    padding: "12px 14px",
    background: "var(--accent-dim)",
    border: "1px solid rgba(124, 107, 255, 0.15)",
    borderRadius: 10,
    fontSize: 12.5,
    lineHeight: 1.45,
    color: "var(--text-2)",
  },
  noticeText: {
    color: "var(--text-2)",
  },
  backToSignInButton: {
    fontSize: 13,
    color: "var(--text-3)",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "center",
    padding: "8px 0 0",
    transition: "color 0.2s ease",
  },
  resetSuccessIcon: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "var(--green-dim)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    boxShadow: "0 0 20px rgba(34,211,160,0.1)",
  },
  resetDoneBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "var(--bg-3)",
    border: "1px solid var(--border-1)",
    borderRadius: 10,
    padding: "12px 16px",
    marginTop: 16,
  },
  featureFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 32,
    opacity: 0.4,
    transition: "opacity 0.2s ease",
    ":hover": {
      opacity: 0.75
    }
  },
  featureItem: {
    fontSize: 12,
    color: "var(--text-2)",
    fontWeight: 500,
  },
  featureDot: {
    fontSize: 10,
    color: "var(--text-4)",
  }
};
