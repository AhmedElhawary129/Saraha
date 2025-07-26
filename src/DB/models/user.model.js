import mongoose from "mongoose";
import { roles } from "../../middleware/auth.js";

export const enumGender= {
    male: "male",
    female: "female",
    other: "other"
};

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        lowercase: true,
        minLength: [3, "Name must be at least 3 characters long"],
        maxLength: 30,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,7}$/
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    phone: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: Object.values(enumGender),
        default: enumGender.other
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: Object.values(roles),
        default: roles.user
    },
    passwordChangedAt: Date,
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: true,
        updatedAt: true
    }
});

const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;