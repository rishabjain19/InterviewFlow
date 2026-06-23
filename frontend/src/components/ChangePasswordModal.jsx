import { useState } from "react";
import api from "../utils/api";
import { useToast } from "../context/ToastContext";

export default function ChangePasswordModal({ onClose }) {
  const toast = useToast();
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPass.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (form.newPass !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: form.current,
        newPassword: form.newPass,
      });
      setDone(true);
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={s.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={s.modal} className="card animate-scale">
        <div style={s.header}>
          <h2 style={s.title}>Change Password</h2>
          <button style={s.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        {done ? (
          <div style={s.successWrap}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              Password updated!
            </h3>
            <p
              style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 24 }}
            >
              Your new password is active. Use it next time you log in.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={onClose}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={s.form}>
            <div>
              <label>Current password</label>
              <input
                className="input"
                type="password"
                placeholder="Your current password"
                value={form.current}
                onChange={(e) =>
                  setForm((p) => ({ ...p, current: e.target.value }))
                }
                required
                autoFocus
              />
            </div>
            <div style={s.divider} />
            <div>
              <label>New password</label>
              <input
                className="input"
                type="password"
                placeholder="At least 6 characters"
                value={form.newPass}
                onChange={(e) =>
                  setForm((p) => ({ ...p, newPass: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label>Confirm new password</label>
              <input
                className="input"
                type="password"
                placeholder="Repeat new password"
                value={form.confirm}
                onChange={(e) =>
                  setForm((p) => ({ ...p, confirm: e.target.value }))
                }
                required
                style={{
                  borderColor:
                    form.confirm && form.confirm !== form.newPass
                      ? "var(--red)"
                      : "",
                }}
              />
              {form.confirm && form.confirm !== form.newPass && (
                <p style={{ fontSize: 12, color: "var(--red)", marginTop: 4 }}>
                  Passwords do not match
                </p>
              )}
            </div>
            <div style={s.actions}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  loading || !form.current || !form.newPass || !form.confirm
                }
              >
                {loading ? (
                  <>
                    <span
                      className="spinner"
                      style={{ width: 14, height: 14 }}
                    />{" "}
                    Updating…
                  </>
                ) : (
                  "Update password"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modal: { width: "100%", maxWidth: 420, padding: 28 },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: { fontSize: 18, fontWeight: 700 },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: "var(--bg-4)",
    border: "none",
    color: "var(--text-3)",
    cursor: "pointer",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  divider: { height: 1, background: "var(--border-1)" },
  actions: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    paddingTop: 4,
  },
  successWrap: { textAlign: "center", padding: "8px 0" },
};
