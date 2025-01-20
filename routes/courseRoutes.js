import { Router } from "express";

// Importing course countollers
import { 
          addLecturesToCourseById, 
          createCourse, 
          deleteCourseById, 
          getAllCourses, 
          getLecturesByCourseId, 
          removeLectureFromCourse, 
          updateCourseById 
        } from "../controllers/courseController.js";

// importing all the middlewares from authMiddleware.js 
import { 
        authorizedRoles,   
        authorizedSubscribers, 
        isLoggedIn } from "../middlewares/authMiddleware.js";
        
// Importin multer middleware to upload thumbnails and lectures
import upload from "../middlewares/multerMiddleware.js";

const router = Router();

router.route('/')
    .get(getAllCourses)
    .post(isLoggedIn, authorizedRoles(['ADMIN', 'SUPERADMIN']), upload.single('thumbnail'), createCourse)
    .delete(isLoggedIn, authorizedRoles(['ADMIN', 'SUPERADMIN']), removeLectureFromCourse);

router.route('/:id')
    .get(isLoggedIn, authorizedSubscribers, getLecturesByCourseId)
    .post(isLoggedIn, authorizedRoles(['ADMIN', 'SUPERADMIN']), upload.single('lecture'), addLecturesToCourseById)
    .put(isLoggedIn, authorizedRoles(['ADMIN', 'SUPERADMIN']), updateCourseById)
    .delete(isLoggedIn, authorizedRoles(['ADMIN', 'SUPERADMIN']), deleteCourseById);


export default router

