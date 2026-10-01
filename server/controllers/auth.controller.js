import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

export async function login(req,res){
  const {email,password}=req.body;
  const {rows}=await pool.query("SELECT * FROM admins WHERE email=$1",[email]);
  const admin=rows[0];
  if(!admin || !(await bcrypt.compare(password,admin.password_hash)))
    return res.status(401).json({message:"Invalid email or password"});

  const token=jwt.sign({id:admin.id,email:admin.email},process.env.JWT_SECRET,{expiresIn:"8h"});
  res.cookie("xpo_token",token,{
    httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",maxAge:8*60*60*1000
  });
  res.json({id:admin.id,email:admin.email});
}
export function logout(req,res){res.clearCookie("xpo_token");res.json({ok:true})}
export function me(req,res){res.json(req.admin)}