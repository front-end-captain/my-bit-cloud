import { RuntimeDefinition } from "./runtime-definition";
import { DependencyGraph } from "../extension-graph";
import { RuntimeNotDefined } from "../exceptions";

export class Runtimes {
  constructor(readonly runtimeDefinition: Record<string, RuntimeDefinition>) {}

  add(runtime: RuntimeDefinition) {
    this.runtimeDefinition[runtime.name] = runtime;
    return this;
  }

  get(name: string): RuntimeDefinition {
    const runtime = this.runtimeDefinition[name];
    if (!runtime) throw new RuntimeNotDefined(name);
    return this.runtimeDefinition[name];
  }

  static async load(graph: DependencyGraph) {
    const runtimes: Record<string, RuntimeDefinition> = {};
    graph.extensions.forEach((manifest) => {
      if (!manifest.declareRuntime) return;

      runtimes[manifest.declareRuntime.name] = manifest.declareRuntime;
    });

    return new Runtimes(runtimes);
  }
}
