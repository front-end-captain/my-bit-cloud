import { Graph } from 'cleargraph';
import { ExtensionManifest } from '../extension';
import { Extension } from '../extension';
import { RuntimeDefinition, Runtimes } from '../runtimes';
import { RequireFn } from '../harmony';
export declare type Edge = {
    type: string;
    runtime?: string;
};
export default class DependencyGraph extends Graph<Extension, Edge> {
    private cache;
    getRuntimeDependencies(aspect: Extension, runtime: RuntimeDefinition): Extension[];
    private sortDeps;
    byExecutionOrder(): Extension[];
    private enrichRuntimeExtension;
    enrichRuntime(runtime: RuntimeDefinition, runtimes: Runtimes, requireFn: RequireFn): Promise<any[][]>;
    add(manifest: ExtensionManifest): this;
    load(extensions: ExtensionManifest[]): this;
    getExtension(manifest: ExtensionManifest): Extension;
    get extensions(): ExtensionManifest[];
    get aspects(): ExtensionManifest[];
    get(id: string): any;
    /**
     * build Harmony from a single extension.
     */
    static fromRoot(extension: ExtensionManifest): DependencyGraph;
    /**
     * build Harmony from set of extensions
     */
    static from(extensions: ExtensionManifest[]): DependencyGraph;
}