"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AspectGraph = exports.RuntimeDefinition = exports.Aspect = exports.HarmonyError = exports.SlotRegistry = exports.Slot = exports.Harmony = exports.createHook = exports.provider = exports.hook = exports.HookRegistry = exports.register = exports.Extension = exports.ExtensionDecorator = void 0;
var extension_1 = require("./extension");
Object.defineProperty(exports, "ExtensionDecorator", { enumerable: true, get: function () { return extension_1.ExtensionDecorator; } });
Object.defineProperty(exports, "Extension", { enumerable: true, get: function () { return extension_1.Extension; } });
Object.defineProperty(exports, "register", { enumerable: true, get: function () { return extension_1.register; } });
Object.defineProperty(exports, "HookRegistry", { enumerable: true, get: function () { return extension_1.HookRegistry; } });
Object.defineProperty(exports, "hook", { enumerable: true, get: function () { return extension_1.hook; } });
Object.defineProperty(exports, "provider", { enumerable: true, get: function () { return extension_1.provider; } });
Object.defineProperty(exports, "createHook", { enumerable: true, get: function () { return extension_1.createHook; } });
var harmony_1 = require("./harmony");
Object.defineProperty(exports, "Harmony", { enumerable: true, get: function () { return harmony_1.Harmony; } });
var slots_1 = require("./slots");
Object.defineProperty(exports, "Slot", { enumerable: true, get: function () { return slots_1.Slot; } });
Object.defineProperty(exports, "SlotRegistry", { enumerable: true, get: function () { return slots_1.SlotRegistry; } });
var harmony_error_1 = require("./exceptions/harmony-error");
Object.defineProperty(exports, "HarmonyError", { enumerable: true, get: function () { return harmony_error_1.HarmonyError; } });
var aspect_1 = require("./aspect");
Object.defineProperty(exports, "Aspect", { enumerable: true, get: function () { return aspect_1.Aspect; } });
var runtimes_1 = require("./runtimes");
Object.defineProperty(exports, "RuntimeDefinition", { enumerable: true, get: function () { return runtimes_1.RuntimeDefinition; } });
var extension_graph_1 = require("./extension-graph/extension-graph");
Object.defineProperty(exports, "AspectGraph", { enumerable: true, get: function () { return __importDefault(extension_graph_1).default; } });
// Not exposing it right now, as it's not browser compatible
// we need to expose it only for node, but not for browser
// export { ConfigOptions, Config} from './harmony-config';