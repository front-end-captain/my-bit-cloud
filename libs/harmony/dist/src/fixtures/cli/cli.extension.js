"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI = exports.Command = void 0;
const __1 = require("../..");
const __2 = require("../..");
/**
 * hook for registering new CLI commands.
 */
exports.Command = (0, __1.createHook)();
// @Extension()
class CLI {
    constructor() {
        /**
         * registry for the commands hook
         */
        this.commands = __2.HookRegistry.of(exports.Command);
    }
    run() {
        const commands = this.commands.list();
        return commands;
    }
}
exports.CLI = CLI;