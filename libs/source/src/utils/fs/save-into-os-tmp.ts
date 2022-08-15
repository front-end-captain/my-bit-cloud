import path from "path";
import fs from "fs-extra";
import os from "os";
import { v4 } from "uuid";
import { PathOsBased } from "../path";

export const BIT_TEMP_ROOT = path.join(fs.realpathSync(os.tmpdir()), "bit");
const BASE_PATH = path.join(BIT_TEMP_ROOT, "tmp");

export async function saveIntoOsTmp(
  data: string,
  filename = v4(),
  ext = ".js",
): Promise<PathOsBased> {
  const filePath = path.join(BASE_PATH, `${filename}${ext}`);
  await fs.outputFile(filePath, data);
  return filePath;
}
