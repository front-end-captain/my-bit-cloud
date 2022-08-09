"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIAspect = exports.UIRuntime = void 0;
const aspect_1 = require("../../../aspect");
const runtimes_1 = require("../../../runtimes");
exports.UIRuntime = runtimes_1.RuntimeDefinition.create({ name: 'ui' });
exports.UIAspect = aspect_1.Aspect.create({
    id: '@teambit/ui',
    dependencies: [],
    declareRuntime: exports.UIRuntime,
    files: [
        require.resolve('./ui.ui')
    ]
});
