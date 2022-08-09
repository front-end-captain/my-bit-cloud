"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnyExtension = void 0;
const extension_1 = require("./extension");
/**
 * Class extension of type any. this class is indended for use inside Harmony
 * where extension generics type relevance is low.
 */
class AnyExtension extends extension_1.Extension {
}
exports.AnyExtension = AnyExtension;
