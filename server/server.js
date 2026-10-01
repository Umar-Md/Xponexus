import "./config/env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import { pool } from "./config/db.js";

const app=express();
const clientUrl = process.env.CLIENT_URL?.trim() ||
  (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : undefined);
if (!clientUrl) throw new Error("CLIENT_URL must be configured in production");
app.use(cors({origin:new URL(clientUrl).origin,credentials:true}));
app.use(express.json({limit:"2mb"}));
app.use(cookieParser());
app.use("/uploads",express.static(path.resolve("uploads")));
app.use("/api/auth",authRoutes);
app.use("/api/projects",projectRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/upload",uploadRoutes);
app.get("/api/health",async(req,res)=>{
  try {await pool.query("SELECT 1");res.json({api:"ok",database:"connected"})}
  catch(e){res.status(500).json({api:"ok",database:"error",message:e.message})}
});
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({message:err.message||"Server error"})});
async function start() {
  await pool.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS pdf TEXT");
  await pool.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS preview_label TEXT");
  app.listen(process.env.PORT||5000,()=>console.log(`XPONEXUS API http://localhost:${process.env.PORT||5000}`));
}
start().catch((error)=>{
  console.error("Failed to apply database migrations:",error);
  process.exitCode=1;
});
