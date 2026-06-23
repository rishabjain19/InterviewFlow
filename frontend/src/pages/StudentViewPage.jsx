import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import api from "../utils/api";

export default function StudentViewPage() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(location.state?.studentData || null);
  const [loading, setLoading] = useState(!location.state?.studentData);
  const studentRef = useRef(null);

  useEffect(() => {
    if (!location.state?.studentData) {
      navigate(`/session/${sessionId}/join`, { replace: true });
      return;
    }
    studentRef.current = location.state.studentData.student;
  }, []);

  const handleQueueUpdate = useCallback((payload) => {
    if (!studentRef.current) return;
    const myId = studentRef.current.id;
    const myQueue = payload.queue.find((q) => q.student_id === myId);
    if (!myQueue) return;

    const peopleAhead = payload.queue.filter(
      (q) => q.status !== "done" && q.position < myQueue.position,
    ).length;

    setData((prev) => ({
      ...prev,
      status: myQueue.status,
      queueInfo: {
        ...prev?.queueInfo,
        status: myQueue.status,
        position: myQueue.position,
        people_ahead: peopleAhead,
        cubicle_label: prev?.student?.cubicleLabel,
      },
    }));
  }, []);

  useSocket(sessionId, handleQueueUpdate);

  if (loading || !data)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <span className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );

  const { student, status, queueInfo, sessionTitle } = data;

  return (
    <div style={s.page}>
      <div style={s.bg} />
      <div style={s.glow} />

      <div style={s.inner}>
        <div style={s.logoRow}>
          <span style={s.logoText}>InterviewFlow</span>
        </div>

        <p style={s.sessionLabel}>{sessionTitle}</p>
        <h1 style={s.greeting}>Hi, {student.name.split(" ")[0]}</h1>

        <div className="card animate-scale" style={s.card}>
          {status === "not_assigned" && <NotAssigned />}
          {status === "waiting" && (
            <Waiting queueInfo={queueInfo} student={student} />
          )}
          {status === "in_progress" && <InProgress student={student} />}
          {status === "done" && <Done />}
        </div>

        <div style={s.footer}>
          <span style={s.footerLabel}>Roll number</span>
          <span className="mono" style={s.footerValue}>
            {student.rollNo}
          </span>
        </div>
      </div>
    </div>
  );
}

function NotAssigned() {
  return (
    <div style={st.wrap}>
      <div style={st.iconWrap}>⏳</div>
      <h2 style={st.title}>You're checked in</h2>
      <p style={st.desc}>
        The APC hasn't assigned you to a cubicle yet. This page updates
        automatically — no need to refresh.
      </p>
      <div className="badge badge-waiting" style={{ marginTop: 16 }}>
        <span
          className="dot dot-pulse"
          style={{ background: "var(--amber)" }}
        />{" "}
        Waiting for assignment
      </div>
    </div>
  );
}

function Waiting({ queueInfo, student }) {
  const ahead = queueInfo?.people_ahead ?? 0;
  return (
    <div style={st.wrap}>
      <div style={st.cubicleBox}>
        <span style={st.cubicleName}>
          {student.cubicleLabel || queueInfo?.cubicle_label}
        </span>
        <span style={st.cubicleTag}>Your cubicle</span>
      </div>
      {ahead > 0 ? (
        <p style={st.desc}>
          {ahead === 1
            ? "1 person ahead of you."
            : `${ahead} people ahead of you.`}{" "}
          Updates live when interviews complete.
        </p>
      ) : (
        <p style={{ ...st.desc, color: "var(--amber)" }}>
          You're next! Get ready to go in.
        </p>
      )}
      <div className="badge badge-waiting" style={{ marginTop: 12 }}>
        <span
          className="dot dot-pulse"
          style={{ background: "var(--amber)" }}
        />{" "}
        Waiting
      </div>
    </div>
  );
}

function InProgress({ student }) {
  return (
    <div style={st.wrap}>
      <div style={st.cubicleBox}>
        <span style={st.cubicleName}>{student.cubicleLabel}</span>
        <span style={st.cubicleTag}>Your cubicle</span>
      </div>
      <div style={{ fontSize: 40, margin: "20px 0" }}></div>
      <h2 style={{ ...st.title, color: "var(--green)" }}>
        Your interview is live!
      </h2>
      <p style={st.desc}>Head to your cubicle now. Good luck!</p>
      <div className="badge badge-active" style={{ marginTop: 12 }}>
        <span className="dot dot-pulse" /> Interviewing now
      </div>
    </div>
  );
}

function Done() {
  return (
    <div style={st.wrap}>
      <div style={st.iconWrap}></div>
      <h2 style={st.title}>All done!</h2>
      <p style={st.desc}>
        Your interview is complete. The APC will be in touch with next steps.
      </p>
      <div className="badge badge-done" style={{ marginTop: 12 }}>
        Interview complete
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    position: "relative",
    overflow: "hidden",
    background: "var(--bg-0)",
  },
  bg: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,107,255,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  glow: {
    position: "absolute",
    top: "30%",
    left: "50%",
    transform: "translateX(-50%)",
    width: 400,
    height: 400,
    background: "rgba(124,107,255,0.04)",
    borderRadius: "50%",
    filter: "blur(80px)",
    pointerEvents: "none",
  },
  inner: {
    width: "100%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    position: "relative",
    zIndex: 1,
  },
  logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 32 },
  logo: {
    width: 32,
    height: 32,
    background: "linear-gradient(135deg, var(--accent), var(--teal))",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 13,
    color: "#fff",
  },
  logoText: { fontWeight: 700, fontSize: 16 },
  sessionLabel: {
    fontSize: 12,
    color: "var(--text-4)",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    marginBottom: 24,
  },
  card: { width: "100%", padding: 36 },
  footer: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginTop: 24,
    padding: "12px 16px",
    background: "var(--bg-2)",
    border: "1px solid var(--border-1)",
    borderRadius: 10,
  },
  footerLabel: { fontSize: 12, color: "var(--text-4)" },
  footerValue: { fontSize: 13, color: "var(--text-2)" },
};

const st = {
  wrap: { display: "flex", flexDirection: "column", alignItems: "center" },
  iconWrap: { fontSize: 44, marginBottom: 16 },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 10,
    letterSpacing: "-0.01em",
  },
  desc: {
    fontSize: 14,
    color: "var(--text-3)",
    lineHeight: 1.65,
    maxWidth: 280,
  },
  cubicleBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "var(--accent-dim)",
    border: "1px solid rgba(124,107,255,0.2)",
    borderRadius: 14,
    padding: "16px 40px",
    marginBottom: 24,
  },
  cubicleName: {
    fontSize: 40,
    fontWeight: 800,
    color: "var(--accent)",
    fontFamily: "var(--mono)",
    lineHeight: 1,
  },
  cubicleTag: { fontSize: 12, color: "var(--text-3)", marginTop: 4 },
};
