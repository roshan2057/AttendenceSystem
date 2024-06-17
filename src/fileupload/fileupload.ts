import multer = require("multer");
import path = require("path");

// Set up storage for uploaded files
const storage: multer.StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/Avtar/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
});

export default upload;
