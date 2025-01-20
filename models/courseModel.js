import { Schema, model } from "mongoose";

const courseSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title of the course is requried."],
        minLength: [5, "Title must be of atleast 5 Characters."],
        maxLength: [50, "Title must be less than 50 Characters."],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description of the course is required."],
        minLength: [8, "Description of the course must be of atleast 8 Characters."],
        maxLength: [500, "Description of the course should be less than 500 Characters."],
        trim: true
    },
    category: {
        type: String,
        required: [true, "Category of the course is required for differntiation."],
        trim: true
    },
    thumbnail: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    lectures: [
        {
            title: String,
            description: String,
            lecture: {
                public_id: {
                    type: String
                },
                secure_url: {
                    type: String
                }
            }
        }
    ],
    numberOfLectures: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: String,
        required: [true, "Instructor name who created course is required."],
        trim: true
    }
},{
    timestamps: true
});


const Course = model("Course", courseSchema);


export default Course;