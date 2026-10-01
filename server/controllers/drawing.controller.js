import { pool } from "../config/db.js";

export async function createDrawing(req,res){
  const {title,reference,pdf_url,thumbnail_url,published=true,sort_order=0}=req.body;
  if(!title?.trim()) return res.status(400).json({message:"Drawing title is required"});
  const {rows}=await pool.query(`INSERT INTO drawings
   (project_id,title,reference,pdf_url,thumbnail_url,published,sort_order)
   VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
   [req.params.projectId,title.trim(),reference||"",pdf_url||"",thumbnail_url||"",published,Number(sort_order)||0]);
  res.status(201).json(rows[0]);
}
export async function updateDrawing(req,res){
  const {title,reference,pdf_url,thumbnail_url,published=true,sort_order=0}=req.body;
  if(!title?.trim()) return res.status(400).json({message:"Drawing title is required"});
  const {rows}=await pool.query(`UPDATE drawings SET title=$1,reference=$2,pdf_url=$3,thumbnail_url=$4,
    published=$5,sort_order=$6,updated_at=NOW() WHERE id=$7 RETURNING *`,
    [title.trim(),reference||"",pdf_url||"",thumbnail_url||"",published,Number(sort_order)||0,req.params.id]);
  if(!rows[0]) return res.status(404).json({message:"Drawing not found"});
  res.json(rows[0]);
}
export async function deleteDrawing(req,res){
  await pool.query("DELETE FROM drawings WHERE id=$1",[req.params.id]);
  res.json({ok:true});
}
