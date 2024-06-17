import { AppDataSource } from "./data-source";
import * as express from "express";
import * as dotenv from "dotenv";
import { Request, Response } from "express";
import { userRouter } from "./routes/user.routes";
import "reflect-metadata";
import { errorHandler } from "./middleware/error.middleware";
import path = require("path");
import cookieParser = require("cookie-parser");
import { AttendanaceController } from "./controllers/attendance.controller";
import { deviceAuth } from "./middleware/device.middleware";
import { AdminSeed } from "./seeds/adminSeed";
dotenv.config();


const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(errorHandler);

app.set('view engine', 'ejs')
app.set('views', path.resolve('./src/views'))

app.use('/avtar', express.static('public/Avtar'))

const { PORT = 3000 } = process.env;
app.use("/", userRouter);
app.post("/attendance", deviceAuth, AttendanaceController.attendance);


app.get("*", (req: Request, res: Response) => {
  res.status(505).json({ message: "Bad Request" });
});



AppDataSource.initialize()
  .then(async () => {
    if (process.env.SEED_DB == "TRUE") {
      await AdminSeed.insert();
    }
    app.listen(PORT, () => {
      console.log("Server is running on http://localhost:" + PORT);
    });
    console.log("Data Source has been initialized!");
  })
  .catch((error) => console.log(error));