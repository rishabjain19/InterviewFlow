import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={s.page}>
      <nav style={{ ...s.nav, ...(scrolled ? s.navScrolled : {}) }}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <span style={s.logoText}>InterviewFlow</span>
          </div>
          <div style={s.navLinks}>
            <a href="#features" style={s.navLink}>
              Features
            </a>
            <a href="#how" style={s.navLink}>
              How it works
            </a>
            <a href="#roles" style={s.navLink}>
              Roles
            </a>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/login")}
          >
            Sign in →
          </button>
        </div>
      </nav>

      <section style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroGlow1} />
        <div style={s.heroGlow2} />
        <div style={s.heroContent}>
          <div
            className="badge badge-accent"
            style={{ marginBottom: 24, animation: "fadeIn 0.5s ease" }}
          >
            <span className="dot dot-pulse" /> Campus Drive Management Platform
          </div>
          <h1 style={s.heroTitle}>
            Run interview drives
            <br />
            <span className="grad-text">without the chaos</span>
          </h1>
          <p style={s.heroSub}>
            Assign students to cubicles, manage queues in real time, and notify
            via WhatsApp — all from one dashboard. Built for APCs who run
            multiple interviews in parallel.
          </p>
          <div style={s.heroCtas}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate("/login")}
            >
              Start a drive →
            </button>
            <a href="#how" className="btn btn-ghost btn-lg">
              See how it works
            </a>
          </div>
          <div style={s.heroStats}>
            {[
              ["Real-time", "Queue updates via WebSocket"],
              ["Zero refresh", "Students see live position"],
              ["Session link", "Students join with roll number"],
            ].map(([t, d]) => (
              <div key={t} style={s.heroStat}>
                <span style={s.heroStatTitle}>{t}</span>
                <span style={s.heroStatDesc}>{d}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={s.heroVisual}>
          <div style={s.dashPreview} className="card">
            <div style={s.dashHeader}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#f87171", "#f59e0b", "#22d3a0"].map((c) => (
                  <div
                    key={c}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: c,
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                InterviewFlow — APC Dashboard
              </span>
              <div style={s.liveDot}>
                <span
                  className="dot dot-pulse"
                  style={{ background: "var(--green)" }}
                />
                Live
              </div>
            </div>
            <div style={s.dashBody}>
              {["Cubicle A", "Cubicle B", "Cubicle C"].map((name, ci) => (
                <div key={name} style={s.miniCubicle}>
                  <div style={s.miniCubicleHeader}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>
                      {name}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--green)" }}>
                      ● Active
                    </span>
                  </div>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        ...s.miniStudent,
                        opacity: i === 0 ? 1 : 0.5,
                        background:
                          i === 0 ? "var(--green-dim)" : "var(--bg-3)",
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: `hsl(${(ci * 3 + i) * 40},60%,40%)`,
                          fontSize: 9,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 600,
                          color: "#fff",
                        }}
                      >
                        S{ci * 3 + i + 1}
                      </div>
                      <span style={{ fontSize: 11 }}>
                        Student {ci * 3 + i + 1}
                      </span>
                      {i === 0 && (
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--green)",
                            marginLeft: "auto",
                          }}
                        >
                          NOW
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" style={s.section}>
        <div style={s.sectionInner}>
          <p style={s.eyebrow}>Features</p>
          <h2 style={s.sectionTitle}>Everything you need for a smooth drive</h2>
          <div style={s.featureGrid}>
            {features.map((f, i) => (
              <div
                key={i}
                className="card"
                style={{ ...s.featureCard, animationDelay: `${i * 0.08}s` }}
              >
                <div style={{ ...s.featureIcon, background: f.color }}>
                  {i + 1}
                </div>
                <h3 style={s.featureTitle}>{f.title}</h3>
                <p style={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" style={{ ...s.section, background: "var(--bg-1)" }}>
        <div style={s.sectionInner}>
          <p style={s.eyebrow}>How it works</p>
          <h2 style={s.sectionTitle}>Three phases, zero confusion</h2>
          <div style={s.stepsGrid}>
            {steps.map((step, i) => (
              <div key={i} style={s.step}>
                <div style={s.stepNum}>{String(i + 1).padStart(2, "0")}</div>
                <div style={s.stepLine} />
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
                <div style={s.stepTags}>
                  {step.tags.map((t) => (
                    <span
                      key={t}
                      className="badge badge-accent"
                      style={{ fontSize: 11 }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" style={s.section}>
        <div style={s.sectionInner}>
          <p style={s.eyebrow}>Two roles</p>
          <h2 style={s.sectionTitle}>
            Built for APC and student — nothing more
          </h2>
          <div style={s.rolesGrid}>
            <div className="card grad-border" style={s.roleCard}>
              <div style={s.roleIcon}></div>
              <h3 style={s.roleTitle}>APC</h3>
              <ul style={s.roleList}>
                {[
                  "Creates & manages drive sessions",
                  "Uploads student list via Excel",
                  "Assigns students to cubicles",
                  "Marks interviews done — queue auto-advances",
                  "Dashboard updates live across all devices",
                ].map((item) => (
                  <li key={item} style={s.roleItem}>
                    <span style={{ color: "var(--green)" }}></span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card" style={s.roleCard}>
              <div style={s.roleIcon}></div>
              <h3 style={s.roleTitle}>Student</h3>
              <ul style={s.roleList}>
                {[
                  "Opens unique session link — no signup needed",
                  "Enters roll number to verify identity",
                  "Sees assigned cubicle instantly",
                  "Watches queue position update in real time",
                  '"Interview complete" screen when done',
                ].map((item) => (
                  <li key={item} style={s.roleItem}>
                    <span style={{ color: "var(--accent)" }}></span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section style={s.cta}>
        <div style={s.ctaInner}>
          <div style={s.ctaGlow} />
          <h2 style={s.ctaTitle}>Ready to run your next drive?</h2>
          <p style={s.ctaSub}>
            Log in as APC and create a session in under 2 minutes.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/login")}
          >
            Get started →
          </button>
        </div>
      </section>

      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.logo}>
            <span style={s.logoText}>InterviewFlow</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-4)" }}>
            Campus interview drive management platform
          </p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "",
    color: "rgba(124,107,255,0.12)",
    title: "Real-time Queue",
    desc: "Socket.io pushes queue updates to every connected device instantly — no refresh needed.",
  },
  {
    icon: "",
    color: "rgba(34,211,160,0.12)",
    title: "Excel Upload",
    desc: "Upload your student list as .xlsx. Roll numbers, names, and phone numbers imported in seconds.",
  },
  {
    icon: "",
    color: "rgba(56,189,248,0.12)",
    title: "Cubicle Assignment",
    desc: "Assign students to cubicles from the dashboard. Queue position is calculated automatically.",
  },
  {
    icon: "",
    color: "rgba(167,139,250,0.12)",
    title: "Unique Session Link",
    desc: "Every drive gets a unique URL. Share it on the WhatsApp group — students join with roll number only.",
  },
  {
    icon: "",
    color: "rgba(245,158,11,0.12)",
    title: "Student View",
    desc: "Students open the link, enter their roll number, and see their cubicle and live queue position.",
  },
  {
    icon: "",
    color: "rgba(248,113,113,0.12)",
    title: "Live Stats",
    desc: "See total students, assigned, interviewing, and completed counts update in real time on the dashboard.",
  },
];

const steps = [
  {
    title: "Setup",
    desc: "APC creates a session, uploads the student Excel sheet, and sets the number of cubicles running in parallel.",
    tags: ["Excel Upload", "Cubicle Config"],
  },
  {
    title: "Go Live",
    desc: "APC shares the unique session link. Students open it, enter their roll number, and see their cubicle assignment immediately.",
    tags: ["Session Link", "Auto-verify"],
  },
  {
    title: "Queue Runs",
    desc: "APC marks each interview done. The queue advances automatically and every student's screen updates live.",
    tags: ["Socket.io", "Auto-advance"],
  },
];

const s = {
  page: { background: "var(--bg-0)", minHeight: "100vh" },
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: "0 24px",
    transition: "all 0.3s ease",
  },
  navScrolled: {
    background: "rgba(6,6,9,0.85)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid var(--border-1)",
  },
  navInner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: 32,
    height: 60,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
  },
  logoIcon: {
    width: 32,
    height: 32,
    background: "var(--accent)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 13,
    color: "#fff",
    letterSpacing: 1,
  },
  logoText: { fontWeight: 700, fontSize: 16, color: "var(--text-1)" },
  navLinks: { display: "flex", gap: 24, flex: 1, justifyContent: "center" },
  navLink: {
    fontSize: 14,
    color: "var(--text-2)",
    textDecoration: "none",
    transition: "color 0.15s",
  },
  hero: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 40,
    padding: "80px 24px 40px",
    maxWidth: 1200,
    margin: "0 auto",
    position: "relative",
  },
  heroBg: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,107,255,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  heroGlow1: {
    position: "absolute",
    top: "20%",
    left: "10%",
    width: 400,
    height: 400,
    background: "rgba(124,107,255,0.06)",
    borderRadius: "50%",
    filter: "blur(80px)",
    pointerEvents: "none",
  },
  heroGlow2: {
    position: "absolute",
    bottom: "20%",
    right: "10%",
    width: 300,
    height: 300,
    background: "rgba(34,211,160,0.05)",
    borderRadius: "50%",
    filter: "blur(60px)",
    pointerEvents: "none",
  },
  heroContent: {
    flex: 1,
    maxWidth: 580,
    position: "relative",
    zIndex: 1,
    animation: "fadeIn 0.6s ease",
  },
  heroTitle: {
    fontSize: "clamp(36px, 5vw, 60px)",
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
    marginBottom: 20,
    color: "var(--text-1)",
  },
  heroSub: {
    fontSize: 17,
    color: "var(--text-2)",
    lineHeight: 1.7,
    marginBottom: 36,
    maxWidth: 480,
  },
  heroCtas: { display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 },
  heroStats: {
    display: "flex",
    gap: 32,
    flexWrap: "wrap",
    paddingTop: 32,
    borderTop: "1px solid var(--border-1)",
  },
  heroStat: { display: "flex", flexDirection: "column", gap: 2 },
  heroStatTitle: { fontSize: 14, fontWeight: 600, color: "var(--text-1)" },
  heroStatDesc: { fontSize: 12, color: "var(--text-3)" },
  heroVisual: {
    flex: 1,
    maxWidth: 480,
    position: "relative",
    zIndex: 1,
    animation: "slideInRight 0.7s ease",
  },
  dashPreview: {
    padding: 0,
    overflow: "hidden",
    boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px var(--border-2)",
  },
  dashHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    borderBottom: "1px solid var(--border-1)",
    background: "var(--bg-3)",
  },
  liveDot: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    color: "var(--green)",
  },
  dashBody: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
    padding: 16,
  },
  miniCubicle: {
    background: "var(--bg-3)",
    borderRadius: 8,
    padding: 10,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  miniCubicleHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  miniStudent: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 8px",
    borderRadius: 5,
  },
  section: { padding: "96px 24px" },
  sectionInner: { maxWidth: 1200, margin: "0 auto" },
  eyebrow: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--accent)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: "clamp(24px, 3.5vw, 40px)",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    marginBottom: 56,
    color: "var(--text-1)",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 16,
  },
  featureCard: { padding: 28, animation: "fadeIn 0.4s ease both" },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 8,
    color: "var(--text-1)",
  },
  featureDesc: { fontSize: 14, color: "var(--text-3)", lineHeight: 1.65 },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 32,
  },
  step: { display: "flex", flexDirection: "column", gap: 12 },
  stepNum: {
    fontFamily: "var(--mono)",
    fontSize: 13,
    color: "var(--accent)",
    fontWeight: 500,
  },
  stepLine: {
    height: 2,
    width: 40,
    background: "linear-gradient(90deg, var(--accent), transparent)",
  },
  stepTitle: { fontSize: 20, fontWeight: 700, color: "var(--text-1)" },
  stepDesc: { fontSize: 14, color: "var(--text-3)", lineHeight: 1.65 },
  stepTags: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 },
  rolesGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  roleCard: { padding: 32 },
  roleIcon: { fontSize: 32, marginBottom: 16 },
  roleTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 20,
    color: "var(--text-1)",
  },
  roleList: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  roleItem: {
    fontSize: 14,
    color: "var(--text-2)",
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
  },
  cta: { padding: "96px 24px", position: "relative", overflow: "hidden" },
  ctaInner: {
    maxWidth: 600,
    margin: "0 auto",
    textAlign: "center",
    position: "relative",
  },
  ctaGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    width: 400,
    height: 200,
    background: "var(--accent-glow)",
    borderRadius: "50%",
    filter: "blur(60px)",
    pointerEvents: "none",
  },
  ctaTitle: {
    fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    marginBottom: 16,
    color: "var(--text-1)",
  },
  ctaSub: { fontSize: 16, color: "var(--text-2)", marginBottom: 32 },
  footer: { borderTop: "1px solid var(--border-1)", padding: "32px 24px" },
  footerInner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
};
