import { Extension } from './extension/extension';
export default class Container {
    private instances;
    constructor(instances?: Map<any, any>);
    register<AnyExtension>(token: string, instance: AnyExtension): void;
    resolve<AnyExtension>(token: string): AnyExtension;
    static loadWith(defaults: Extension[]): Container;
}
