import { NextFunction, Request, Response } from "express";
import { encrypt } from "../helpers/encrypt";

export const deviceAuth = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { key } = req.body;
    if (!key) {
        return res.send("key required")
    }

    const isValid = encrypt.comparepassword(key, process.env.DEVICE_SECRET);
    if (!isValid) {
        return res.send("invalid key")
    }
    next();

};