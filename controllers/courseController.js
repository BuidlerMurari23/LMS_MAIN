import asyncHandler from "../middlewares/asyncHandlerMiddleware.js";
import Course from "../models/courseModel.js";
import AppError from "../utils/AppError.js";
import fs from "fs/promises";
import path from "path";
import cloudinary from "cloudinary";



const getAllCourses = asyncHandler( async (_req, res, next) => {
    try {
        const courses = await Course.find({}).select('-lectures');
    
        res.status(200).json({
            success: true,
            message: "All courses.",
            courses,
        })
        
    } catch (e) {
        return next(new AppError(e.message, 404))
    }
});


const createCourse = asyncHandler( async (req, res, next) => {
try {
    const { title, description, category, createdBy } = req.body;
    
    if(!title || !description || !category || !createdBy){
        return next(new AppError("All fields are required", 400))
    }
    
    const course = await Course.create({
        title,
        description,
        category,
        createdBy,
    });
    
    if(!course){
        return next(new AppError("Course could not be created. Please try again.", 400))
    }

    if(req.file){
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: "lms course"
            });

            if(result){
                course.thumbnail.public_id = result.public_id;
                course.thumbnail.secure_url = result.secure_url;
            }

            fs.rm(`uploads/${req.file.filename}`)
                
        } catch (e) {
            return next(new AppError(e.message || "File not uploaded. Please try again.", 403))
        }

        await course.save();

        res.status(200).json({
            success: true,
            message: "Course created successfully.",
            course,
        })
    }
} catch (e) {
    return next(new AppError(e.message, 404))
}

});


const getLecturesByCourseId = asyncHandler( async (req, res, next) => {
    try {
        const { id } = req.params;
    
        const course = await Course.findById(id);
    
        if(!course){
            return next(new AppError(`Course doesnot exist by id: ${id}`, 400))
        }

        res.status(200).json({
            success: true,
            message: `Course lectures fetched successfully by id: ${id}`,
            lectures: course.lectures,
        })
        
    } catch (e) {
        return next(new AppError(e.message, 404))
    }
    
});


const addLecturesToCourseById = asyncHandler( async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        if(!title || !description){
            return next(new AppError("Title and Description are required.", 400))
        }

        const course = await Course.findById(id);

        if(!course){
            return next(new AppError(`Course does not exists with id: ${id}`, 400))
        }

        if(req.file){
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: "lms lectures",
                    chunk_size: 50000000,
                    resource_type: "video",
                });

                if(result){
                    lecture.public_id = result.public_id;
                    lecture.secure_url = result.secure_url;
                }

                fs.rm(`uploads/${req.file.filename}`)
            } catch (e) {
                return next(new AppError(e.message || "File not uploaded. Please try again.", 403))
            }
        }
         
        course.lectures.push({
            title,
            description,
            lecture,
        })

        course.numberOfLectures = course.lectures.length;

        res.status(200).json({
            success: true,
            message: `Course lecture added successfully with id: ${id}`,
            course,
        })

    } catch (e) {
        return next(new AppError(e.message, 404))
    }
});



const removeLectureFromCourse = asyncHandler( async (req, res, next) => {
    try {
        const { courseId, lectureId } = req.params;

        if(!courseId){
            return next(new AppError("Course Id is required", 400))
        }

        if(!lectureId){
            return next(new AppError("Lecture Id is required", 400))
        }

        const course = await Course.findById(courseId);

        if(!course){
            return next(new AppError(`Course doesnot exists with courseId: ${courseId}`, 400))
        }

        const lectureIndex = course.lectures.findIndex(
            (lecture) => lecture._id.toString() == lectureId.toString()
        )

        if(lectureIndex === -1){
            return next(new AppError(`Lecture doesnot exist with lectureId: ${lectureId}`, 400))
        }

        await cloudinary.v2.uploader.destroy(course.lectures[lectureIndex].lecture.public_id,{
            resource_type: "video"
        });

        course.lectures.splice(lectureIndex, 1);
        course.numberOfLectures = course.lectures.length;

        await course.save();

        res.status(200).json({
            success: true,
            message: `Lecture is deleted successfully with lectureId: ${lectureId}`
        });

    } catch (e) {
        return next(new AppError(e.message, 404))
    }
});


const updateCourseById = asyncHandler( async (req, res, next) => {
    try {
        const { id } = req.params;

        const course = await Course.findByIdAndUpdate(
            id,
            {
                $set: req.body,
            },
            {
                runValidators: true,
            },
        );

        if(!course){
            return next(new AppError(`Course doesnot exists with courseId: ${id}`, 400))
        }

        res.status(200).json({
            success: true,
            message: `Course is updated successfully with courseId: ${id}`,
            course,
        })
    } catch (e) {
        return next(new AppError(e.message, 404))
    }
});


const deleteCourseById = asyncHandler( async (req, res, next) => {
    try {
        const { id } = req.params;

        const course = await Course.findByIdAndDelete(id);

        if(!course){
            return next(new AppError(`Course doesnot exist with courseId: ${id}`, 400))
        }

        res.status(200).json({
            success: true,
            message: `Course is deleted successfully with courseId: ${id}`
        });

    } catch (e) {
        return next(new AppError(e.message, 404))
    }
});


export {
    getAllCourses,
    createCourse,
    getLecturesByCourseId,
    addLecturesToCourseById,
    removeLectureFromCourse,
    updateCourseById,
    deleteCourseById
}




    




