import { VikingMainRuntime, VikingAspect } from "./viking.aspect";

export class VikingMain {
  static dependencies = [];
  static runtime = VikingMainRuntime;
  static slots = [];

  public run() {
    console.log("run viking");
  }

  static async provider() {
    const vikingMain = new VikingMain();
    return vikingMain;
  }
}

VikingAspect.addRuntime(VikingMain);
