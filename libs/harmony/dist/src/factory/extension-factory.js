"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extensionFactory = void 0;
const extension_1 = require("../extension/extension");
function extensionFactory(manifest) {
    // to allow the use of `provide` as an alias to `provider` in ExtensionManifest
    if (manifest.provide)
        manifest.provider = manifest.provide;
    return new extension_1.Extension(manifest);
}
exports.extensionFactory = extensionFactory;
