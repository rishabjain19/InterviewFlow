import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";

export default function SessionSetupPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [session, setSession] = useState(null);
  const [step, setStep] = useState(1);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [cubicleCount, setCubicleCount] = useState(5);
  const [creatingCubicles, setCreatingCubicles] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    api
      .get(`/session/${sessionId}`)
      .then((r) => {
        setSession(r.data.session);
        if (r.data.hasCubicles) setStep(3);
        else if (r.data.hasStudents) setStep(2);
      })
      .catch(() => navigate("/dashboard"));
  }, [sessionId]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select an Excel file");
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", selectedFile);
    try {
      const r = await api.post(`/session/${sessionId}/upload-students`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadResult(r.data);
      toast.success(`${r.data.inserted} students uploaded!`);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateCubicles = async () => {
    setCreatingCubicles(true);
    try {
      await api.post(`/session/${sessionId}/create-cubicles`, {
        count: cubicleCount,
      });
      toast.success(`${cubicleCount} cubicles created!`);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create cubicles");
    } finally {
      setCreatingCubicles(false);
    }
  };

  const joinLink = `${window.location.origin}/session/${sessionId}/join`;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate("/dashboard")}
        >
          ← Back
        </button>
        {session && <h1 style={s.title}>{session.title}</h1>}
      </div>

      <div style={s.steps}>
        {["Upload Students", "Create Cubicles", "Share Link"].map(
          (label, i) => (
            <div key={i} style={s.stepItem}>
              <div
                style={{
                  ...s.stepDot,
                  background:
                    step > i + 1
                      ? "var(--green)"
                      : step === i + 1
                        ? "var(--accent)"
                        : "var(--bg-4)",
                  boxShadow:
                    step === i + 1 ? "0 0 16px var(--accent-glow)" : "none",
                }}
              >
                {step > i + 1 ? "" : i + 1}
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: step === i + 1 ? "var(--text-1)" : "var(--text-4)",
                  fontWeight: step === i + 1 ? 600 : 400,
                }}
              >
                {label}
              </span>
              {i < 2 && <div style={s.stepLine} />}
            </div>
          ),
        )}
      </div>

      <div style={s.content}>
        {step === 1 && (
          <div className="card animate-in" style={s.card}>
            <h2 style={s.cardTitle}>Upload student list</h2>
            <p style={s.cardDesc}>
              Excel file (.xlsx) with columns:{" "}
              <span className="mono" style={{ color: "var(--accent)" }}>
                roll_no
              </span>
              ,{" "}
              <span className="mono" style={{ color: "var(--accent)" }}>
                name
              </span>
              ,{" "}
              <span className="mono" style={{ color: "var(--accent)" }}>
                phone
              </span>
            </p>
            <form
              onSubmit={handleUpload}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <label
                htmlFor="fileInput"
                style={{
                  ...s.dropzone,
                  ...(selectedFile ? s.dropzoneActive : {}),
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}></div>
                {selectedFile ? (
                  <>
                    <p
                      style={{
                        color: "var(--green)",
                        fontWeight: 600,
                        marginBottom: 4,
                      }}
                    >
                      {selectedFile.name}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-3)" }}>
                      Click to change file
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ color: "var(--text-2)", marginBottom: 4 }}>
                      Drop your Excel file here
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-4)" }}>
                      or click to browse
                    </p>
                  </>
                )}
                <input
                  id="fileInput"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFile}
                  style={{ display: "none" }}
                />
              </label>
              <button
                className="btn btn-primary btn-lg"
                type="submit"
                disabled={uploading || !selectedFile}
                style={{ width: "100%" }}
              >
                {uploading ? (
                  <>
                    <span
                      className="spinner"
                      style={{ width: 16, height: 16 }}
                    />{" "}
                    Uploading…
                  </>
                ) : (
                  "Upload & Continue →"
                )}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="card animate-in" style={s.card}>
            {uploadResult && (
              <div className="alert alert-success" style={{ marginBottom: 20 }}>
                {uploadResult.inserted} students imported successfully
              </div>
            )}
            <h2 style={s.cardTitle}>Set up cubicles</h2>
            <p style={s.cardDesc}>
              How many interview cubicles will run in parallel?
            </p>
            <div style={s.counter}>
              <button
                className="btn btn-ghost"
                onClick={() => setCubicleCount(Math.max(1, cubicleCount - 1))}
                style={{ width: 40, height: 40, padding: 0, fontSize: 20 }}
              >
                −
              </button>
              <div style={s.countDisplay}>
                <span
                  style={{
                    fontSize: 48,
                    fontWeight: 800,
                    color: "var(--text-1)",
                    lineHeight: 1,
                  }}
                >
                  {cubicleCount}
                </span>
                <span style={{ fontSize: 13, color: "var(--text-3)" }}>
                  cubicles
                </span>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => setCubicleCount(Math.min(50, cubicleCount + 1))}
                style={{ width: 40, height: 40, padding: 0, fontSize: 20 }}
              >
                +
              </button>
            </div>
            <button
              className="btn btn-primary btn-lg"
              style={{ width: "100%", marginTop: 8 }}
              onClick={handleCreateCubicles}
              disabled={creatingCubicles}
            >
              {creatingCubicles ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16 }} />{" "}
                  Creating…
                </>
              ) : (
                `Create ${cubicleCount} cubicle${cubicleCount !== 1 ? "s" : ""} →`
              )}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="card animate-in" style={s.card}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}></div>
              <h2 style={s.cardTitle}>Session is live!</h2>
              <p style={s.cardDesc}>
                Share this link with students on your WhatsApp group
              </p>
            </div>
            <div style={s.linkBox}>
              <span
                className="mono"
                style={{
                  fontSize: 13,
                  color: "var(--accent)",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {joinLink}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(joinLink);
                  toast.success("Link copied!");
                }}
              >
                Copy
              </button>
            </div>
            <div
              className="alert alert-info"
              style={{ marginTop: 16, marginBottom: 20 }}
            >
              Students open this link, enter their roll number, and see their
              cubicle + live queue position.
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => navigate("/dashboard")}
              >
                ← Sessions
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={() => navigate(`/session/${sessionId}/live`)}
              >
                Open APC Dashboard →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "var(--bg-0)",
    padding: "32px 24px",
    maxWidth: 640,
    margin: "0 auto",
  },
  header: { display: "flex", alignItems: "center", gap: 16, marginBottom: 32 },
  title: { fontSize: 18, fontWeight: 600 },
  steps: { display: "flex", alignItems: "center", gap: 0, marginBottom: 40 },
  stepItem: { display: "flex", alignItems: "center", gap: 10 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
    transition: "all 0.3s ease",
  },
  stepLine: {
    width: 40,
    height: 1,
    background: "var(--border-1)",
    margin: "0 4px",
  },
  content: {},
  card: { padding: 32 },
  cardTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
    letterSpacing: "-0.01em",
  },
  cardDesc: {
    fontSize: 14,
    color: "var(--text-3)",
    marginBottom: 24,
    lineHeight: 1.6,
  },
  dropzone: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px dashed var(--border-2)",
    borderRadius: 12,
    padding: 40,
    cursor: "pointer",
    transition: "all 0.2s",
    background: "var(--bg-1)",
  },
  dropzoneActive: {
    borderColor: "var(--green)",
    background: "var(--green-dim)",
  },
  counter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    margin: "24px 0",
  },
  countDisplay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    width: 80,
  },
  linkBox: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    background: "var(--bg-1)",
    border: "1px solid var(--border-2)",
    borderRadius: 10,
  },
};
