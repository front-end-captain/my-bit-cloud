import { Aspect, RuntimeDefinition } from "@unknown/harmony";

export const ComponentMainRuntime = new RuntimeDefinition("main");

export const ComponentAspect = Aspect.create({
  id: "teambit.component/component",
  dependencies: [],
  defaultConfig: {},
});

export default ComponentAspect;
