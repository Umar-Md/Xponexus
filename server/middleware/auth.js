import jwt from "jsonwebtoken";

export function requireAdmin(req,res,next){
  const token=req.cookies.xpo_token;
  if(!token) return res.status(401).json({message:"Unauthorized"});
  try {
    req.admin=jwt.verify(token,process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({message:"Invalid session"});
  }
}