import * as express from "express";
import { AuthController } from "../controllers/auth.controller";
import { authentification, authorization } from "../middleware/auth.middleware";
import { UserController } from "../controllers/user.controller";
import upload from "../fileupload/fileupload";
import { ExcelController } from "../controllers/excel.controller";
const Router = express.Router();


Router.get("/login", UserController.renderLogin);
Router.get("/dashboard", authentification, authorization(['admin']), UserController.renderDashboard)
Router.get("/employee", authentification, authorization(["admin"]), UserController.renderEmployee)
Router.get("/register", authentification, authorization(["admin"]), UserController.renderRegister)
Router.get("/admin", authentification, authorization(["admin"]), UserController.renderAdmins)
Router.get("/employee/:id", authentification, authorization(["admin"]), UserController.getProfile);
Router.get("/edit", authentification, authorization(["admin"]), UserController.renderUserEdit);
Router.get("/manual-entry", authentification, authorization(["admin"]), UserController.renderManualEntry);
Router.get("/delete/:id", authentification, authorization(["admin"]), UserController.deleteUser);
Router.get("/logout", AuthController.logout)


Router.post("/login", AuthController.login);
Router.post("/signup", authentification, authorization(["admin"]), upload.single("image"), UserController.signup);
Router.post("/manual-entry", authentification, authorization(["admin"]), UserController.ManualEntry)
Router.post("/edit/:id", authentification, authorization(["admin"]), UserController.updateUser);
Router.post("/download/user-report", authentification, ExcelController.userReport);

// Router.get("/users",authentification,authorization(["admin"]),UserController.getUsers);
// Router.put("/update/:id",authentification,authorization(["user", "admin"]),UserController.updateUser);

Router.get("/profile/:id", authentification, authorization(["user"]), AuthController.getProfile);


export { Router as userRouter };