import { ComponentOverridesData } from "@unknown/source/dist/consumer/config/component-overrides";
import { ExtensionDataList } from "@unknown/source/dist/consumer/config/extension-data";
import { PathLinux } from "@unknown/source/dist/utils/path";

type LegacyConfigProps = {
  lang?: string;
  bindingPrefix: string;
  extensions?: ExtensionDataList;
  overrides?: ComponentOverridesData;
};

/**
 * in-memory representation of the component configuration.
 */
export default class Config {
  constructor(
    /**
     * version main file
     */
    readonly main: PathLinux,

    /**
     * configured extensions
     */
    readonly extensions: ExtensionDataList,

    readonly legacyProperties?: LegacyConfigProps,
  ) {}
}
