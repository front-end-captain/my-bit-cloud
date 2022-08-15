import "reflect-metadata";

import { DependencyGraph as ExtensionGraph } from "./extension-graph";
import { ExtensionLoadError, RuntimeNotDefined } from "./exceptions";
import { Extension, ExtensionManifest } from "./extension";
import { asyncForEach } from "./utils";
import { Runtimes, RuntimeDefinition } from "./runtimes";

export type RequireFn = (aspect: Extension, runtime: RuntimeDefinition) => Promise<void>;

export class Harmony {
  constructor(
    /**
     * extension graph
     */
    readonly graph: ExtensionGraph,

    readonly runtimes: Runtimes,

    readonly activeRuntime: string,
  ) {}

  public current: string | null = null;

  private runtime: RuntimeDefinition | undefined;

  /**
   * list all registered extensions
   */
  get extensions() {
    return this.graph.nodes;
  }

  /**
   * list all registered extensions ids
   */
  get extensionsIds() {
    return [...this.graph.nodes.keys()];
  }

  /**
   * load an Aspect into the dependency graph.
   */
  async load(extensions: ExtensionManifest[]) {
    return this.set(extensions);
  }

  /**
   * set extensions during Harmony runtime.
   * hack!
   */
  async set(extensions: ExtensionManifest[]) {
    this.graph.load(extensions);
    // Only load new extensions and their dependencies
    const extensionsToLoad = extensions.map((ext) => {
      return Reflect.getMetadata("harmony:name", ext) || ext.id || ext.name;
    });

    await this.graph.enrichRuntime(this.runtime, this.runtimes, () => Promise.resolve());
    const subgraphs = this.graph.successorsSubgraph(extensionsToLoad);
    if (subgraphs) {
      const executionOrder = subgraphs.toposort(true);
      await asyncForEach(executionOrder, async (ext: Extension) => {
        if (!this.runtime) throw new RuntimeNotDefined(this.activeRuntime);
        await this.runOne(ext, this.runtime);
      });
    }
  }

  private async runOne(extension: Extension, runtime: RuntimeDefinition) {
    if (extension.loaded) return;
    // create an index of all vertices in dependency graph
    const deps = this.graph.getRuntimeDependencies(extension, runtime);
    const instances = deps.map((extension) => extension.instance);

    try {
      return extension.__run(instances, this, runtime);
    } catch (err) {
      throw new ExtensionLoadError(extension, err);
    }
  }

  getDependencies(aspect: Extension) {
    if (!this.runtime) throw new RuntimeNotDefined(this.activeRuntime);
    return this.graph.getRuntimeDependencies(aspect, this.runtime);
  }

  initExtension(id: string) {
    this.current = id;
  }

  endExtension() {
    this.current = null;
  }

  /**
   * get an extension from harmony.
   */
  get<T>(id: string): T {
    const extension = this.graph.get(id);
    if (!extension || !extension.instance) throw new Error(`failed loading extension ${id}`);
    return extension.instance;
  }

  resolveRuntime(name: string): RuntimeDefinition {
    return this.runtimes.get(name);
  }

  async run(requireFn?: RequireFn) {
    const runtime = this.resolveRuntime(this.activeRuntime);

    this.runtime = runtime;

    const defaultRequireFn: RequireFn = async (aspect: Extension, runtime: RuntimeDefinition) => {
      const runtimeFile = runtime.getRuntimeFile(aspect.files);

      if (!runtimeFile) return;
    };

    await this.graph.enrichRuntime(runtime, this.runtimes, requireFn || defaultRequireFn);

    const executionOrder = this.graph.byExecutionOrder();
    await asyncForEach(executionOrder, async (ext: Extension) => {
      await this.runOne(ext, runtime);
    });
  }

  static async load(extensionManifest: ExtensionManifest[], runtime: string) {
    const aspectGraph = ExtensionGraph.from(extensionManifest);
    const runtimes = await Runtimes.load(aspectGraph);

    return new Harmony(aspectGraph, runtimes, runtime);
  }
}
