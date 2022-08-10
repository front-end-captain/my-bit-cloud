import { Aspect, RuntimeDefinition } from "@unknown/harmony";

export const VikingMainRuntime = new RuntimeDefinition("main");

export const VikingAspect = Aspect.create({
  id: "unknown.harmony/viking",
  name: "unknown.harmony/viking",
  dependencies: [],
  declareRuntime: VikingMainRuntime,
  files: [require.resolve("./viking.main.runtime")],
});
