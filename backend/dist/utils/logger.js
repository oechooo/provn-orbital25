"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInfo = logInfo;
exports.logError = logError;
exports.logWarn = logWarn;
function logInfo(message) {
    if (process.env.NODE_ENV !== 'production') {
        console.log(message);
    }
}
function logError(message, error) {
    console.error(message, error);
}
function logWarn(message) {
    console.warn(message);
}
