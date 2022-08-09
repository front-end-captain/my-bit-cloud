"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeModuleError = void 0;
class RuntimeModuleError extends Error {
    constructor(err) {
        super(`failed to load Harmony aspect with error message: ${err.message}`);
        this.err = err;
    }
    get stack() {
        return this.err.stack;
    }
}
exports.RuntimeModuleError = RuntimeModuleError;
