import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { encrypt } from "../helpers/encrypt";
import { UserEntity } from "../entity/User.entity";
import { AttendanceLogEntity } from "../entity/AttendanceLog.entity";

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.redirect("/login?error=Email and Password Required")

      }

      const userRepository = AppDataSource.getRepository(UserEntity);
      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        return res.redirect("/login?error=Email not found")
      }

      const isPasswordValid = encrypt.comparepassword(user.password, password);
      if (!isPasswordValid) {
        return res.redirect("/login?error=Password Incorrect")

      }
      const token = encrypt.generateToken({ id: user.id, role: user.role });

      res.cookie('token', token, { maxAge: 9000000, httpOnly: true })
      res.cookie('role', user.role, { maxAge: 9000000 })

      if (user.role == 'user') {
        return res.redirect(`/profile/${user.id}`);
      }

      return res.redirect('/dashboard');
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // static async getProfile(req: Request, res: Response) {
  //   if (!req[" currentUser"]) {
  //     return res.redirect("/login");
  //   }
  //   const userRepository = AppDataSource.getRepository(UserEntity);
  //   const user = await userRepository.findOne({
  //     where: { id: req[" currentUser"].id },
  //   });
  //   return res.status(200).json({ ...user, password: undefined });
  // }


  static async getProfile(req: Request, res: Response) {
    if (!req[" currentUser"]) {
      return res.redirect("/login");
    }
    if (!(req[" currentUser"].id == req.params.id)) {
      return res.redirect("/login?error=Not access");
    }
    const employeeDetails = await AppDataSource.getRepository(UserEntity).findOne({
      where: { id: req.params.id },
      select: ['name', 'cardId', 'position', 'id', 'gender', 'phone', 'address', 'dob', 'profileUrl', 'email'],
      relations:['position']
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
        id: "DESC"
      }, take: perPage, skip: perPage * (page - 1)

    })
    res.render("profile", { data: employeeDetails, log: logDetails, attendance: attendance })
  }

  static async logout(req: Request, res: Response) {
    res.cookie('token', null, { maxAge: 0, httpOnly: true }); // Set token cookie to null and maxAge to 0
    res.clearCookie('role'); // Clear the role cookie
    res.redirect("/login")
  }
}