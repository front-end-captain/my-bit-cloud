import { ScopeMainRuntime, ScopeAspect } from "./scope.aspect";
import type { VikingMain } from "@unknown/viking";

export class ScopeMain {
  static dependencies = [];
  static runtime = ScopeMainRuntime;
  static slots = [];

  public run() {
    console.log("run scope");
  }

  static async provider([viking]: [VikingMain]) {
    viking.run();

    const cliMain = new ScopeMain();
    return cliMain;
  }
}

ScopeAspect.addRuntime(ScopeMain);
