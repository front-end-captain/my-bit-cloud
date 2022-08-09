"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeNotDefined = void 0;
class RuntimeNotDefined extends Error {
    constructor(name) { super(`runtime: '${name}' was not defined by any aspect`); }
}
exports.RuntimeNotDefined = RuntimeNotDefined;