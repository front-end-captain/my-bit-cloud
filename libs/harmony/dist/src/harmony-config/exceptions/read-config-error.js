"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadConfigError = void 0;
class ReadConfigError extends Error {
    constructor(path, err) {
        super(`failed to read config from path: ${path}`);
        this.err = err;
    }
    get stack() {
        return this.err.stack;
    }
}
exports.ReadConfigError = ReadConfigError;
