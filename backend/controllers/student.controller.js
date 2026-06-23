const { Student, Cubicle, QueueEntry, Session } = require("../models");

module.exports = {
  verify: async (req, res) => {
    const { sessionId } = req.params;
    const { rollNo } = req.body;
    if (!rollNo) return res.status(400).json({ error: "Roll number required" });
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    const student = await Student.findByRollNo(
      sessionId,
      rollNo.trim().toUpperCase(),
    );
    if (!student)
      return res
        .status(404)
        .json({ error: "Roll number not found in this session" });
    let queueInfo = null;
    if (student.cubicle_id)
      queueInfo = await QueueEntry.getStudentPosition(student.id);
    const status = !student.cubicle_id
      ? "not_assigned"
      : queueInfo?.status === "done"
        ? "done"
        : queueInfo?.status === "in_progress"
          ? "in_progress"
          : "waiting";
    res.json({
      student: {
        id: student.id,
        name: student.name,
        rollNo: student.roll_no,
        cubicleId: student.cubicle_id,
        cubicleLabel: student.cubicle_label,
      },
      status,
      queueInfo,
      sessionTitle: session.title,
    });
  },

  assignCubicle: async (req, res) => {
    const { studentId } = req.params;
    const { cubicleId } = req.body;
    if (!cubicleId)
      return res.status(400).json({ error: "cubicleId required" });
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });
    if (student.cubicle_id)
      return res
        .status(409)
        .json({ error: "Student already assigned to a cubicle" });
    const cubicle = await Cubicle.findById(cubicleId);
    if (!cubicle) return res.status(404).json({ error: "Cubicle not found" });
    if (cubicle.session_id !== student.session_id)
      return res
        .status(400)
        .json({ error: "Cubicle does not belong to this session" });
    const updated = await Student.assignCubicle(studentId, cubicleId);
    if (!updated) return res.status(409).json({ error: "Assignment conflict" });
    const queueEntry = await QueueEntry.addToQueue(cubicleId, studentId);
    if (queueEntry.position === 1)
      await Cubicle.setCurrentStudent(cubicleId, studentId);
    res.status(201).json({ student: updated, queueEntry, cubicle });
  },

  markDone: async (req, res) => {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });
    if (!student.cubicle_id)
      return res
        .status(400)
        .json({ error: "Student not assigned to any cubicle" });
    const { nextStudent } = await QueueEntry.markDone(
      student.cubicle_id,
      studentId,
    );
    const updatedQueue = await QueueEntry.getFullQueue(student.cubicle_id);
    if (req.io) {
      req.io
        .to(student.session_id)
        .emit("queue-updated", {
          cubicleId: student.cubicle_id,
          queue: updatedQueue,
          nextStudentId: nextStudent?.student_id || null,
        });
    }
    res.json({ message: "Done", nextStudent, updatedQueue });
  },

  reorderQueue: async (req, res) => {
    const { cubicleId } = req.params;
    const { orderedStudentIds } = req.body;
    if (!Array.isArray(orderedStudentIds) || !orderedStudentIds.length) {
      return res
        .status(400)
        .json({ error: "orderedStudentIds array required" });
    }
    const db = require("../config/db");
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      for (let i = 0; i < orderedStudentIds.length; i++) {
        await client.query(
          "UPDATE queue_entries SET position=$1 WHERE cubicle_id=$2 AND student_id=$3 AND status='waiting'",
          [i + 2, cubicleId, orderedStudentIds[i]],
        );
      }
      await client.query("COMMIT");
      const updatedQueue = await QueueEntry.getFullQueue(cubicleId);
      const cubicle = await Cubicle.findById(cubicleId);
      if (req.io) {
        req.io
          .to(cubicle.session_id)
          .emit("queue-updated", {
            cubicleId: parseInt(cubicleId),
            queue: updatedQueue,
            nextStudentId: null,
          });
      }
      res.json({ message: "Queue reordered", queue: updatedQueue });
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },
};
