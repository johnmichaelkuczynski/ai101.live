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
import downloadRouter from "./download";
import { isAuthenticated, isAdmin } from "../lib/auth";
import { freeQuota } from "../lib/access";

const router: IRouter = Router();

// Public: health checks, course content (lectures, weeks, topics), the
// course download, and analytics. Anyone can browse and read the course.
router.use(healthRouter);
router.use(courseRouter);
router.use(downloadRouter);
router.use(analyticsRouter);

// Free preview: AI-powered features (tutor, practice, assignments,
// assessments, detection) work for anonymous visitors until they've
// generated ~two paragraphs of output; after that they get a 401 with
// code LOGIN_REQUIRED and must sign in with Google. All login code lives
// in ../lib/auth.ts (routes registered at app level, before this router).
router.use(freeQuota);
router.use(assignmentsRouter);
router.use(practiceRouter);
router.use(tutorRouter);
router.use(detectionRouter);
router.use(assessmentsRouter);

// Diagnostics include destructive operations (reset) and bulk AI jobs
// (expand-lectures) — owner only, enforced server-side. The one exception:
// expanding a SINGLE lecture (?id=...) is a normal reader feature, available
// to any signed-in user.
router.use("/diagnostics", (req, res, next) => {
  const singleLectureExpand =
    req.method === "POST" &&
    req.path === "/expand-lectures" &&
    typeof req.query.id === "string" &&
    req.query.id.length > 0;
  if (singleLectureExpand) {
    isAuthenticated(req, res, next);
    return;
  }
  isAdmin(req, res, next);
});
router.use(diagnosticsRouter);

export default router;
