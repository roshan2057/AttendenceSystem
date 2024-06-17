import { Request, Response } from "express";
import { Excel } from "../service/excel";
import { AppDataSource } from "../data-source";
import { AttendanceLogEntity } from "../entity/AttendanceLog.entity";


export class ExcelController {
    static async userReport(req: Request, res: Response) {
        const { id, name } = req.body;

        const headers = ['SN', 'Date', 'Time1', 'Time2', 'Break', 'Time3', 'Time4', 'Total'];
        const data = await AppDataSource.getRepository(AttendanceLogEntity).find({ where: { user: { id: id } } });

        const transformedData = data.map((attendanceLog, index) => {
            const date = attendanceLog.date;
            const time1 = attendanceLog.time1;
            const time2 = attendanceLog.time2;
            const breaktime = attendanceLog.break;
            const time3 = attendanceLog.time3;
            const time4 = attendanceLog.time4;
            const total = attendanceLog.total;
            return [index + 1, date, time1?time1:'-', time2?time2:'-', breaktime?breaktime:'-', time3?breaktime:'-', time4?time4:'-', total?total:'-'];
        });1
        return (Excel.ExportToExcel(name, headers, transformedData, res))
    }
}