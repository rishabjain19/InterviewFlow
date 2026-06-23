import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";
import ChangePasswordModal from "../components/ChangePasswordModal";

export default function DashboardPage() {
  const { apc, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const r = await api.get("/session/my-sessions");
      setSessions(r.data.sessions);
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const r = await api.post("/session/create", { title: newTitle.trim() });
      toast.success("Session created!");
      navigate("/session/" + r.data.session.id + "/setup");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create session");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <span style={s.logoText}>InterviewFlow</span>
          </div>
          <div style={s.navRight}>
            <span style={s.apcName}>{apc?.name}</span>
            <span style={s.apcRole}>APC</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

      <div style={s.content}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.h1}>Drive Sessions</h1>
            <p style={s.lead}>Manage your campus interview drives</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() =>
              setShowForm(function (p) {
                return !p;
              })
            }
          >
            {showForm ? "Cancel" : "+ New Session"}
          </button>
        </div>

        {showForm && (
          <div className="card animate-in" style={s.formCard}>
            <form onSubmit={createSession} style={s.formRow}>
              <input
                className="input"
                style={{ flex: 1 }}
                placeholder="e.g. Amazon Drive February 2025"
                value={newTitle}
                onChange={function (e) {
                  setNewTitle(e.target.value);
                }}
                autoFocus
                required
              />
              <button
                className="btn btn-primary"
                type="submit"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div style={s.skeletonGrid}>
            {[1, 2, 3, 4].map(function (i) {
              return (
                <div
                  key={i}
                  className="skeleton"
                  style={{ height: 140, borderRadius: 14 }}
                />
              );
            })}
          </div>
        ) : sessions.length === 0 ? (
          <div className="card" style={s.empty}>
            <div style={{ fontSize: 40, marginBottom: 16 }}></div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              No sessions yet
            </h3>
            <p
              style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 24 }}
            >
              Create your first drive session to get started
            </p>
            <button
              className="btn btn-primary"
              onClick={function () {
                setShowForm(true);
              }}
            >
              Create session
            </button>
          </div>
        ) : (
          <div style={s.grid}>
            {sessions.map(function (sess, i) {
              return (
                <div
                  key={sess.id}
                  className="card"
                  style={{ ...s.sessionCard, animationDelay: i * 0.06 + "s" }}
                  onClick={function () {
                    navigate("/session/" + sess.id + "/live");
                  }}
                >
                  <div style={s.sessionTop}>
                    <span
                      className={
                        "badge " +
                        (sess.status === "active"
                          ? "badge-active"
                          : "badge-done")
                      }
                    >
                      <span className="dot" />{" "}
                      {sess.status === "active" ? "Active" : "Closed"}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-4)" }}>
                      {new Date(sess.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 style={s.sessionTitle}>{sess.title}</h3>
                  <div style={s.sessionFooter}>
                    <span
                      className="mono"
                      style={{ fontSize: 11, color: "var(--text-4)" }}
                    >
                      {sess.id.slice(0, 8)}...
                    </span>
                    <span style={{ fontSize: 13, color: "var(--accent)" }}>
                      Open
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "var(--bg-0)" },
  nav: {
    background: "var(--bg-1)",
    borderBottom: "1px solid var(--border-1)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  navInner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 32px",
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: {
    width: 28,
    height: 28,
    background: "var(--accent)",
    borderRadius: 7,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 12,
    color: "#fff",
  },
  logoText: { fontWeight: 700, fontSize: 15 },
  navRight: { display: "flex", alignItems: "center", gap: 12 },
  apcName: { fontSize: 14, fontWeight: 600, color: "var(--text-1)" },
  apcRole: {
    fontSize: 12,
    color: "var(--text-4)",
    paddingRight: 8,
    borderRight: "1px solid var(--border-2)",
  },
  content: { maxWidth: 1200, margin: "0 auto", padding: "40px 32px" },
  topbar: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 16,
  },
  h1: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    marginBottom: 4,
  },
  lead: { fontSize: 14, color: "var(--text-3)" },
  formCard: { padding: 16, marginBottom: 24 },
  formRow: { display: "flex", gap: 12 },
  skeletonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 14,
  },
  empty: { padding: 64, textAlign: "center", maxWidth: 400, margin: "0 auto" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 14,
  },
  sessionCard: {
    padding: 22,
    cursor: "pointer",
    animation: "fadeIn 0.3s ease both",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  sessionTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "var(--text-1)",
    lineHeight: 1.3,
    flex: 1,
  },
  sessionFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTop: "1px solid var(--border-1)",
  },
};
