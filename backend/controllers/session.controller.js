const XLSX = require("xlsx");
const { Session, Student, Cubicle } = require("../models");

module.exports = {
  create: async (req, res) => {
    const { title } = req.body;
    if (!title?.trim())
      return res.status(400).json({ error: "Title required" });
    const session = await Session.create(req.apc.id, title.trim());
    res.status(201).json({ session });
  },

  getMySessions: async (req, res) => {
    const sessions = await Session.findByApcId(req.apc.id);
    res.json({ sessions });
  },

  getOne: async (req, res) => {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.apc_id !== req.apc.id)
      return res.status(403).json({ error: "Access denied" });
    res.json({
      session,
      hasStudents: session.has_students,
      hasCubicles: session.has_cubicles,
    });
  },

  uploadStudents: async (req, res) => {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.apc_id !== req.apc.id)
      return res.status(403).json({ error: "Access denied" });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    let workbook;
    try {
      workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    } catch {
      return res.status(400).json({ error: "Could not parse Excel file" });
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" });
    if (!rows.length)
      return res.status(400).json({ error: "Excel file is empty" });

    const parseRow = (row) => {
      const n = {};
      for (const [k, v] of Object.entries(row))
        n[k.toLowerCase().replace(/[\s_]/g, "")] = String(v).trim();
      return {
        rollNo: n["rollno"] || n["rollnumber"] || n["roll"] || "",
        name: n["name"] || n["studentname"] || n["fullname"] || "",
        phone:
          n["phone"] || n["mobile"] || n["phonenumber"] || n["mobileno"] || "",
      };
    };

    const valid = [];
    rows.forEach((row) => {
      const p = parseRow(row);
      if (!p.rollNo || !p.name) return;
      if (p.phone && !/^\d{10}$/.test(p.phone)) p.phone = null;
      valid.push(p);
    });

    if (!valid.length)
      return res
        .status(400)
        .json({
          error:
            "No valid rows found. Check column names: roll_no, name, phone",
        });

    const inserted = await Student.bulkInsert(sessionId, valid);
    await Session.markHasStudents(sessionId);
    res
      .status(201)
      .json({
        message: `${inserted.length} students uploaded`,
        total: rows.length,
        inserted: inserted.length,
      });
  },

  createCubicles: async (req, res) => {
    const { sessionId } = req.params;
    const { count, labels } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.apc_id !== req.apc.id)
      return res.status(403).json({ error: "Access denied" });

    const cubicleLabels = labels?.length
      ? labels.map((l) => String(l).trim())
      : Array.from(
          { length: Number(count) || 5 },
          (_, i) => `Cubicle ${i + 1}`,
        );

    const cubicles = await Cubicle.bulkCreate(sessionId, cubicleLabels);
    await Session.markHasCubicles(sessionId);
    res.status(201).json({ cubicles });
  },

  getDashboard: async (req, res) => {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.apc_id !== req.apc.id)
      return res.status(403).json({ error: "Access denied" });
    const [students, cubicles] = await Promise.all([
      Student.findBySession(sessionId),
      Cubicle.findBySessionWithQueue(sessionId),
    ]);
    res.json({ session, students, cubicles });
  },

  getStudents: async (req, res) => {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.apc_id !== req.apc.id)
      return res.status(403).json({ error: "Access denied" });
    res.json({ students: await Student.findBySession(req.params.sessionId) });
  },

  close: async (req, res) => {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.apc_id !== req.apc.id)
      return res.status(403).json({ error: "Access denied" });
    const closed = await Session.close(req.params.sessionId);
    res.json({ session: closed });
  },
};
