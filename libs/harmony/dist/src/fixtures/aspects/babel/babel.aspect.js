"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BabelAspect = void 0;
const aspect_1 = require("../../../aspect");
exports.BabelAspect = aspect_1.Aspect.create({
    id: '@teambit/babel',
    dependencies: [],
    files: [
        require.resolve('./babel.cli')
    ]
});
exports.default = exports.BabelAspect;
