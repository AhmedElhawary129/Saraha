import messageModel from "../../DB/models/message.model.js";
import userModel from "../../DB/models/user.model.js";
import { asyncHandler } from "../../utils/index.js";


// send message
export const sendMessage = asyncHandler(async(req, res, next) => {
    const {content} = req.body
    const {userId} = req.params

    // check if user exists
    if (!await userModel.findOne({_id: userId, isDeleted: false})) {
        return next(new Error("User not found or deleted", {cause: 404}))
    }

    // send message
    const message = await messageModel.create({content, userId})
    return res.status(201).json({msg: "Message sent", message})
})

//----------------------------------------------------------------------------------------------------------------

// get messages
export const getMessages = asyncHandler(async(req, res, next) => {
    // get messages
    const messages = await messageModel.find({userId: req.user._id}).select("content createdAt -_id")
    .populate([
        {path: "userId", select: "name email -_id"}
    ])
    return res.status(201).json({msg: "Done", messages: messages})
})