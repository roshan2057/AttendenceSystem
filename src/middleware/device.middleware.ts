import { NextFunction, Request, Response } from "express";
import { encrypt } from "../helpers/encrypt";

export const deviceAuth = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { key } = req.body;
    if (!key) {
        return res.json({ name: "key required", message: "Invalid" })
    }

    const isValid = encrypt.comparepassword(key, process.env.DEVICE_SECRET);
    if (!isValid) {
        return res.json({ name: "key invalid", message: "Invalid" })
    }
    next();

};