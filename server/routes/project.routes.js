import { Router } from "express";
import { listProjects,getProject } from "../controllers/project.controller.js";
const router=Router();
router.get("/",listProjects);
router.get("/:slug",getProject);
export default router;