import { Aspect, RuntimeDefinition } from "@unknown/harmony";

export const ExpressMainRuntime = new RuntimeDefinition("main");

export const ExpressAspect = Aspect.create({
  id: "unknown.harmony/express",
  dependencies: [],
  defaultConfig: {},
  files: [require.resolve("./express.main.runtime")],
});
