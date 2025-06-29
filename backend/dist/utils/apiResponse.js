"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponseUtil = void 0;
class ApiResponseUtil {
    static success(res, data, message, statusCode = 200) {
        const response = {
            success: true,
            data,
            message
        };
        res.status(statusCode).json(response);
    }
    static error(res, message, statusCode = 500, error) {
        const response = {
            success: false,
            message,
            error
        };
        res.status(statusCode).json(response);
    }
    static paginated(res, data, page, limit, total, message) {
        const totalPages = Math.ceil(total / limit);
        const response = {
            success: true,
            data,
            message,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
        res.status(200).json(response);
    }
    static notFound(res, resource = 'Resource') {
        this.error(res, `${resource} not found`, 404);
    }
    static badRequest(res, message) {
        this.error(res, message, 400);
    }
    static unauthorized(res, message = 'Unauthorized') {
        this.error(res, message, 401);
    }
    static forbidden(res, message = 'Forbidden') {
        this.error(res, message, 403);
    }
}
exports.ApiResponseUtil = ApiResponseUtil;
//# sourceMappingURL=apiResponse.js.map