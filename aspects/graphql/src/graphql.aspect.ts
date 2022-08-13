import { Aspect, RuntimeDefinition } from "@unknown/harmony";

export const GraphqlMainRunTime = new RuntimeDefinition("main");
export const GraphqlUIRunTime = new RuntimeDefinition("ui");

export const GraphqlAspect = Aspect.create({
  id: "unkonwn.harmony/graphql",
  dependencies: [],
  defaultConfig: {},
});

export default GraphqlAspect;
