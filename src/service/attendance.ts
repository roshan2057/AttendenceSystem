import { AppDataSource } from "../data-source";
import { UserEntity } from "../entity/User.entity";
import { AttendanceLogEntity } from "../entity/AttendanceLog.entity";

export class AttendanceService {

  constructor() {
  }
  static getTimeInSeconds(timeString) {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }
  static formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }
  static async attendanceEntry(playload) {
    const { id, time, date } = playload;
    const data: any = {};
    const isEmployee = await AppDataSource.getRepository(UserEntity).findOne({ where: { cardId: id.toString() } });

    if (!isEmployee) {
      return { name: "not an employee", message: "Invalid" };
    }

    const isPresent: AttendanceLogEntity = await AppDataSource.getRepository(AttendanceLogEntity).findOne({ where: { user: { id: isEmployee.id }, date: date } });

    const timeConstants = [36000, 50400, 53100, 64800];
    const tolerances = [1800, 900, 900, 1800];

    if (isPresent) {
      for (let i = 0; i < timeConstants.length; i++) {
        const timeConstant = timeConstants[i];
        const tolerance = tolerances[i];

        if (withinTolerance(timeConstant, tolerance) && isPresent[`time${i + 1}`] === null) {
          data[`time${i + 1}`] = time;
          isPresent[`time${i + 1}`] = time;
        }
      }
      if (Object.keys(data).length === 0) {
        return { name: isEmployee.name, message: "Already registered" };
      }
      const { break: breakTime, total: totalTime } = AttendanceService.calculateBreakAndTotalTime(isPresent) || {};

      await AppDataSource.getRepository(AttendanceLogEntity).update({ user: { id: isEmployee.id }, date: date }, { ...data, break: breakTime, total: totalTime });
      return { name: isEmployee.name, message: date };


    } else {
      let foundMatch = false;

      for (let i = 0; i < timeConstants.length && !foundMatch; i++) {
        const timeConstant = timeConstants[i];
        const tolerance = tolerances[i];

        if (withinTolerance(timeConstant, tolerance)) {
          data[`time${i + 1}`] = time;
          foundMatch = true;
        }
      }
      if (Object.keys(data).length === 0) {
        return { name: isEmployee.name, message: "Check the time" };
      }
      const log = new AttendanceLogEntity();
      log.user = isEmployee;
      await AppDataSource.getRepository(AttendanceLogEntity).save({ user: isEmployee, ...data, date: date });
      return { name: isEmployee.name, message: `Time:${time}` };

    }

    function withinTolerance(timeConstant, tolerance) {
      const difference = Math.abs(AttendanceService.getTimeInSeconds(time) - timeConstant);
      return difference <= tolerance;
    }
  }


  static calculateBreakAndTotalTime(schedule) {
    const { time1, time2, time3, time4 } = schedule;

    // Case: time1 is null
    if (time1 === null) {
      if (time4 === null || time3 === null) {
        return { break: null, total: null };
      }
      const time3InSeconds = AttendanceService.getTimeInSeconds(time3);
      const time4InSeconds = AttendanceService.getTimeInSeconds(time4);
      const total = time4InSeconds - time3InSeconds;
      return { break: AttendanceService.formatTime(total), total: AttendanceService.formatTime(total) };
    }

    // Case: time2 is null
    if (time2 === null) {
      if (time4 === null || time3 === null) {
        return { break: null, total: null };
      }
      const time3InSeconds = AttendanceService.getTimeInSeconds(time3);
      const time4InSeconds = AttendanceService.getTimeInSeconds(time4);
      const total = time4InSeconds - time3InSeconds;
      return { break: null, total: AttendanceService.formatTime(total) };
    }

    // Case: time3 is null
    if (time3 === null) {
      if (time2 === null || time1 === null) {
        return { break: null, total: null };
      }
      const time1InSeconds = AttendanceService.getTimeInSeconds(time1);
      const time2InSeconds = AttendanceService.getTimeInSeconds(time2);
      const total = time2InSeconds - time1InSeconds;
      return { break: null, total: AttendanceService.formatTime(total) };
    }

    // Case: time4 is null
    if (time4 === null) {
      if (time2 === null || time1 === null) {
        return { break: null, total: null };
      }
      const time1InSeconds = AttendanceService.getTimeInSeconds(time1);
      const time2InSeconds = AttendanceService.getTimeInSeconds(time2);
      const time3InSeconds = AttendanceService.getTimeInSeconds(time3);
      const breakTimeInSeconds = time3InSeconds - time2InSeconds;
      const total = time2InSeconds - time1InSeconds;
      return { break: AttendanceService.formatTime(breakTimeInSeconds), total: AttendanceService.formatTime(total) };
    }

    // All times provided
    const time1InSeconds = AttendanceService.getTimeInSeconds(time1);
    const time2InSeconds = AttendanceService.getTimeInSeconds(time2);
    const time3InSeconds = AttendanceService.getTimeInSeconds(time3);
    const time4InSeconds = AttendanceService.getTimeInSeconds(time4);

    // Modified logic for total time considering null values
    let total;
    if (time4 === null || time3 === null) {
      total = time4InSeconds - time3InSeconds;
    } else if (time3 === null || time2 === null) {
      total = time3InSeconds - time2InSeconds;
    } else {
      total = (time2InSeconds - time1InSeconds) + (time4InSeconds - time3InSeconds);
    }

    const breakTimeInSeconds = time3InSeconds - time2InSeconds;
    return { break: AttendanceService.formatTime(breakTimeInSeconds), total: AttendanceService.formatTime(total) };
  }


}

