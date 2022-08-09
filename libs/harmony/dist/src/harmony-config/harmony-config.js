"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HarmonyConfig = void 0;
const comment_json_1 = require("comment-json");
const path_1 = require("path");
const config_reader_1 = require("./config-reader");
const userHome = require('user-home');
const defaultConfig = {
    cwd: process.cwd(),
    shouldThrow: true,
};
class HarmonyConfig {
    constructor(raw) {
        this.raw = raw;
    }
    toObject() {
        return this.raw;
    }
    toString() {
        return (0, comment_json_1.stringify)(this.raw);
    }
    static load(fileName, opts) {
        const mergedOpts = Object.assign(defaultConfig, opts);
        const config = (0, config_reader_1.readConfigFile)((0, path_1.join)(mergedOpts.cwd, fileName), mergedOpts.shouldThrow);
        if (mergedOpts.global) {
            return HarmonyConfig.loadGlobal(mergedOpts.global, config);
        }
        return new HarmonyConfig(config);
    }
    static loadGlobal(globalOpts, config = {}) {
        const globalConfig = (0, config_reader_1.readConfigFile)((0, path_1.join)(globalOpts.dir || userHome, globalOpts.name), false);
        return new HarmonyConfig((0, comment_json_1.assign)(config, globalConfig));
    }
}
exports.HarmonyConfig = HarmonyConfig;