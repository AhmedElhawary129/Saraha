import { Router } from "express";
import * as US from "./user.service.js";
import { authentication, authorization, roles } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import * as UV from "./user.validation.js";
const userRouter = Router();

// routes
userRouter.post("/signUp", validation(UV.signUpSchema), US.signUp)
userRouter.get("/comfirmEmail/:token", US.comfirmEmail)
userRouter.post("/signIn", validation(UV.signInSchema), US.signIn)
userRouter.get("/profile", authentication, authorization(Object.values(roles)), US.getProfile)
userRouter.patch("/updateProfile", validation(UV.updateProfileSchema),authentication, US.updateProfile)
userRouter.patch("/updatePassword", validation(UV.updatePasswordSchema), authentication,US.updatePassword)
userRouter.delete("/freezeAccount", validation(UV.freezeAccountSchema), authentication,US.freezeAccount)
userRouter.delete("/unFreezeAccount", validation(UV.unFreezeAccountSchema), US.unFreezeAccount)
userRouter.get("/confirmUnFreeze/:token", US.confirmUnFreeze)
userRouter.get("/profile/:id", validation(UV.shareProfileSchema), US.shareProfile)

export default userRouter;