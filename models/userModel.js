import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema({
    fullName: {
        type: String,
        required: [true, "Name is required"],
        minLength: [3, "Name must be of atleast 3 Characters"],
        maxLenght: [50, "Name should not be more than 50 Characters"],
        lowercase: true,
        trim: true    //removes the un-necessary spaces
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please fill in a valid email address'
        ],
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [8, "Password must be of atleast 8 Characters"],
        select: false
    },
    avatar: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN", "SUPERADMIN"],
        default: "USER"
    },
    subscription: {
        id: String,
        status: String,
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: String

},{
    timestamps: true
});

userSchema.pre('save', async function (next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods = {
    comparePassword: async function (plainPassword){
        return await bcrypt.compare(plainPassword, this.password)
    },
    generateJWTToken: async function (){
        return await jwt.sign(
            {id: this._id, email: this.email, subscription: this.subscription},
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRY,
            }
        );
    },
    generatePasswordResetToken: async function (){
        const resetToken = crypto.randomBytes(20).toString('hex');

        this.forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        this.forgotPasswordExpiry = Date.now() + (15 * 60 * 1000);

        return resetToken;
    }
}


const User = model("User", userSchema);

export default User;