"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Aspect = void 0;
class Aspect {
    constructor(id, dependencies, slots, defaultConfig = {}, declareRuntime, files) {
        this.id = id;
        this.dependencies = dependencies;
        this.slots = slots;
        this.defaultConfig = defaultConfig;
        this.declareRuntime = declareRuntime;
        this.files = files;
        this._runtimes = [];
    }
    addRuntime(runtimeManifest) {
        this._runtimes.push(runtimeManifest);
        return this;
    }
    getRuntime(runtimeDef) {
        return this._runtimes.find((runtime) => {
            if (typeof runtime.runtime === 'string')
                return runtime.runtime === runtimeDef.name;
            return runtime.runtime.name === runtimeDef.name;
        });
    }
    getRuntimes() {
        return this._runtimes;
    }
    static create(manifest) {
        return new Aspect(manifest.id, manifest.dependencies || [], manifest.slots || [], manifest.defaultConfig, manifest.declareRuntime, manifest.files || []);
    }
}
exports.Aspect = Aspect;