import { Harmony } from "@unknown/harmony";
import { ScopeAspect, ScopeMainRuntime, ScopeMain } from "@unknown/scope";

async function bootstrap() {
  const harmony = await Harmony.load([ScopeAspect], ScopeMainRuntime.name);

  await harmony.run();

  harmony.get<ScopeMain>("unknown.harmony/scope").run();
}

bootstrap();
