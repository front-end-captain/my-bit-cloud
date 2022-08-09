"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Runtimes = void 0;
const exceptions_1 = require("./exceptions");
class Runtimes {
    constructor(runtimeDefinition) {
        this.runtimeDefinition = runtimeDefinition;
    }
    add(runtime) {
        this.runtimeDefinition[runtime.name] = runtime;
        return this;
    }
    get(name) {
        const runtime = this.runtimeDefinition[name];
        if (!runtime)
            throw new exceptions_1.RuntimeNotDefined(name);
        return this.runtimeDefinition[name];
    }
    dispose() {
    }
    static load(graph) {
        return __awaiter(this, void 0, void 0, function* () {
            const runtimes = {};
            graph.extensions.forEach(manifest => {
                if (!manifest.declareRuntime)
                    return;
                runtimes[manifest.declareRuntime.name] = manifest.declareRuntime;
            });
            return new Runtimes(runtimes);
        });
    }
}
exports.Runtimes = Runtimes;
