import { Request, Response } from "express";
import * as ExcelJS from "exceljs"; // Import exceljs
import { AppDataSource } from "../data-source";
import { UserEntity } from "../entity/User.entity";
import { TimeCalculate } from "../helpers/time";
import { Not } from "typeorm";

export class Report {
  static async renderReport(req, res) {
    let startDate = ``;
    let endDate = ``;
    let totalDays;
    if (req.query.fromdate && req.query.todate && req.query.totalDays) {
      startDate = req.query.fromdate;
      endDate = req.query.todate;
      totalDays = Number(req.query.totalDays);
    } else {
      startDate = await TimeCalculate.getDate();
      endDate = await TimeCalculate.getDate();
      totalDays = 22;
    }
    try {
      const employees = await AppDataSource.getRepository(UserEntity).find({
        relations: ["log"],
        where: {
          role: Not("admin"),
        },
      });

      const dates = getAllDates(startDate, endDate);

      const headers = ["Name", ...dates, "Working Days","Work Form Office","Work From Home","Absent Days","Present Days"];

      const rows = employees.map((employee) => {
        const attendanceData = {};
        dates.forEach((date) => {
          attendanceData[date] = "Absent"; // Default value
        });

        // Populate attendance data for the current employee
        employee.log.forEach((log) => {
          if (attendanceData.hasOwnProperty(log.date)) {
            attendanceData[log.date] = log.type; // Update with actual log type
          }
        });

        const WFHCount = dates.reduce((count, date) => {
          return attendanceData[date] === 'WFH' ? count + 1 : count;
      }, 0);

      const WFOCount = dates.reduce((count, date) => {
        return attendanceData[date] === 'WFO' ? count + 1 : count;
    }, 0);

        // Return employee data
        return [employee.name, ...dates.map((date) => attendanceData[date]),totalDays,WFOCount,WFHCount,,totalDays-(WFHCount+WFOCount),WFHCount+WFOCount ];
      });

      // Render the view with headers and rows data
      res.render("logreport", { header: headers, data: rows });
    } catch (error) {
      console.error("Error generating attendance report:", error);
      res.status(500).send("Error generating attendance report");
    }
  }

  static async userReport(req: Request, res: Response) {
    let startDate = ``;
    let endDate = ``;
    if (req.query.fromdate && req.query.todate) {
      startDate = req.query.fromdate.toString();
      endDate = req.query.todate.toString();
    } else {
      startDate = await TimeCalculate.getDate();
      endDate = await TimeCalculate.getDate();
    }
    const name = startDate + "to" + endDate;

    // Fetch all users with their attendance logs
    const employees = await AppDataSource.getRepository(UserEntity).find({
      relations: ["log"],
      where: {
        role: Not("admin"),
      },
    });

    // Function to fetch all dates between startDate and endDate
    function getAllDates(startDate, endDate) {
      const dateArray = [];
      let currentDate = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(currentDate.getTime()) || isNaN(end.getTime())) {
        throw new Error(
          "Invalid date format. Please provide dates in YYYY-MM-DD format."
        );
      }

      while (currentDate <= end) {
        dateArray.push(formatDate(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return dateArray;
    }

    // Function to format date as YYYY-MM-DD
    function formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    // const startDate = "2081-03-10";
    // const endDate = "2081-03-20";
    const dates = getAllDates(startDate, endDate);

    // Create a new workbook and worksheet using exceljs
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance Report");

    // Prepare headers dynamically
    const headers = ["Name", ...dates];

    // Add headers to the worksheet
    worksheet.addRow(headers);

    // Prepare transformed data for all employees
    employees.forEach((employee) => {
      const attendanceData = {};
      dates.forEach((date) => {
        attendanceData[date] = "Absent";
      });

      // Populate attendance data for the current employee
      employee.log.forEach((log) => {
        if (attendanceData.hasOwnProperty(log.date)) {
          attendanceData[log.date] = log.type;
        }
      });

      // Add employee data to the worksheet
      worksheet.addRow([
        employee.name,
        ...dates.map((date) => attendanceData[date]),
      ]);
    });

    // Set red background color for cells with value '-'
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (cell.value === "Absent") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF0000" }, // Red background color
          };
        }
        if (cell.value === "WFO") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "00ff00" }, // Red background color
          };
        }
      });
    });

    // Generate buffer and send as response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${name}.xlsx`);

    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  }
}

// Function to fetch all dates between startDate and endDate
function getAllDates(startDate, endDate) {
  const dateArray = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(currentDate.getTime()) || isNaN(end.getTime())) {
    throw new Error(
      "Invalid date format. Please provide dates in YYYY-MM-DD format."
    );
  }

  while (currentDate <= end) {
    dateArray.push(formatDate(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateArray;
}

// Function to format date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
