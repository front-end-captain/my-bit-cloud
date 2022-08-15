import { Aspect, RuntimeDefinition } from "@unknown/harmony";

export const ScopeMainRuntime = new RuntimeDefinition("main");

export const ScopeAspect = Aspect.create({
  id: "unknown.harmony/scope",
  name: "unknown.harmony/scope",
  dependencies: [],
  declareRuntime: ScopeMainRuntime,
  files: [require.resolve("./scope.main.runtime")],
});
