/**
 * Response handler utility for consistent API responses
 */

/**
 * Success response handler
 * @param {Object} res - Express response object
 * @param {*} data - Data to send in the response
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

/**
 * Error response handler
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} error - Error object or additional error data
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 500, error = null) => {
    const response = {
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error?.message || error : undefined,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    };

    return res.status(statusCode).json(response);
};

/**
 * Not found response handler
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Resource not found')
 */
const notFoundResponse = (res, message = 'Resource not found') => {
    return errorResponse(res, message, 404);
};

/**
 * Validation error response handler
 * @param {Object} res - Express response object
 * @param {Object} errors - Validation errors
 * @param {string} message - Error message (default: 'Validation failed')
 */
const validationErrorResponse = (res, errors, message = 'Validation failed') => {
    return res.status(400).json({
        success: false,
        message,
        errors
    });
};

/**
 * Unauthorized response handler
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Unauthorized')
 */
const unauthorizedResponse = (res, message = 'Unauthorized') => {
    return errorResponse(res, message, 401);
};

/**
 * Forbidden response handler
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Forbidden')
 */
const forbiddenResponse = (res, message = 'Forbidden') => {
    return errorResponse(res, message, 403);
};

/**
 * Send success response (alias for compatibility with existing code)
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {*} data - Data to send in the response
 * @param {string} message - Success message (default: 'Success')
 * @param {*} meta - Optional metadata
 */
const sendSuccess = (res, statusCode = 200, data = null, message = 'Success', meta = null) => {
    const payload = { success: true, message, data };
    if (meta) payload.meta = meta;
    return res.status(statusCode).json(payload);
};

/**
 * Send error response (alias for compatibility with existing code)
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} message - Error message (default: 'Server Error')
 * @param {*} error - Error object or additional error data
 */
const sendError = (res, statusCode = 500, message = 'Server Error', error = null) => {
    const payload = { success: false, error: message };
    if (error && process.env.NODE_ENV !== 'production') payload.details = error;
    return res.status(statusCode).json(payload);
};

module.exports = {
    successResponse,
    errorResponse,
    notFoundResponse,
    validationErrorResponse,
    unauthorizedResponse,
    forbiddenResponse,
    sendSuccess,
    sendError
};
