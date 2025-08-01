import { Router } from "express"
import * as MS from "./message.service.js"
import { validation } from "../../middleware/validation.js"
import * as MV from "./message.validation.js"
import { authentication } from "../../middleware/auth.js"
const messageRouter = Router()

// routes
messageRouter.post("/sendMessage/:userId", validation(MV.sendMessageSchema), MS.sendMessage)
messageRouter.get("/getMessages", authentication, MS.getMessages)

export default messageRouter