import { ProviderFn } from "../types";
import { Harmony } from "../harmony";
import { ExtensionManifest } from "./extension-manifest";
import { RuntimeDefinition } from "../runtimes";
export declare type ExtensionProps = {
    name: string;
    dependencies: any[];
    provider: ProviderFn;
};
/**
 * harmony's extension definition. this can be used to define and extend `Harmony` applications.
 */
export declare class Extension {
    /**
     * manifest of the extension.
     */
    readonly manifest: ExtensionManifest;
    constructor(
    /**
     * manifest of the extension.
     */
    manifest: ExtensionManifest);
    private _instance;
    private _loaded;
    /**
     * returns the instance of the extension
     */
    get instance(): any;
    get name(): any;
    get id(): any;
    get dependencies(): Extension[];
    get provider(): any;
    get files(): any;
    /**
     * returns an indication of the extension already loaded (the provider run)
     * We don't rely on the instance since an extension provider might return null
     */
    get loaded(): boolean;
    toString(): string;
    private buildSlotRegistries;
    get declareRuntime(): any;
    getRuntime(runtime: RuntimeDefinition): any;
    getRuntimes(): any;
    getSlots(extensionRuntime: any): any;
    getConfig(context: Harmony, extensionRuntime: any): any;
    /**
     * initiate Harmony in run-time.
     */
    __run(dependencies: any[], context: Harmony, runtime: RuntimeDefinition): Promise<any>;
}
