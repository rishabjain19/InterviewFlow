const db = require("../config/db");

const ApcUser = {
  findByEmail: async (email) =>
    (await db.query("SELECT * FROM apc_users WHERE email=$1", [email])).rows[0],
  findById: async (id) =>
    (
      await db.query(
        "SELECT id,name,email,created_at FROM apc_users WHERE id=$1",
        [id],
      )
    ).rows[0],
  findAll: async () =>
    (await db.query("SELECT id,name,email FROM apc_users ORDER BY name")).rows,
  updatePassword: async (id, hash) =>
    db.query("UPDATE apc_users SET password_hash=$1 WHERE id=$2", [hash, id]),
};

const Session = {
  create: async (apcId, title) =>
    (
      await db.query(
        "INSERT INTO sessions(apc_id,title) VALUES($1,$2) RETURNING *",
        [apcId, title],
      )
    ).rows[0],
  findById: async (id) =>
    (await db.query("SELECT * FROM sessions WHERE id=$1", [id])).rows[0],
  findByApcId: async (apcId) =>
    (
      await db.query(
        "SELECT * FROM sessions WHERE apc_id=$1 ORDER BY created_at DESC",
        [apcId],
      )
    ).rows,
  markHasStudents: async (id) =>
    db.query("UPDATE sessions SET has_students=TRUE WHERE id=$1", [id]),
  markHasCubicles: async (id) =>
    db.query("UPDATE sessions SET has_cubicles=TRUE WHERE id=$1", [id]),
  close: async (id) =>
    (
      await db.query(
        "UPDATE sessions SET status='closed' WHERE id=$1 RETURNING *",
        [id],
      )
    ).rows[0],
};

const Student = {
  bulkInsert: async (sessionId, students) => {
    if (!students.length) return [];
    const values = [];
    const placeholders = students.map((s, i) => {
      const b = i * 4;
      values.push(sessionId, s.rollNo, s.name, s.phone || null);
      return `($${b + 1},$${b + 2},$${b + 3},$${b + 4})`;
    });
    const res = await db.query(
      `INSERT INTO students(session_id,roll_no,name,phone) VALUES ${placeholders.join(",")} ON CONFLICT(session_id,roll_no) DO NOTHING RETURNING *`,
      values,
    );
    return res.rows;
  },
  findByRollNo: async (sessionId, rollNo) =>
    (
      await db.query(
        "SELECT s.*,c.label AS cubicle_label FROM students s LEFT JOIN cubicles c ON s.cubicle_id=c.id WHERE s.session_id=$1 AND s.roll_no=$2",
        [sessionId, rollNo],
      )
    ).rows[0],
  findById: async (id) =>
    (await db.query("SELECT * FROM students WHERE id=$1", [id])).rows[0],
  findBySession: async (sessionId) =>
    (
      await db.query(
        `SELECT s.id,s.roll_no,s.name,s.phone,s.whatsapp_sent,s.whatsapp_failed,s.cubicle_id,c.label AS cubicle_label,qe.position,qe.status AS queue_status
     FROM students s LEFT JOIN cubicles c ON s.cubicle_id=c.id LEFT JOIN queue_entries qe ON qe.student_id=s.id
     WHERE s.session_id=$1 ORDER BY s.roll_no`,
        [sessionId],
      )
    ).rows,
  assignCubicle: async (studentId, cubicleId) =>
    (
      await db.query(
        "UPDATE students SET cubicle_id=$1 WHERE id=$2 AND cubicle_id IS NULL RETURNING *",
        [cubicleId, studentId],
      )
    ).rows[0],
  updateWhatsApp: async (id, sent, failed) =>
    db.query(
      "UPDATE students SET whatsapp_sent=$1,whatsapp_failed=$2 WHERE id=$3",
      [sent, failed, id],
    ),
};

