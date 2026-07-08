import { Router, type IRouter } from "express";
import healthRouter from "./health";
import courseRouter from "./course";
import assignmentsRouter from "./assignments";
import practiceRouter from "./practice";
import tutorRouter from "./tutor";
import detectionRouter from "./detection";
import analyticsRouter from "./analytics";
import diagnosticsRouter from "./diagnostics";
import assessmentsRouter from "./assessments";
import adminRouter from "./admin";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

// Health check stays public so the platform can probe the server.
router.use(healthRouter);

// Everything below requires a signed-in Google account. Auth routes
// (/api/auth/*) are registered at the app level before this router, so they
// bypass this gate.
router.use(requireAuth);

// Owner-only administrative analytics (guards admin per-route).
router.use(adminRouter);

router.use(courseRouter);
router.use(assignmentsRouter);
router.use(practiceRouter);
router.use(tutorRouter);
router.use(detectionRouter);
router.use(analyticsRouter);
router.use(diagnosticsRouter);
router.use(assessmentsRouter);

export default router;
