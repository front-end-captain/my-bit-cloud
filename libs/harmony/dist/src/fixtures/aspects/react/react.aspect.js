"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactAspect = exports.CLIRuntime = void 0;
const aspect_1 = require("../../../aspect");
const runtimes_1 = require("../../../runtimes");
const ui_aspect_1 = require("../ui/ui.aspect");
exports.CLIRuntime = runtimes_1.RuntimeDefinition.create({ name: 'cli' });
exports.ReactAspect = aspect_1.Aspect.create({
    id: '@teambit/react',
    dependencies: [ui_aspect_1.UIAspect],
    defaultConfig: {},
    declareRuntime: exports.CLIRuntime,
    files: [
        require.resolve('./react.cli'),
        require.resolve('./react.ui')
    ]
});
exports.default = exports.ReactAspect;
