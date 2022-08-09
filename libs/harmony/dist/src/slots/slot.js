"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slot = void 0;
const registry_1 = require("./registry");
class Slot {
    static withType() {
        return (registerFn) => {
            return new registry_1.SlotRegistry(registerFn);
        };
    }
}
exports.Slot = Slot;