import joi from "joi"
import { generalRules } from "../../utils/generalRules/index.js"
import { enumGender } from "../../DB/models/user.model.js"


export const signUpSchema = {
    body: joi.object({
        name: joi.string().alphanum().min(3).max(30).required().messages({
            "string.empty": "Name is required",
            "string.min": "Name must be at least 3 characters long",
            "string.max": "Name must be at most 30 characters long"
        }),
        email: generalRules.email,
        password: generalRules.password,
        cPassword: joi.string().valid(joi.ref("password")).required(),
        phone: joi.string().regex(/^01[0125][0-9]{8}$/).required(),
        gender: joi.string().valid(enumGender.male, enumGender.female, enumGender.other).required()
    })
}

//----------------------------------------------------------------------------------------------------------------

export const signInSchema = {
    body: joi.object({
        email: generalRules.email,
        password: generalRules.password
    }).required()
}

//----------------------------------------------------------------------------------------------------------------

export const updateProfileSchema = {
    body: joi.object({
        name: joi.string().alphanum().min(3).max(30),
        gender: joi.string().valid(enumGender.male, enumGender.female, enumGender.other),
        phone: joi.string().regex(/^01[0125][0-9]{8}$/)
    }).required(),
    headers: generalRules.headers.required()
}

//----------------------------------------------------------------------------------------------------------------

export const updatePasswordSchema = {
    body: joi.object({
        oldPassword: generalRules.password.required(),
        newPassword: generalRules.password.required(),
        cPassword: generalRules.password.valid(joi.ref("newPassword")).required(),
    }).required(),
    headers: generalRules.headers.required()
}

//----------------------------------------------------------------------------------------------------------------

export const freezeAccountSchema = {
    headers: generalRules.headers.required()
}

//----------------------------------------------------------------------------------------------------------------

export const unFreezeAccountSchema = {
    body: joi.object({
        email: generalRules.email.required()
    }).required()
}

//----------------------------------------------------------------------------------------------------------------

export const shareProfileSchema = {
    params: joi.object({
        id: generalRules.objectId.required()
    }).required()
}