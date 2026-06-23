import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useSocket } from "../hooks/useSocket";
import api from "../utils/api";
import CubicleCard from "../components/CubicleCard";
import ChangePasswordModal from "../components/ChangePasswordModal";

export default function LiveDashboardPage() {
  const { sessionId } = useParams();
  const { apc, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [cubicles, setCubicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [endingSession, setEndingSession] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const r = await api.get(`/session/${sessionId}/dashboard`);
      setSession(r.data.session);
      setStudents(r.data.students);
      setCubicles(r.data.cubicles);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleQueueUpdate = useCallback(
    (data) => {
      setCubicles((prev) =>
        prev.map((c) =>
          c.id === data.cubicleId ? { ...c, queue: data.queue } : c,
        ),
      );
      setLastUpdate(new Date());
      api
        .get(`/session/${sessionId}/students`)
        .then((r) => setStudents(r.data.students))
        .catch(() => {});
    },
    [sessionId],
  );

  useSocket(sessionId, handleQueueUpdate);

  const handleEndSession = async () => {
    if (!window.confirm("End this session? This will mark it as closed."))
      return;
    setEndingSession(true);
    try {
      await api.post(`/session/${sessionId}/close`);
      toast.success("Session ended");
      navigate("/dashboard");
    } catch {
      toast.error("Failed to end session");
    } finally {
      setEndingSession(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const total = students.length;
  const assigned = students.filter((s) => s.cubicle_id).length;
  const inProgress = students.filter(
    (s) => s.queue_status === "in_progress",
  ).length;
  const done = students.filter((s) => s.queue_status === "done").length;
  const waiting = assigned - inProgress - done;
  const joinLink = `${window.location.origin}/session/${sessionId}/join`;

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            className="spinner"
            style={{ width: 32, height: 32, margin: "0 auto 12px" }}
          />
          <p style={{ color: "var(--text-3)", fontSize: 14 }}>
            Loading dashboard…
          </p>
        </div>
      </div>
    );

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.navLeft}>
            <div style={s.logo}>
              <span style={s.logoText}>InterviewFlow</span>
            </div>
            <div style={s.divider} />
            {session && (
              <div style={s.sessionInfo}>
                <span style={s.sessionName}>{session.title}</span>
                <div className="badge badge-active" style={{ fontSize: 11 }}>
                  <span className="dot dot-pulse" /> Live
                </div>
              </div>
            )}
          </div>
          <div style={s.navRight}>
            {lastUpdate && (
              <span style={s.updateTime}>
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <span style={s.apcName}>{apc?.name}</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowPasswordModal(true)}
            >
              🔐
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate("/dashboard")}
            >
              ← Sessions
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Sign out
            </button>
            {session?.status === "active" && (
              <button
                className="btn btn-danger btn-sm"
                onClick={handleEndSession}
                disabled={endingSession}
              >
                {endingSession ? (
                  <span className="spinner" style={{ width: 12, height: 12 }} />
                ) : (
                  "End Session"
                )}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ✅ FIXED: Added closing brace below */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

      <div style={s.content}>
        <div style={s.statsBar}>
          {[
            ["Total", total, "var(--text-1)"],
            ["Assigned", assigned, "var(--accent)"],
            ["Interviewing", inProgress, "var(--green)"],
            ["Waiting", waiting, "var(--amber)"],
            ["Done", done, "var(--teal)"],
          ].map(([label, val, color]) => (
            <div key={label} className="card" style={s.stat}>
              <span style={{ fontSize: 22, fontWeight: 800, color }}>
                {val}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                {label}
              </span>
            </div>
          ))}
          <div className="card" style={{ ...s.stat, flex: 2 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                gap: 8,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-4)",
                    marginBottom: 3,
                  }}
                >
                  Student link
                </p>
                <span
                  className="mono"
                  style={{ fontSize: 11, color: "var(--accent)" }}
                >
                  {joinLink.replace("http://", "")}
                </span>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(joinLink);
                  toast.success("Copied!");
                }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        <div style={s.mainHeader}>
          <h2 style={s.h2}>Cubicles</h2>
          <button className="btn btn-ghost btn-sm" onClick={loadDashboard}>
            ↻ Refresh
          </button>
        </div>

        {cubicles.length === 0 ? (
          <div className="card" style={s.empty}>
            <p style={{ color: "var(--text-3)", marginBottom: 16 }}>
              No cubicles configured yet
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate(`/session/${sessionId}/setup`)}
            >
              Go to setup →
            </button>
          </div>
        ) : (
          <div style={s.grid}>
            {cubicles.map((c, i) => (
              <div
                key={c.id}
                style={{ animation: `fadeIn 0.3s ease ${i * 0.05}s both` }}
              >
                <CubicleCard
                  cubicle={c}
                  students={students}
                  onAssigned={loadDashboard}
                  onMarkedDone={loadDashboard}
                />
              </div>
            ))}
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
    maxWidth: 1400,
    margin: "0 auto",
    padding: "0 32px",
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flex: 1,
    overflow: "hidden",
  },
  logo: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  logoIcon: {
    width: 26,
    height: 26,
    background: "var(--accent)",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 11,
    color: "#fff",
  },
  logoText: { fontWeight: 700, fontSize: 14 },
  divider: {
    width: 1,
    height: 20,
    background: "var(--border-2)",
    flexShrink: 0,
  },
  sessionInfo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
  },
  sessionName: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--text-1)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  navRight: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  apcName: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-2)",
    paddingRight: 10,
    borderRight: "1px solid var(--border-2)",
  },
  updateTime: { fontSize: 11, color: "var(--text-4)" },
  content: { maxWidth: 1400, margin: "0 auto", padding: "28px 32px" },
  statsBar: { display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" },
  stat: {
    padding: "14px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 3,
    flex: 1,
    minWidth: 100,
  },
  mainHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  h2: { fontSize: 18, fontWeight: 700 },
  empty: { padding: 40, textAlign: "center" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 14,
  },
};
