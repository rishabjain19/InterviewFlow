import { useState, useRef } from "react";
import api from "../utils/api";
import { useToast } from "../context/ToastContext";

export default function CubicleCard({
  cubicle,
  students,
  onAssigned,
  onMarkedDone,
}) {
  const toast = useToast();
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [markingDone, setMarkingDone] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [reordering, setReordering] = useState(false);
  const dragItem = useRef(null);

  const unassigned = students.filter((s) => !s.cubicle_id);
  const current = cubicle.queue.find((q) => q.status === "in_progress");
  const waiting = cubicle.queue
    .filter((q) => q.status === "waiting")
    .sort((a, b) => a.position - b.position);
  const done = cubicle.queue.filter((q) => q.status === "done");
  const active = cubicle.queue.filter((q) => q.status !== "done").length;

  const handleAssign = async () => {
    if (!selectedStudentId) return;
    setAssigning(true);
    try {
      await api.post(`/student/${selectedStudentId}/assign-cubicle`, {
        cubicleId: cubicle.id,
      });
      setSelectedStudentId("");
      toast.success("Student assigned!");
      onAssigned?.();
    } catch (err) {
      toast.error(err.response?.data?.error || "Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  const handleMarkDone = async () => {
    if (!current) return;
    if (!window.confirm(`Mark ${current.name}'s interview as done?`)) return;
    setMarkingDone(true);
    try {
      await api.post(`/student/${current.student_id}/mark-done`);
      toast.success("Interview marked done!");
      onMarkedDone?.();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setMarkingDone(false);
    }
  };

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    const fromIndex = dragItem.current;
    if (fromIndex === null || fromIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...waiting];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(dropIndex, 0, moved);

    setDragIndex(null);
    setDragOverIndex(null);
    setReordering(true);

    try {
      await api.post(`/cubicle/${cubicle.id}/reorder`, {
        orderedStudentIds: newOrder.map((e) => e.student_id),
      });
      toast.success("Queue reordered!");
      onAssigned?.();
    } catch (err) {
      toast.error(err.response?.data?.error || "Reorder failed");
    } finally {
      setReordering(false);
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="card" style={s.card}>
      <div style={s.header}>
        <div>
          <h3 style={s.label}>{cubicle.label}</h3>
          <span style={s.meta}>
            {active} in queue · {done.length} done
          </span>
        </div>
        {current && (
          <button
            className="btn btn-success btn-sm"
            onClick={handleMarkDone}
            disabled={markingDone}
          >
            {markingDone ? (
              <span className="spinner" style={{ width: 12, height: 12 }} />
            ) : (
              "Done"
            )}
          </button>
        )}
      </div>

      <div style={s.queue}>
        {current && (
          <div style={s.currentRow}>
            <div style={s.nowBadge}>NOW</div>
            <div style={s.info}>
              <span style={s.name}>{current.name}</span>
              <span className="mono" style={s.roll}>
                {current.roll_no}
              </span>
            </div>
            <span
              className="dot dot-pulse"
              style={{ background: "var(--green)" }}
            />
          </div>
        )}

        {waiting.length > 0 && (
          <div style={s.waitingSection}>
            {waiting.length > 1 && (
              <div style={s.dragHint}>
                <span style={{ fontSize: 11, color: "var(--text-4)" }}>
                  ⠿ Drag to reorder
                </span>
                {reordering && (
                  <span className="spinner" style={{ width: 10, height: 10 }} />
                )}
              </div>
            )}
            {waiting.map((entry, i) => (
              <div
                key={entry.student_id}
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={(e) => handleDrop(e, i)}
                onDragEnd={handleDragEnd}
                style={{
                  ...s.waitRow,
                  opacity: dragIndex === i ? 0.4 : 1,
                  borderColor:
                    dragOverIndex === i && dragIndex !== i
                      ? "var(--accent)"
                      : "var(--border-1)",
                  transform:
                    dragOverIndex === i && dragIndex !== i
                      ? "scale(1.01)"
                      : "scale(1)",
                  cursor: "grab",
                }}
              >
                <span style={s.dragHandle}>⠿</span>
                <div style={s.posNum}>{i + 2}</div>
                <div style={s.info}>
                  <span style={{ ...s.name, fontWeight: 400 }}>
                    {entry.name}
                  </span>
                  <span className="mono" style={s.roll}>
                    {entry.roll_no}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {done.map((e) => (
          <div key={e.student_id} style={s.doneRow}>
            <span style={{ color: "var(--green)", fontSize: 11 }}></span>
            <span style={s.doneName}>{e.name}</span>
          </div>
        ))}

        {cubicle.queue.length === 0 && (
          <p style={s.empty}>No students assigned yet</p>
        )}
      </div>

      <div style={s.assignRow}>
        <select
          className="input"
          style={{ flex: 1, fontSize: 13 }}
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          disabled={unassigned.length === 0}
        >
          <option value="">
            {unassigned.length === 0
              ? "All students assigned"
              : "— Assign student —"}
          </option>
          {unassigned.map((s) => (
            <option key={s.id} value={s.id}>
              {s.roll_no} · {s.name}
            </option>
          ))}
        </select>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleAssign}
          disabled={!selectedStudentId || assigning}
        >
          {assigning ? (
            <span className="spinner" style={{ width: 12, height: 12 }} />
          ) : (
            "Assign"
          )}
        </button>
      </div>
    </div>
  );
}

const s = {
  card: { padding: 18, display: "flex", flexDirection: "column", gap: 14 },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  label: { fontSize: 15, fontWeight: 700 },
  meta: {
    fontSize: 12,
    color: "var(--text-4)",
    marginTop: 2,
    display: "block",
  },
  queue: { display: "flex", flexDirection: "column", gap: 5, minHeight: 40 },
  currentRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    background: "var(--green-dim)",
    border: "1px solid rgba(34,211,160,0.2)",
    borderRadius: 8,
  },
  nowBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: "var(--green)",
    background: "rgba(34,211,160,0.15)",
    padding: "2px 6px",
    borderRadius: 4,
    flexShrink: 0,
  },
  waitingSection: { display: "flex", flexDirection: "column", gap: 4 },
  dragHint: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "2px 4px",
  },
  waitRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    background: "var(--bg-3)",
    border: "1px solid var(--border-1)",
    borderRadius: 6,
    transition: "all 0.15s",
    userSelect: "none",
  },
  dragHandle: {
    fontSize: 14,
    color: "var(--text-4)",
    flexShrink: 0,
    cursor: "grab",
  },
  posNum: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "var(--bg-5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    color: "var(--text-3)",
    flexShrink: 0,
  },
  doneRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "5px 12px",
    opacity: 0.4,
  },
  doneName: { fontSize: 12, color: "var(--text-3)" },
  info: { flex: 1, display: "flex", flexDirection: "column", gap: 1 },
  name: { fontSize: 13, fontWeight: 600 },
  roll: { color: "var(--text-4)", fontSize: 11 },
  empty: { fontSize: 13, color: "var(--text-4)", padding: "8px 0" },
  assignRow: {
    display: "flex",
    gap: 8,
    paddingTop: 10,
    borderTop: "1px solid var(--border-1)",
  },
};
