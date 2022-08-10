import { Aspect, RuntimeDefinition } from "@unknown/harmony";
import { VikingAspect } from "@unknown/viking";

export const ScopeMainRuntime = new RuntimeDefinition("main");

export const ScopeAspect = Aspect.create({
  id: "unknown.harmony/scope",
  name: "unknown.harmony/scope",
  dependencies: [VikingAspect],
  declareRuntime: ScopeMainRuntime,
  files: [require.resolve("./scope.main.runtime")],
});
