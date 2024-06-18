import { Request, Response, response } from "express";
import { AppDataSource } from "../data-source";
import { UserEntity } from "../entity/User.entity";
import { encrypt } from "../helpers/encrypt";
import * as cache from "memory-cache";
import { POSITION_ENUM } from "../common/common.enum";
import { AttendanceLogEntity } from "../entity/AttendanceLog.entity";
import { TimeCalculate } from "../helpers/time";
import { AttendanceService } from "../service/attendance";
import { ILike } from "typeorm";
import { DeleteFileService } from "../service/deletefile";

export class UserController {

  constructor() {
  }

  static renderLogin(req: Request, res: Response) {
    var message = null
    if (req.query.error) {
      message = req.query.error
    }
    res.render("login", { message })
  }

  static async renderDashboard(req: Request, res: Response) {
    const aajha = await TimeCalculate.getDate()

    const present = await AppDataSource.getRepository(AttendanceLogEntity).find({
      where: { date: aajha },
      join: {
        alias: 'attendanceLog',
        leftJoinAndSelect: {
          user: 'attendanceLog.user'
        }
      }
    });

    const presentemployee = present.map(index => ({ profileUrl: index.user.profileUrl, id: index.user.id, name: index.user.name }));
    const total = await AppDataSource.getRepository(UserEntity).find({ where: { role: 'user' }, select: ['id', 'profileUrl', 'name'] });
    const absentemployee = total.filter(user =>
      !presentemployee.some(present =>
        present.id === user.id)).map(user =>
          ({ id: user.id, profileUrl: user.profileUrl, name: user.name }));
    res.render("dashboard", { total: total, present: presentemployee, absent: absentemployee })
  }

  static async renderEmployee(req: Request, res: Response) {
    let condition: any = { role: 'user' };
    if (req.query.search) {
      condition.name = ILike(`%${req.query.search}%`);
    }
    const employee = await AppDataSource.getRepository(UserEntity).find({
      where: condition,
      select: ['name', 'profileUrl', 'cardId', 'position', 'phone', 'id'],
      order: {
        name: "ASC"
      }
    });
    res.render("list", { message: "100", data: employee })
  }

  static async renderAdmins(req: Request, res: Response) {
    const employee = await AppDataSource.getRepository(UserEntity).find({
      where: { role: 'admin' },
      select: ['name', 'profileUrl', 'cardId', 'position', 'phone', 'id'],
      order: {
        name: "ASC"
      }
    });
    res.render("list", { message: "100", data: employee })
  }

  static renderRegister(req: Request, res: Response) {
    const positionArray = Object.entries(POSITION_ENUM).map(([name, id]) => ({ id, name }));
    res.render("register", { position: positionArray })
  }


  static async signup(req: Request, res: Response) {
    if (req.file) {
      req.body.image = req.file.filename;
    }
    const { name, email, password, role, cardId, position, phone, dob, address, image, gender } = req.body;
    const encryptedPassword = await encrypt.encryptpass(password);
    const user = new UserEntity();
    user.name = name;
    user.email = email;
    user.password = encryptedPassword;
    user.role = role;
    user.cardId = cardId;
    user.position = position;
    user.phone = phone;
    user.dob = dob;
    user.address = address;
    user.profileUrl = image;
    user.gender = gender;

    const userRepository = AppDataSource.getRepository(UserEntity);
    await userRepository.save(user);
    res.redirect("/register")
  }



  static async getUsers(req: Request, res: Response) {
    const data = cache.get("data");
    if (data) {
      console.log("serving from cache");
      return res.status(200).json({
        data,
      });
    } else {
      console.log("serving from db");
      const userRepository = AppDataSource.getRepository(UserEntity);
      const users = await userRepository.find();

      cache.put("data", users, 6000);
      return res.status(200).json({
        data: users,
      });
    }
  }

  static async renderUserEdit(req: Request, res: Response) {
    const positionArray = Object.entries(POSITION_ENUM).map(([name, id]) => ({ id, name }));
    const getUser = await AppDataSource.getRepository(UserEntity).findOne({ where: { id: String(req.query.id) } });
    res.render("userEdit", { user: getUser, position: positionArray })
  }



  static async renderManualEntry(req: Request, res: Response) {
    const getUser = await AppDataSource.getRepository(UserEntity).find({ where: { role: 'user' }, select: ['id', 'name', 'cardId', 'profileUrl'] });
    res.render("manualEntry", { user: getUser })
  }

  static async ManualEntry(req: Request, res: Response) {
    const data = {
      "id": parseInt(req.body.cardId),
      "date": req.body.date,
      "time": req.body.time
    }
    await AttendanceService.attendanceEntry(data);

    return res.redirect('/manual-entry?message=${update.message)')
  }

  static async getProfile(req: Request, res: Response) {
    const employeeDetails = await AppDataSource.getRepository(UserEntity).findOne({
      where: { id: req.params.id },
      select: ['name', 'cardId', 'position', 'id', 'gender', 'phone', 'address', 'dob', 'profileUrl', 'email']
    })
    const perPage = 5;
    const page = typeof req.query.page === 'string' ? parseInt(req.query.page) || 1 : 1;
    const condition: any = { user: employeeDetails }
    if (req.query.date) {
      condition.date = req.query.date
    }
    const attendance = await AppDataSource.getRepository(AttendanceLogEntity).count({ where: { user: employeeDetails } })

    const logDetails = await AppDataSource.getRepository(AttendanceLogEntity).find({
      where: condition,
      order: {
        date: "DESC"
      }, take: perPage, skip: perPage * (page - 1)

    })
    res.render("profile", { data: employeeDetails, log: logDetails, attendance: attendance })
  }


  static async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const userRepository = AppDataSource.getRepository(UserEntity);
    const user: UserEntity = await userRepository.findOne({
      where: { id },
    });
    if (req.file) {
      await DeleteFileService.deleteimage(user.profileUrl ? user.profileUrl : "")
      req.body.profileUrl = req.file.filename;
    }
    Object.assign(user, req.body);
    const encryptedPassword = await encrypt.encryptpass(req.body.password);
    user.password = encryptedPassword;
    await userRepository.save(user);
    return res.redirect(`/employee/${id}`)
  }

  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    const logRepository = AppDataSource.getRepository(AttendanceLogEntity)
    const userlog = await logRepository.findOne({
      where: { user: { id: id } }
    });
    if (userlog) {
      await logRepository.remove(userlog);
    }
    const userRepository = AppDataSource.getRepository(UserEntity);
    const user = await userRepository.findOne({
      where: { id },
    });
    await userRepository.remove(user);
    res.redirect('/employee')
  }
}