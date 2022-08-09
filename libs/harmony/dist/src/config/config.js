"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
class Config {
    constructor(raw) {
        this.raw = raw;
    }
    toObject() {
        return Array.from(this.raw.entries()).reduce((acc, [id, config]) => {
            acc[id] = config;
            return acc;
        }, {});
    }
    /**
     * set an extension config to the registry.
     * @param id extension id
     * @param config plain config object
     */
    set(id, config) {
        this.raw.set(id, config);
    }
    /**
     * get a config entry
     * @param id extension id.
     */
    get(id) {
        return this.raw.get(id);
    }
    /**
     * instantiate from a plain config-like object.
     */
    static from(raw) {
        return new Config(new Map(Object.entries(raw)));
    }
}
exports.Config = Config;