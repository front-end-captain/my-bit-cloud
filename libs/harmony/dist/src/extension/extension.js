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
exports.Extension = void 0;
const extension_init_error_1 = require("../exceptions/extension-init-error");
/**
 * harmony's extension definition. this can be used to define and extend `Harmony` applications.
 */
class Extension {
    constructor(
    /**
     * manifest of the extension.
     */
    manifest) {
        this.manifest = manifest;
        this._instance = null;
        this._loaded = false;
    }
    /**
     * returns the instance of the extension
     */
    get instance() {
        return this._instance;
    }
    get name() {
        const metadata = Reflect.getMetadata("harmony:name", this.manifest);
        return metadata || this.manifest.id || this.manifest.name;
    }
    get id() {
        return this.name;
    }
    get dependencies() {
        const metadata = Reflect.getMetadata("harmony:dependencies", this.manifest);
        return metadata || this.manifest.dependencies || [];
    }
    get provider() {
        const metadata = Reflect.getMetadata("harmony:provider", this.manifest);
        return metadata || this.manifest.provider;
    }
    get files() {
        return this.manifest.files;
    }
    /**
     * returns an indication of the extension already loaded (the provider run)
     * We don't rely on the instance since an extension provider might return null
     */
    get loaded() {
        return this._loaded;
    }
    toString() {
        return JSON.stringify(this.name);
    }
    buildSlotRegistries(slots, context) {
        return slots.map((slot) => {
            return slot(() => {
                return context.current;
            });
        });
    }
    get declareRuntime() {
        return this.manifest.declareRuntime;
    }
    getRuntime(runtime) {
        return this.manifest.getRuntime(runtime);
    }
    getRuntimes() {
        return this.manifest.getRuntimes();
    }
    getSlots(extensionRuntime) {
        if (extensionRuntime.slots && extensionRuntime.slots.length) {
            return extensionRuntime.slots;
        }
        return this.manifest.slots || [];
    }
    getConfig(context, extensionRuntime) {
        const defaultConfig = extensionRuntime.defaultConfig || this.manifest.defaultConfig || {};
        const config = context.config.get(this.name) || {};
        return Object.assign({}, defaultConfig, config);
    }
    /**
     * initiate Harmony in run-time.
     */
    __run(dependencies, context, runtime) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = this.name;
            context.initExtension(name);
            const extensionRuntime = this.getRuntime(runtime);
            if (!extensionRuntime) {
                return undefined;
            }
            // @ts-ignore
            const registries = this.buildSlotRegistries(this.getSlots(extensionRuntime), context);
            const config = this.getConfig(context, extensionRuntime);
            if (!this.loaded) {
                if (extensionRuntime.provider)
                    this._instance = yield extensionRuntime.provider(dependencies, config, registries, context);
                else {
                    try {
                        // @ts-ignore
                        this._instance = new extensionRuntime.manifest(...dependencies);
                    }
                    catch (err) {
                        throw new extension_init_error_1.ExtensionInstantiationException(err.toString());
                    }
                }
                // @ts-ignore adding the extension ID to the instance.
                // this._instance.id = this.manifest.name;
                // @ts-ignore adding the extension ID to the instance.
                // this._instance.config = config;
                this._loaded = true;
                return this._instance;
            }
            context.endExtension();
            return Promise.resolve(this.instance);
        });
    }
}
exports.Extension = Extension;
