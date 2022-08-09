"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HookRegistry = exports.hook = exports.createHook = exports.register = exports.provider = exports.ExtensionDecorator = void 0;
require("reflect-metadata");
const map = {};
/**
 * decorator for an Harmony extension.
 */
function ExtensionDecorator({ name, dependencies } = {}) {
    function classDecorator(constructor) {
        Reflect.defineMetadata("harmony:name", name || constructor.name, constructor);
        Reflect.defineMetadata("harmony:dependencies", calculateDependnecies(constructor, dependencies), constructor);
    }
    return classDecorator;
}
exports.ExtensionDecorator = ExtensionDecorator;
function provider() {
    return function (target, propertyKey, descriptor) {
        const keys = Reflect.getMetadata("design:paramtypes", descriptor);
    };
}
exports.provider = provider;
// @hack todo: must be defined and assigned from a single location
function providerFn(classExtension) {
    return classExtension.provide ? classExtension.provide : classExtension.provider;
}
function calculateDependnecies(classExtension, deps) {
    function fromMetadata() {
        const provider = providerFn(classExtension);
        if (provider) {
            //   // TODO: check why Reflect.getMetadataKeys(provider) is empty and how to access method param types.
            //   console.log(Reflect.getMetadataKeys(classExtension.provide))
            return [];
        }
        return Reflect.getMetadata("design:paramtypes", classExtension);
    }
    const dependnecies = deps ? deps : fromMetadata() || [];
    const hookDeps = classExtension.__hookDeps ? classExtension.__hookDeps : [];
    return dependnecies.concat(hookDeps) || [];
}
// :TODO refactor this asap to handle harmony objects properly
function register(extension, name) {
    return function (target, propertyKey, descriptor) {
        // if (!target.constructor.__hookDeps) Reflect.defineMetadata('harmony:subscriptions', [extension], target.constructor);
        // else target.constructor.__hookDeps.push(extension);
        const extensionName = Reflect.getMetadata("harmony:name", extension);
        if (!map[extensionName]) {
            map[extensionName] = {};
        }
        const hook = map[extensionName][name || propertyKey];
        // if (!hook) throw new HookNotFound();
        if (!hook)
            return;
        hook.register(target[propertyKey]);
    };
}
exports.register = register;
function createHook() {
    const randomId = Math.random().toString(36).substring(2);
    map[randomId] = HookRegistry.create();
    const decorator = function (target, propertyKey, descriptor) {
        const registry = map[randomId];
        registry.register(descriptor.value);
    };
    decorator.hash = randomId;
    return decorator;
}
exports.createHook = createHook;
function hook(name) {
    return function (target, propertyKey) {
        let instance = HookRegistry.create();
        const extensionName = Reflect.getMetadata("harmony:name", target.constructor);
        const hookName = name || propertyKey;
        if (!map[extensionName])
            map[extensionName] = { [hookName]: instance };
        else
            map[extensionName][hookName] = instance;
        Object.defineProperty(target, propertyKey, {
            get: () => {
                return instance;
            },
            set: (value) => {
                instance = value;
            },
        });
    };
}
exports.hook = hook;
class HookRegistry {
    constructor(fillers, hash) {
        this.fillers = fillers;
        this.hash = hash;
    }
    register(filler) {
        this.fillers.push(filler);
    }
    list() {
        // return map[this.name][name] || [];
        return this.fillers;
    }
    static of(hook) {
        return map[hook.hash];
    }
    // hack due to https://github.com/microsoft/TypeScript/issues/4881
    static create() {
        return new HookRegistry([]);
    }
}
exports.HookRegistry = HookRegistry;