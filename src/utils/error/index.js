// error handler
export const asyncHandler = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch((error) => {
            return next(error);
        });
    }
}

//----------------------------------------------------------------------------------------------------------------

// global error handler
export const globalErrorHandler = (error, req, res, next) => {
        res.status(error["cause"] || 500).json({
            msg: "Error",
            message: error.message,
            stack: error.stack,
        });
    }