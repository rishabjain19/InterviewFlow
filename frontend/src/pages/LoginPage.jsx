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
      <div style={s.bg1} />
      <div style={s.bg2} />
      <div style={s.left} className="hide-mobile">
        <div style={s.brand} onClick={() => navigate("/")}>
          <div style={s.logoIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span style={s.logoText}>InterviewFlow</span>
        </div>
        <div style={s.leftContent}>
          <span style={s.leftEyebrow}>Interview Operations Platform</span>
          <h2 style={s.leftTitle}>Manage your campus drives with precision</h2>
          <p style={s.leftSubtitle}>
            Coordinate APC workflows, candidate movement, and live queue updates from
            one streamlined, real-time dashboard.
          </p>
          <div style={s.features}>
            {[
              "Real-time queue management & ordering",
              "Bulk student import from Excel templates",
              "Live interview cubicle occupancy tracking",
              "Instant room alerts driven by WebSockets",
            ].map((f) => (
              <div key={f} style={s.featureItem}>
                <span style={s.featureCheck}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span style={s.featureText}>{f}</span>
              </div>
            ))}
          </div>

          <div style={s.mockCard} className="card glass">
            <div style={s.mockHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="dot dot-pulse" style={{ background: 'var(--green)', width: 8, height: 8 }} />
                <span style={s.mockHeaderTitle}>Live Coordinator Stream</span>
              </div>
              <span style={s.mockHeaderBadge}>Session: Active</span>
            </div>
            <div style={s.mockBody}>
              <div style={s.mockRow}>
                <span style={s.mockLabel}>Cubicle 1 (Tech)</span>
                <span style={s.mockStudent}>Aarav Mehta</span>
                <span className="badge badge-active" style={{ fontSize: 10, padding: "2px 8px" }}>Interviewing</span>
              </div>
              <div style={s.mockRow}>
                <span style={s.mockLabel}>Cubicle 2 (Tech)</span>
                <span style={s.mockStudent}>Sneha Roy</span>
                <span className="badge badge-active" style={{ fontSize: 10, padding: "2px 8px" }}>Interviewing</span>
              </div>
              <div style={s.mockRow}>
                <span style={s.mockLabel}>Cubicle 3 (HR)</span>
                <span style={s.mockStudent}>Rohan Sharma</span>
                <span className="badge badge-waiting" style={{ fontSize: 10, padding: "2px 8px" }}>Up Next</span>
              </div>
            </div>
            <div style={s.mockFooter}>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Queue Sync • Real-Time WebSockets</span>
            </div>
          </div>
        </div>
      </div>

      <div style={s.right}>
        {/* Mobile Header */}
        <div style={s.mobileBrand} className="show-mobile-flex" onClick={() => navigate("/")}>
          <div style={s.logoIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span style={s.logoText}>InterviewFlow</span>
        </div>

        <div style={s.card} className="card glass grad-border animate-scale">
          {mode === "login" ? (
            <>
              <div style={s.cardHeader}>
                <h1 style={s.title}>Sign in to Dashboard</h1>
                <p style={s.subtitle}>
                  Select your coordinator profile and enter your access password
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
                  <span style={s.noticeText}>To test login, select any APC profile & use password <strong style={{ color: "var(--text-1)", fontFamily: "var(--mono)" }}>admin123</strong></span>
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
                <h1 style={s.title}>Reset Password</h1>
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
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexWrap: "wrap",
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(180deg, rgba(6,6,9,0.98) 0%, rgba(10,10,16,1) 100%)",
  },
  bg1: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(circle 900px at 0% 0%, rgba(124,107,255,0.09) 0%, transparent 100%)",
    pointerEvents: "none",
  },
  bg2: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(circle 800px at 100% 100%, rgba(34,211,160,0.04) 0%, transparent 100%)",
    pointerEvents: "none",
  },
  left: {
    flex: "1 1 540px",
    display: "flex",
    flexDirection: "column",
    padding: "50px 60px",
    background: "rgba(13, 13, 20, 0.4)",
    borderRight: "1px solid var(--border-1)",
    position: "relative",
    zIndex: 1,
    backdropFilter: "blur(4px)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: "auto",
    cursor: "pointer",
    width: "fit-content",
  },
  logoIcon: {
    width: 32,
    height: 32,
    background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    boxShadow: "0 0 16px var(--accent-glow)",
  },
  logoText: {
    fontWeight: 700,
    fontSize: 19,
    letterSpacing: "-0.015em",
    color: "var(--text-1)",
  },
  leftContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    maxWidth: 480,
    padding: "40px 0",
  },
  leftEyebrow: {
    display: "inline-flex",
    marginBottom: 16,
    color: "var(--accent)",
    fontSize: 11.5,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  leftTitle: {
    fontSize: "clamp(26px, 3vw, 36px)",
    fontWeight: 800,
    letterSpacing: "-0.025em",
    marginBottom: 16,
    color: "var(--text-1)",
    lineHeight: 1.2,
  },
  leftSubtitle: {
    color: "var(--text-2)",
    fontSize: 15.5,
    lineHeight: 1.6,
    marginBottom: 32,
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
    marginBottom: 40,
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  featureCheck: {
    width: 20,
    height: 20,
    borderRadius: 6,
    background: "var(--green-dim)",
    color: "var(--green)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 0 10px rgba(34,211,160,0.05)",
  },
  featureText: {
    fontSize: 14.5,
    color: "var(--text-2)",
    fontWeight: 500,
  },
  mockCard: {
    background: "rgba(18, 18, 28, 0.45)",
    border: "1px solid var(--border-1)",
    borderRadius: 14,
    padding: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    width: "100%",
  },
  mockHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid var(--border-1)",
    paddingBottom: 12,
    marginBottom: 12,
  },
  mockHeaderTitle: {
    fontSize: 12.5,
    fontWeight: 600,
    color: "var(--text-1)",
  },
  mockHeaderBadge: {
    fontSize: 10.5,
    color: "var(--text-3)",
    background: "var(--bg-3)",
    padding: "2px 8px",
    borderRadius: 99,
    border: "1px solid var(--border-1)",
  },
  mockBody: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  mockRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 12.5,
    padding: "4px 0",
  },
  mockLabel: {
    color: "var(--text-3)",
    fontWeight: 500,
    width: "110px",
  },
  mockStudent: {
    color: "var(--text-2)",
    fontWeight: 600,
    marginRight: "auto",
    paddingLeft: 8,
  },
  mockFooter: {
    borderTop: "1px solid var(--border-1)",
    paddingTop: 10,
    marginTop: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  right: {
    flex: "1 1 420px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 30px",
    position: "relative",
    zIndex: 1,
  },
  mobileBrand: {
    alignItems: "center",
    gap: 10,
    marginBottom: 32,
    cursor: "pointer",
    display: "none",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    padding: "44px 40px",
    borderRadius: 20,
    height: "fit-content",
    minHeight: "auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
    background: "rgba(13,13,20,0.65)",
    backdropFilter: "blur(24px)",
    border: "1px solid var(--border-2)",
  },
  cardHeader: {
    marginBottom: 26,
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    letterSpacing: "-0.025em",
    marginBottom: 8,
    lineHeight: 1.15,
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
};
