import { Request, Response } from "express";
import { AttendanceService } from "../service/attendance";
const { adToBs } = require("@sbmdkl/nepali-date-converter");

export class AttendanaceController {
  static async attendance(req: Request, res: Response) {
    const { date } = req.body;
    req.body.date = adToBs(date);
    console.log(req.body)
    const response = await AttendanceService.attendanceEntry(req.body);
    return res.json(response);
  }
}
