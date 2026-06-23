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
      <div style={s.left}>
        <div style={s.brand} onClick={() => navigate("/")}>
          <span style={s.logoText}>InterviewFlow</span>
        </div>
        <div style={s.leftContent}>
          <span style={s.leftEyebrow}>Interview Operations Platform</span>
          <h2 style={s.leftTitle}>Manage your campus drives with precision</h2>
          <p style={s.leftSubtitle}>
            Coordinate APC workflows, candidate movement, and live updates from
            one streamlined dashboard.
          </p>
          <div style={s.features}>
            {[
              "Real-time queue management",
              "Bulk student import from Excel",
              "Live cubicle occupancy tracking",
              "Drag to reorder queue priority",
            ].map((f) => (
              <div key={f} style={s.featureItem}>
                <span style={s.featureCheck}></span>
                <span style={s.featureText}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.card} className="card glass grad-border animate-scale">
          {mode === "login" ? (
            <>
              <div style={s.cardHeader}>
                <h1 style={s.title}>Sign in to InterviewFlow</h1>
                <p style={s.subtitle}>
                  Select your APC profile and enter your password
                </p>
              </div>
              <form onSubmit={handleSubmit} style={s.form}>
                <div>
                  <label>APC profile</label>
                  {loadingApcs ? (
                    <div
                      className="skeleton"
                      style={{ height: 42, borderRadius: 10 }}
                    />
                  ) : (
                    <select
                      className="input input-lg"
                      value={selectedApc}
                      onChange={(e) => setSelectedApc(e.target.value)}
                      required
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
                  <label>Password</label>
                  <input
                    className="input input-lg"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  type="submit"
                  disabled={loading}
                  style={{ width: "100%", marginTop: 4 }}
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
                <button
                  type="button"
                  style={s.forgotLink}
                  onClick={() => setMode("forgot")}
                >
                  Forgot password?
                </button>
              </form>
              <div style={s.hint}>
                <span style={{ color: "var(--text-4)", fontSize: 12 }}>
                  Default password
                </span>
                <span
                  className="mono"
                  style={{ color: "var(--accent)", fontSize: 12 }}
                >
                  admin123
                </span>
              </div>
            </>
          ) : (
            <>
              <div style={s.cardHeader}>
                <h1 style={s.title}>Reset password</h1>
                <p style={s.subtitle}>
                  This will reset your password back to the default
                </p>
              </div>
              {resetDone ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                  <h3
                    style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}
                  >
                    Password reset!
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-3)",
                      marginBottom: 24,
                    }}
                  >
                    Your password has been reset to the default.
                  </p>
                  <div style={s.hint}>
                    <span style={{ color: "var(--text-4)", fontSize: 12 }}>
                      New password:
                    </span>
                    <span
                      className="mono"
                      style={{
                        color: "var(--green)",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      admin123
                    </span>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: 20, width: "100%" }}
                    onClick={() => {
                      setMode("login");
                      setResetDone(false);
                      setPassword("");
                    }}
                  >
                    Go to sign in →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} style={s.form}>
                  <div>
                    <label>Your name</label>
                    {loadingApcs ? (
                      <div
                        className="skeleton"
                        style={{ height: 42, borderRadius: 10 }}
                      />
                    ) : (
                      <select
                        className="input input-lg"
                        value={selectedApc}
                        onChange={(e) => setSelectedApc(e.target.value)}
                        required
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
                  <div className="alert alert-info" style={{ fontSize: 13 }}>
                    Your password will be reset to{" "}
                    <span className="mono" style={{ color: "var(--accent)" }}>
                      admin123
                    </span>
                    . You can change it after logging in.
                  </div>
                  <button
                    className="btn btn-primary btn-lg"
                    type="submit"
                    disabled={loading || !selectedApc}
                    style={{ width: "100%" }}
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
                    style={s.forgotLink}
                    onClick={() => setMode("login")}
                  >
                    ← Back to sign in
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
    background:
      "linear-gradient(180deg, rgba(6,6,9,0.96) 0%, rgba(10,10,16,1) 100%)",
  },
  bg1: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(ellipse 70% 50% at 20% 50%, rgba(124,107,255,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  bg2: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(ellipse 50% 50% at 80% 50%, rgba(34,211,160,0.04) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  left: {
    flex: "1 1 620px",
    display: "flex",
    flexDirection: "column",
    padding: "40px 48px",
    background: "var(--bg-1)",
    borderRight: "1px solid var(--border-1)",
    position: "relative",
    zIndex: 1,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: "auto",
    cursor: "pointer",
  },
  logoIcon: {
    width: 36,
    height: 36,
    background: "var(--accent)",
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 14,
    color: "#fff",
  },
  logoText: { fontWeight: 700, fontSize: 18 },
  leftContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    maxWidth: 500,
  },
  leftEyebrow: {
    display: "inline-flex",
    marginBottom: 14,
    color: "var(--accent)",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  leftTitle: {
    fontSize: "clamp(22px, 2.5vw, 32px)",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    marginBottom: 14,
    color: "var(--text-1)",
    lineHeight: 1.25,
  },
  leftSubtitle: {
    color: "var(--text-3)",
    fontSize: 15,
    lineHeight: 1.7,
    marginBottom: 28,
    maxWidth: 470,
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginBottom: 0,
  },
  featureItem: { display: "flex", alignItems: "center", gap: 14 },
  featureCheck: {
    width: 22,
    height: 22,
    borderRadius: 6,
    background: "var(--green-dim)",
    color: "var(--green)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    flexShrink: 0,
  },
  featureText: { fontSize: 15, color: "var(--text-2)" },
  right: {
    flex: "1 1 420px",
    maxWidth: 560,
    display: "flex",
    alignItems: "stretch",
    justifyContent: "center",
    padding: "24px 40px",
    position: "relative",
    zIndex: 1,
  },
  card: {
    width: "100%",
    padding: "40px 36px 34px",
    borderRadius: 20,
    minHeight: "calc(100vh - 48px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    boxShadow: "0 24px 48px rgba(0, 0, 0, 0.35)",
  },
  cardHeader: { marginBottom: 28 },
  title: {
    fontSize: 38,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    marginBottom: 8,
    lineHeight: 1.12,
  },
  subtitle: { fontSize: 14, color: "var(--text-3)", lineHeight: 1.6 },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  forgotLink: {
    fontSize: 13,
    color: "var(--text-2)",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "center",
    textDecoration: "none",
    padding: "6px 0 2px",
    transition: "color 0.2s ease",
  },
  hint: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 20,
    borderTop: "1px solid var(--border-1)",
  },
};
