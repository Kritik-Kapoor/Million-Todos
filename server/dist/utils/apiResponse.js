export class ApiResponse {
    statusCode;
    success;
    message;
    data;
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.success = statusCode < 400;
        this.message = message;
        this.data = data;
    }
    send(res) {
        return res.status(this.statusCode).json({
            success: this.success,
            message: this.message,
            data: this.data,
        });
    }
}
export class ApiError extends Error {
    statusCode;
    success;
    errors;
    constructor(statusCode, message = "Something went wrong", errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
    send(res) {
        return res.status(this.statusCode).json({
            success: this.success,
            message: this.message,
            errors: this.errors,
        });
    }
}
export function getErrorMessage(error) {
    return error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
}
