import "reflect-metadata";
import { ExtensionManifest } from "./extension-manifest";
export declare type ExtensionOptions = {
    dependencies?: ExtensionManifest[];
    name?: string;
};
/**
 * decorator for an Harmony extension.
 */
export declare function ExtensionDecorator({ name, dependencies }?: ExtensionOptions): <T extends new (...args: any[]) => {}>(constructor: T) => void;
export declare function provider(): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function register(extension: ExtensionManifest, name?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function createHook(): {
    (target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
    hash: string;
};
export declare function hook(name?: string): (target: any, propertyKey: string) => void;
export declare class HookRegistry<T> {
    private fillers;
    readonly hash?: string;
    constructor(fillers: T[], hash?: string);
    register(filler: T): void;
    list(): T[];
    static of<T>(hook: any): HookRegistry<T>;
    static create<T>(): HookRegistry<T>;
}