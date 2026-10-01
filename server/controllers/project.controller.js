import { pool } from "../config/db.js";

export async function listProjects(req,res){
  const {rows}=await pool.query(`
    SELECT p.*, COALESCE(json_agg(d ORDER BY d.sort_order) FILTER (WHERE d.id IS NOT NULL),'[]') drawings
    FROM projects p LEFT JOIN drawings d ON d.project_id=p.id AND d.published=true
    WHERE p.published=true GROUP BY p.id ORDER BY p.sort_order,p.id`);
  res.json(rows);
}

export async function listAdminProjects(req,res){
  const {rows}=await pool.query(`
    SELECT p.*, COALESCE(json_agg(d ORDER BY d.sort_order,d.id) FILTER (WHERE d.id IS NOT NULL),'[]') drawings
    FROM projects p LEFT JOIN drawings d ON d.project_id=p.id
    GROUP BY p.id ORDER BY p.sort_order,p.id`);
  res.json(rows);
}

export async function getProject(req,res){
  const {rows}=await pool.query(`
    SELECT p.*, COALESCE(json_agg(d ORDER BY d.sort_order) FILTER (WHERE d.id IS NOT NULL),'[]') drawings
    FROM projects p LEFT JOIN drawings d ON d.project_id=p.id AND d.published=true
    WHERE p.slug=$1 AND p.published=true GROUP BY p.id`,[req.params.slug]);
  if(!rows[0]) return res.status(404).json({message:"Project not found"});
  res.json(rows[0]);
}
export async function createProject(req,res){
  const {title,slug,category,description,scope,preview_label,thumbnail,pdf,published=true,sort_order=0}=req.body;
  if(!title?.trim() || !slug?.trim()) return res.status(400).json({message:"Title and slug are required"});
  const {rows}=await pool.query(`INSERT INTO projects
    (title,slug,category,description,scope,preview_label,thumbnail,pdf,published,sort_order)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [title,slug,category,description,scope,preview_label,thumbnail,pdf,published,sort_order]);
  res.status(201).json(rows[0]);
}
export async function updateProject(req,res){
  const {title,slug,category,description,scope,preview_label,thumbnail,pdf,published,sort_order}=req.body;
  const {rows}=await pool.query(`UPDATE projects SET
    title=$1,slug=$2,category=$3,description=$4,scope=$5,preview_label=$6,thumbnail=$7,pdf=COALESCE($8,pdf),published=$9,sort_order=$10,updated_at=NOW()
    WHERE id=$11 RETURNING *`,
    [title,slug,category,description,scope,preview_label,thumbnail,pdf,published,sort_order,req.params.id]);
  res.json(rows[0]);
}
export async function deleteProject(req,res){
  await pool.query("DELETE FROM projects WHERE id=$1",[req.params.id]);
  res.json({ok:true});
}
export async function updateProjectPdf(req,res){
  const {pdf}=req.body;
  if(typeof pdf!=="string" || !/\.pdf(?:[?#]|$)/i.test(pdf)) return res.status(400).json({message:"A PDF URL is required"});
  const {rows}=await pool.query("UPDATE projects SET pdf=$1,updated_at=NOW() WHERE id=$2 RETURNING *",[pdf,req.params.id]);
  if(!rows[0]) return res.status(404).json({message:"Project not found"});
  res.json(rows[0]);
}
