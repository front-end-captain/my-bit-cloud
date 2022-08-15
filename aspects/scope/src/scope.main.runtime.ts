import { ScopeMainRuntime, ScopeAspect } from "./scope.aspect";

export class ScopeMain {
  static dependencies = [];
  static runtime = ScopeMainRuntime;
  static slots = [];

  public run() {
    console.log("run scope");
  }

  static async provider() {
    return new ScopeMain();
  }
}

ScopeAspect.addRuntime(ScopeMain);
