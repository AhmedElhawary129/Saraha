import jwt from "jsonwebtoken";
import userModel from "../DB/models/user.model.js";
import { asyncHandler } from "../utils/error/index.js";

export const roles = {
  user: "user",
  admin: "admin",
};

// authentication
export const authentication = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;

  const [prefix, token] = authorization?.split(" ") || [];
  if (!prefix || !token) {
    return next(new Error("Token is required", { cause: 400 }));
  }

  let SIGNETURE_TOKEN = undefined;
  if (prefix == "Admin") {
    SIGNETURE_TOKEN = process.env.SIGNETURE_KEY_ADMIN;
  } else if (prefix == "Bearer") {
    SIGNETURE_TOKEN = process.env.SIGNETURE_KEY_USER;
  } else {
    return next(new Error("Invalid token prefix", { cause: 400 }));
  }

  // verify token
  const decoded = jwt.verify(token, SIGNETURE_TOKEN);
  if (!decoded?.id) {
    return next(new Error("Invalid token payload", { cause: 400 }));
  }

  // check if email exists
  const user = await userModel.findById(decoded.id).lean();
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  if (parseInt(user?.passwordChangedAt?.getTime()/1000) > decoded.iat) {
    return next(new Error("Token expired please logIn again", {cause: 401}))
  }

  if (user?.isDeleted) {
    return next(new Error("User Deleted", {cause: 401}))
  }

  req.user = user;
  next();
});

//------------------------------------------------------------------------------

// authorization
export const authorization = (accessRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      return next(new Error("Access denied", { cause: 403 }));
    }
    next();
  });
};
