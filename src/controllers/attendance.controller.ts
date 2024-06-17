import { Request, Response } from "express";
import { AttendanceService } from "../service/attendance";

export class AttendanaceController {
  static async  attendance(req: Request, res: Response) {
        const response =await AttendanceService.attendanceEntry(req.body);
        return res.json(response);
    }

}