import path from "path";
import multer from "multer";
import AppError from "../utils/AppError";


const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 50 * 1024 * 1024},  // 50 MB in max size
    storage: multer.diskStorage({
        destination: "uploads/",
        filename: (_req, file, cb) => {
            cb(null, file.originalname)
        }
    }),
    fileFilter: (_req, file, cb) => {
        let ext = path.extname(file.originalname);

        if(
            ext !== ".jpg" &&
            ext !== ".jpeg" &&
            ext !== ".png" &&
            ext !== ".mp4" &&
            ext !== ".webp"
        ){
            cb(new AppError(`unsupported file type ${ext}`, false))
            return;
        }
        cb(null, true)
    }
});

export default upload;