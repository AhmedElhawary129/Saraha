import cors from "cors";
import connectionDB from "./DB/connectionDB.js";
import messageRouter from "./modules/messages/message.controller.js";
import userRouter from "./modules/users/user.controller.js";
import { globalErrorHandler } from "./utils/error/index.js";

// limiter
const limiter = rateLimit({
    limit : 5,
    windowMs : 60 * 1000,
    message : {Error : "Try Again Later"},
    statusCode : 429,
    handler : (req, res, next) => {
        return next(new AppError("Try Again Later", 429))
    }
})

const bootstrap = (app, express) => {

    // use cors middleware
    app.use(cors());

    // limiter
    app.use(limiter)

    // parse incoming data
    app.use(express.json());

    // home route
    app.get("/", (req, res, next) => {
        return res.status(200).json({ msg: "Welcome to Saraha" });
    });

    // DB connection
    connectionDB();

    // routes
    app.use("/users", userRouter);
    app.use("/messages", messageRouter)

    // handle URL errors
    app.use((req, res, next) => {
        return next(new Error(`Invalid URL ${req.originalUrl}`, { cause: 404 }));
    });

    // global error handler
    app.use(globalErrorHandler);
};

export default bootstrap;
