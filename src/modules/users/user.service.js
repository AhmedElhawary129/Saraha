import messageModel from "../../DB/models/message.model.js";
import userModel from "../../DB/models/user.model.js";
import { asyncHandler, eventEmitter, Hash, Compare, Encrypt, Decrypt, generateToken, verifyToken} from "../../utils/index.js";


// signUp
export const signUp = asyncHandler(async (req, res, next) => {
    const { name, email, password, phone, gender } = req.body;

    // check if email already exists
    const emailExist = await userModel.findOne({ email });
    if (emailExist) {
        return next(new Error("Email already exists", { cause: 409 }));
    }
    // hash password
    const hash = await Hash({ key: password, SALT_ROUNDS: process.env.SALT_ROUNDS });

    // encrypt phone
    const encryptPhone = await Encrypt({
        key: phone,
        SECRET_KEY: process.env.SECRET_KEY,
    });

    // send email
    eventEmitter.emit("sendEmail", { email });

    // create user
    const user = await userModel.create({
        name,
        email,
        password: hash,
        phone: encryptPhone,
        gender,
    });
    return res.status(201).json({ msg: "Account created successfully, please check your email"});
});

//----------------------------------------------------------------------------------------------------------------

// confirm email
export const comfirmEmail = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    if (!token) {
        return next(new Error("Token not found", { cause: 400 }));
    }

    // check if token is valid
    const decoded = await verifyToken({
        token,
        SIGNETURE: process.env.SIGNETURE_EMAIL_CONFIRMATION,
    });
    if (!decoded?.email) {
        return next(new Error("Invalid token payload", { cause: 400 }));
    }

    const user = await userModel.findOneAndUpdate(
        { email: decoded.email, confirmed: false },
        { confirmed: true }
    );
    if (!user) {
            return next(
        new Error("User not found or already confirmed", { cause: 404 })
        );
    }
    return res.status(200).json({ msg: "Email confirmed successfully" });
});

//----------------------------------------------------------------------------------------------------------------

// signIn
export const signIn = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // check if email exists
    const user = await userModel.findOne({ email, confirmed: true });
    if (!user) {
        return next(
        new Error("Email not exist or not confirmed yet", { cause: 404 })
        );
    }

    // check if password is correct
    const match = await Compare({key: password, hashed: user.password });
    if (!match) {
        return next(new Error("Invalid password", { cause: 401 }));
    }

    // generate token
    const token = await generateToken({
        payload: { email, id: user._id },
        SIGNETURE:
        user.role == "user"
            ? process.env.SIGNETURE_KEY_USER
            : process.env.SIGNETURE_KEY_ADMIN,
        option: { expiresIn: "1w" },
    });
    return res.status(200).json({ msg: "Logged in successfully  ", Token: token });
});

//----------------------------------------------------------------------------------------------------------------

// get profile
export const getProfile = asyncHandler(async (req, res, next) => {
    // decrypt phone
    const phone = await Decrypt({
        key: req.user.phone,
        SECRET_KEY: process.env.SECRET_KEY,
    });
    const user = req.user;

    // select keys
    const keysToShow = ["name", "email", "gender", "phone", "role"] 
    const selected = Object.fromEntries(
        keysToShow.map((key) =>[key, user[key]])
    )
    let Profile = selected

    // get messages
    const messages = await messageModel.find({userId: req.user._id}).select("content createdAt -_id")
    return res.status(200).json({ msg: "The User Profile", ...Profile, phone, messages });
});

//----------------------------------------------------------------------------------------------------------------

// update profile
export const updateProfile = asyncHandler(async (req, res, next) => {
    // encrypt phone if exists
    if (req.body.phone) {
        req.body.phone = await Encrypt({
            key: req.body.phone,
            SECRET_KEY: process.env.SECRET_KEY
        })
    }
    // update user
    const user = await userModel.findOneAndUpdate(req.user._id, req.body, {new: true})
    return res.status(200).json({ msg: "Updated", user});
});

//----------------------------------------------------------------------------------------------------------------

// update password
export const updatePassword = asyncHandler(async (req, res, next) => {
    const {oldPassword, newPassword} = req.body;

    // check if old password is correct
    if (!await Compare({key: oldPassword, hashed: req.user.password})) {
        return next(new Error("Invalid old password", {cause: 400}))
    }

    // hash new password
    const hash = await Hash({key: newPassword, SALT_ROUNDS: process.env.SALT_ROUNDS})

    // update password
    const user = await userModel.findOneAndUpdate(
        req.user._id, 
        {password: hash, passwordChangedAt: Date.now()}, 
        {new: true}
    )
    return res.status(200).json({ msg: "password updated"});
});


//----------------------------------------------------------------------------------------------------------------

// freeze account(soft delete)
export const freezeAccount= asyncHandler(async (req, res, next) => {
    const user = await userModel.findByIdAndUpdate(req.user._id, {isDeleted: true})
    return res.status(200).json({ msg: "Account deleted successfully", theDeletedUser: user.email});
});

//----------------------------------------------------------------------------------------------------------------

// unFreeze account
export const unFreezeAccount= asyncHandler(async (req, res, next) => {
    const{email} = req.body;
    // send email
    eventEmitter.emit("unFreezeAccount", {email});
    return res.status(200).json({ msg: "unFreeze message confirmation is sent successfully, Please check your email"});
});

//----------------------------------------------------------------------------------------------------------------

// confirm unFreeze
export const confirmUnFreeze = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    if (!token) {
        return next(new Error("Token not found", { cause: 400 }));
    }

    // check if token is valid
    const decoded = await verifyToken({
        token,
        SIGNETURE: process.env.SIGNETURE_UNFREEZE_CONFIRMATION,
    });
    if (!decoded?.email) {
        return next(new Error("Invalid token payload", { cause: 400 }));
    }

    // soft delete user
    const user = await userModel.findOneAndUpdate(
        { email: decoded.email, isDeleted: true },
        { isDeleted: false }
    );
    if (!user) {
            return next(
        new Error("User not found or already unFrozen", { cause: 404 })
        );
    }
    return res.status(200).json({ msg: "Your account is UnFrozen successfully you can use it now" });
});

//----------------------------------------------------------------------------------------------------------------

// share profile
export const shareProfile = asyncHandler(async (req, res, next) => {
    const {id} = req.params

    const user = await userModel.findById(id).select("name email gender phone role -_id").lean()
    if (!user) {
        return next(new Error("User not found", {cause: 404}))
    }

    // decrypt phone
    const phone = await Decrypt({
        key: user.phone,
        SECRET_KEY: process.env.SECRET_KEY,
    });

    return res.status(200).json({ msg: "The User Profile", ...user, phone });
});