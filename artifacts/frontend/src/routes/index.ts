import { Router, type IRouter } from "express";
import healthRouter from "./health";
import coursesRouter from "./courses";
import lessonsRouter from "./lessons";
import progressRouter from "./progress";
import quizRouter from "./quiz";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/courses", coursesRouter);
router.use("/lessons", lessonsRouter);
router.use("/progress", progressRouter);
router.use("/quiz", quizRouter);
router.use("/chat", chatRouter);

export default router;
