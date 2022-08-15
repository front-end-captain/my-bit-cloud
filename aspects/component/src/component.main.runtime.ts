import { ExpressAspect, ExpressMain, Route } from "@unknown/express";
import { GraphqlAspect, GraphqlMain } from "@unknown/graphql";
import { Slot, SlotRegistry } from "@unknown/harmony";
import { ComponentID } from "@unknown/component-id";
import { flatten } from "lodash";
import { ExtensionDataList } from "@teambit/legacy/dist/consumer/config";
import { ComponentMainRuntime } from './component.aspect';
import { ComponentFactory } from "./component-factory";
import { ComponentAspect } from "./component.aspect";
import { componentSchema } from "./component.graphql";
import { ComponentRoute } from "./component.route";
import { AspectList } from "./aspect-list";
import { HostNotFound } from "./exceptions";
import { AspectEntry } from "./aspect-entry";

import { RegisteredComponentRoute } from ".";

export type ComponentHostSlot = SlotRegistry<ComponentFactory>;

export class ComponentMain {
  constructor(
    /**
     * slot for component hosts to register.
     */
    private hostSlot: ComponentHostSlot,

    /**
     * Express Extension
     */
    private express: ExpressMain,
  ) {}

  /**
   * register a new component host.
   */
  registerHost(host: ComponentFactory) {
    this.hostSlot.register(host);
    return this;
  }

  /**
   * important! avoid using this method.
   * seems like this method was written to work around a very specific case when the ComponentID of the aspects are
   * not available. in case of new components, to get the ComponentID, the workspace-aspect is needed to get the
   * default-scope. when this method is called from the scope, there is no way to get the real component-id.
   * instead, this method asks for the "scope", which when called by the scope-aspect is the current scope-name.
   * it may or may not be the real scope-name of the aspect.
   * to fix this possibly incorrect scope-name, the `workspace.resolveScopeAspectListIds()` checks whether the
   * scope-name is the same as scope.name, and if so, resolve it to the correct scope-name.
   */
  createAspectListFromLegacy(legacyExtensionDataList: ExtensionDataList, scope?: string) {
    return AspectList.fromLegacyExtensions(legacyExtensionDataList, scope);
  }

  createAspectListFromEntries(entries: AspectEntry[]) {
    return new AspectList(entries);
  }

  registerRoute(routes: RegisteredComponentRoute[]) {
    const routeEntries = routes.map((route: RegisteredComponentRoute) => {
      return new ComponentRoute(route, this);
    });

    const flattenRoutes = flatten(routeEntries) as any as Route[];

    this.express.register(flattenRoutes);
    return this;
  }

  /**
   * set the prior host.
   */
  setHostPriority(id: string) {
    const host = this.hostSlot.get(id);
    if (!host) {
      throw new HostNotFound(id);
    }

    this._priorHost = host;
    return this;
  }

  /**
   * get component host by extension ID.
   */
  getHost(id?: string): ComponentFactory {
    if (id) {
      const host = this.hostSlot.get(id);
      if (!host) throw new HostNotFound(id);
      return host;
    }

    return this.getPriorHost();
  }

  getRoute(id: ComponentID, routeName: string) {
    return `/api/${id.toString()}/~aspect/${routeName}`;
  }

  /**
   * get the prior host.
   */
  private getPriorHost() {
    if (this._priorHost) return this._priorHost;

    const hosts = this.hostSlot.values();
    const priorityHost = hosts.find((host) => host.priority);
    return priorityHost || hosts[0];
  }

  isHost(name: string) {
    return !!this.hostSlot.get(name);
  }


  private _priorHost: ComponentFactory | undefined;

  static slots = [
    Slot.withType<ComponentFactory>(),
    Slot.withType<Route[]>(),
  ];

  static runtime = ComponentMainRuntime;
  static dependencies = [GraphqlAspect, ExpressAspect];

  static async provider(
    [graphql, express]: [GraphqlMain, ExpressMain],
    config,
    [hostSlot]: [ComponentHostSlot],
  ) {
    const componentExtension = new ComponentMain(hostSlot, express);
    
    graphql.register(componentSchema(componentExtension));

    return componentExtension;
  }
}

ComponentAspect.addRuntime(ComponentMain);
