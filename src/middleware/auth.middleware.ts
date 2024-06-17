import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

export const authentification = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token; // Assuming the access token is stored in a cookie named 'accessToken'
  if (!token) {
    return res.redirect("/login")
  }
  const decode = jwt.verify(token, process.env.JWT_SECRET);
  if (!decode) {
    return res.redirect("/login")
  }
  req[" currentUser"] = decode;
  next();

};



export const authorization = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req[" currentUser"]
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};