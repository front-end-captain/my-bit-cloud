import Bluebird from "bluebird";
import path from "path";

import { handleUnhandledRejection } from "./cli/handle-errors";
process.env.MEMFS_DONT_WARN = "true"; // suppress fs experimental warnings from memfs

// eslint-disable-next-line @typescript-eslint/no-misused-promises
process.on("unhandledRejection", async (err) => handleUnhandledRejection(err));

// by default Bluebird enables the longStackTraces when env is `development`, or when
// BLUEBIRD_DEBUG is set.
// the drawback of enabling it all the time is a performance hit. (see http://bluebirdjs.com/docs/api/promise.longstacktraces.html)
// some commands are slower by 20% with this enabled.
Bluebird.config({
  longStackTraces: Boolean(process.env.BLUEBIRD_DEBUG || process.env.BIT_LOG),
});

export function getHarmonyVersion(showValidSemver = false) {
  try {
    const teambitBit = require.resolve("@teambit/bit");
    // eslint-disable-next-line
    const packageJson = require(path.join(teambitBit, "../..", "package.json"));
    if (packageJson.version) return packageJson.version;
    // this is running locally
    if (packageJson.componentId && packageJson.componentId.version) {
      return showValidSemver
        ? packageJson.componentId.version
        : `last-tag ${packageJson.componentId.version}`;
    }
    if (showValidSemver) throw new Error(`unable to find Bit version`);
    return null;
  } catch (err: any) {
    if (showValidSemver) throw err;
    return null;
  }
}