const Cubicle = {
  bulkCreate: async (sessionId, labels) => {
    const values = [];
    const placeholders = labels.map((l, i) => {
      values.push(sessionId, l);
      return `($${i * 2 + 1},$${i * 2 + 2})`;
    });
    return (
      await db.query(
        `INSERT INTO cubicles(session_id,label) VALUES ${placeholders.join(",")} ON CONFLICT(session_id,label) DO NOTHING RETURNING *`,
        values,
      )
    ).rows;
  },
  findById: async (id) =>
    (await db.query("SELECT * FROM cubicles WHERE id=$1", [id])).rows[0],
  findBySessionWithQueue: async (sessionId) => {
    const cubicles = (
      await db.query(
        "SELECT * FROM cubicles WHERE session_id=$1 ORDER BY label",
        [sessionId],
      )
    ).rows;
    const queue = (
      await db.query(
        `SELECT qe.id AS entry_id,qe.cubicle_id,qe.position,qe.status,qe.done_at,s.id AS student_id,s.roll_no,s.name,s.phone,s.whatsapp_sent,s.whatsapp_failed
       FROM queue_entries qe JOIN students s ON qe.student_id=s.id JOIN cubicles c ON qe.cubicle_id=c.id
       WHERE c.session_id=$1 ORDER BY qe.cubicle_id,qe.position`,
        [sessionId],
      )
    ).rows;
    const map = new Map();
    queue.forEach((e) => {
      if (!map.has(e.cubicle_id)) map.set(e.cubicle_id, []);
      map.get(e.cubicle_id).push(e);
    });
    return cubicles.map((c) => ({ ...c, queue: map.get(c.id) || [] }));
  },
  setCurrentStudent: async (cubicleId, studentId) =>
    db.query("UPDATE cubicles SET current_student_id=$1 WHERE id=$2", [
      studentId,
      cubicleId,
    ]),
};

const QueueEntry = {
  addToQueue: async (cubicleId, studentId) => {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const maxPos = (
        await client.query(
          "SELECT COALESCE(MAX(position),0) AS p FROM queue_entries WHERE cubicle_id=$1",
          [cubicleId],
        )
      ).rows[0].p;
      const pos = maxPos + 1;
      const res = await client.query(
        "INSERT INTO queue_entries(cubicle_id,student_id,position,status) VALUES($1,$2,$3,$4) RETURNING *",
        [cubicleId, studentId, pos, pos === 1 ? "in_progress" : "waiting"],
      );
      await client.query("COMMIT");
      return res.rows[0];
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },
  markDone: async (cubicleId, studentId) => {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "UPDATE queue_entries SET status='done',done_at=NOW() WHERE cubicle_id=$1 AND student_id=$2 AND status='in_progress'",
        [cubicleId, studentId],
      );
      const next = (
        await client.query(
          "SELECT * FROM queue_entries WHERE cubicle_id=$1 AND status='waiting' ORDER BY position LIMIT 1",
          [cubicleId],
        )
      ).rows[0];
      let nextStudent = null;
      if (next) {
        nextStudent = (
          await client.query(
            "UPDATE queue_entries SET status='in_progress' WHERE id=$1 RETURNING *",
            [next.id],
          )
        ).rows[0];
        await client.query(
          "UPDATE cubicles SET current_student_id=$1 WHERE id=$2",
          [nextStudent.student_id, cubicleId],
        );
      } else {
        await client.query(
          "UPDATE cubicles SET current_student_id=NULL WHERE id=$1",
          [cubicleId],
        );
      }
      await client.query("COMMIT");
      return { nextStudent };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },
  getStudentPosition: async (studentId) =>
    (
      await db.query(
        `SELECT qe.position,qe.status,qe.cubicle_id,c.label AS cubicle_label,
     (SELECT COUNT(*) FROM queue_entries q2 WHERE q2.cubicle_id=qe.cubicle_id AND q2.status IN('waiting','in_progress') AND q2.position<qe.position) AS people_ahead
     FROM queue_entries qe JOIN cubicles c ON qe.cubicle_id=c.id WHERE qe.student_id=$1 ORDER BY qe.assigned_at DESC LIMIT 1`,
        [studentId],
      )
    ).rows[0],
  getFullQueue: async (cubicleId) =>
    (
      await db.query(
        "SELECT qe.id,qe.position,qe.status,qe.done_at,s.id AS student_id,s.roll_no,s.name FROM queue_entries qe JOIN students s ON qe.student_id=s.id WHERE qe.cubicle_id=$1 ORDER BY qe.position",
        [cubicleId],
      )
    ).rows,
};

module.exports = { ApcUser, Session, Student, Cubicle, QueueEntry };
