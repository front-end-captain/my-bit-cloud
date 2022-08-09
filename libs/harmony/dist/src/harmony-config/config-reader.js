"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readConfigFile = void 0;
const comment_json_1 = require("comment-json");
const fs_extra_1 = require("fs-extra");
const read_config_error_1 = require("./exceptions/read-config-error");
function readConfigFile(path, mustExist = true) {
    if (!mustExist && !(0, fs_extra_1.existsSync)(path)) {
        return {};
    }
    try {
        const json = (0, comment_json_1.parse)((0, fs_extra_1.readFileSync)(path, 'utf8'));
        delete json.$schema;
        return json;
    }
    catch (err) {
        throw new read_config_error_1.ReadConfigError(path, err);
    }
}
exports.readConfigFile = readConfigFile;
