const express = require("express");
const auth = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");
const upload = require("../middleware/upload");
const authCtrl = require("../controllers/auth.controller");
const sessionCtrl = require("../controllers/session.controller");
const studentCtrl = require("../controllers/student.controller");

const router = express.Router();

router.get("/auth/apc-list", asyncHandler(authCtrl.apcList));
router.post("/auth/login", asyncHandler(authCtrl.login));
router.get("/auth/me", auth, asyncHandler(authCtrl.me));
router.post("/auth/reset-password", asyncHandler(authCtrl.resetPassword));
router.post(
  "/auth/change-password",
  auth,
  asyncHandler(authCtrl.changePassword),
);

router.post("/session/create", auth, asyncHandler(sessionCtrl.create));
router.get(
  "/session/my-sessions",
  auth,
  asyncHandler(sessionCtrl.getMySessions),
);
router.get("/session/:sessionId", auth, asyncHandler(sessionCtrl.getOne));
router.post(
  "/session/:sessionId/upload-students",
  auth,
  upload.single("file"),
  asyncHandler(sessionCtrl.uploadStudents),
);
router.post(
  "/session/:sessionId/create-cubicles",
  auth,
  asyncHandler(sessionCtrl.createCubicles),
);
router.get(
  "/session/:sessionId/dashboard",
  auth,
  asyncHandler(sessionCtrl.getDashboard),
);
router.get(
  "/session/:sessionId/students",
  auth,
  asyncHandler(sessionCtrl.getStudents),
);
router.post("/session/:sessionId/close", auth, asyncHandler(sessionCtrl.close));

router.post(
  "/student/session/:sessionId/verify",
  asyncHandler(studentCtrl.verify),
);
router.post(
  "/student/:studentId/assign-cubicle",
  auth,
  asyncHandler(studentCtrl.assignCubicle),
);
router.post(
  "/student/:studentId/mark-done",
  auth,
  asyncHandler(studentCtrl.markDone),
);
router.post(
  "/cubicle/:cubicleId/reorder",
  auth,
  asyncHandler(studentCtrl.reorderQueue),
);

module.exports = router;
