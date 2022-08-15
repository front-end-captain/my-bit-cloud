/* eslint max-classes-per-file: 0 */
import merge from "lodash.merge";
import * as os from "os";
import R from "ramda";
import { Client as Ssh2Client } from "ssh2";
import { getSync } from "../../../api/consumer/lib/global-config";
import * as globalConfig from "../../../api/consumer/lib/global-config";
import { BitId } from "../../../bit-id";
import globalFlags from "../../../cli/global-flags";
import {
  CFG_SSH_NO_COMPRESS,
  CFG_USER_TOKEN_KEY,
  DEFAULT_SSH_READY_TIMEOUT,
} from "../../../constants";
import ConsumerComponent from "../../../consumer/component";
import { ListScopeResult } from "../../../consumer/component/components-list";
import GeneralError from "../../../error/general-error";
import logger from "../../../logger/logger";
import { userpass as promptUserpass } from "../../../prompts";
import { buildCommandMessage, packCommand, toBase64, unpackCommand } from "../../../utils";
import ComponentObjects from "../../component-objects";
import DependencyGraph from "../../graph/scope-graph";
import { LaneData } from "../../lanes/lanes";
import { ComponentLog } from "../../models/model-component";
import RemovedObjects from "../../removed-components";
import { ScopeDescriptor } from "../../scope";
import checkVersionCompatibilityFunction from "../check-version-compatibility";
import { AuthenticationFailed, RemoteScopeNotFound, SSHInvalidResponse } from "../exceptions";
import { Network } from "../network";
import keyGetter from "./key-getter";
import { FETCH_FORMAT_OBJECT_LIST, ObjectItemsStream, ObjectList } from "../../objects/object-list";
import CompsAndLanesObjects from "../../comps-and-lanes-objects";
import { FETCH_OPTIONS } from "../../../api/scope/lib/fetch";
import { remoteErrorHandler } from "../remote-error-handler";
import { PushOptions } from "../../../api/scope/lib/put";

const checkVersionCompatibility = R.once(checkVersionCompatibilityFunction);
const AUTH_FAILED_MESSAGE = "All configured authentication methods failed";
const PASSPHRASE_POSSIBLY_MISSING_MESSAGE = "Cannot parse privateKey: Unsupported key format";

function absolutePath(path: string) {
  if (!path.startsWith("/")) return `~/${path}`;
  return path;
}

function clean(str: string) {
  return str.replace("\n", "");
}

export type SSHProps = {
  path: string;
  username: string;
  port: number;
  host: string;
};

export type SSHConnectionStrategyName =
  | "token"
  | "ssh-agent"
  | "ssh-key"
  | "user-password"
  | "anonymous";

class AuthenticationStrategyFailed extends Error {}

export const DEFAULT_STRATEGIES: SSHConnectionStrategyName[] = [
  "token",
  "ssh-agent",
  "ssh-key",
  "user-password",
];
export const DEFAULT_READ_STRATEGIES: SSHConnectionStrategyName[] = [
  "token",
  "ssh-agent",
  "ssh-key",
  "anonymous",
  "user-password",
];
export default class SSH implements Network {
  connection: Ssh2Client | null | undefined;
  path: string;
  username: string;
  port: number;
  host: string;
  _sshUsername?: string; // Username entered by the user on the prompt user/pass process

  constructor({ path, username, port, host }: SSHProps) {
    this.path = path;
    this.username = username;
    this.port = port;
    this.host = host || "";
  }

  /**
   * Network strategies:
   * 1) token (generated by bit-login command)
   * 2) ssh-agent (public-key should be saved on bit.dev, user needs to enable ssh-agent in its os. the agent saves the passphrase, so no need to enter)
   * 3) ssh-key. (user can specify location by `bit config`, if not, the default one is used. doesn't support passphrase)
   * 4) anonymous. (for read operations only) - trying to do the action as anonymous user
   * 5) prompt of user/password
   */
  async connect(strategiesNames: SSHConnectionStrategyName[] = DEFAULT_STRATEGIES): Promise<SSH> {
    const strategies: { [key: string]: Function } = {
      token: this._tokenAuthentication,
      anonymous: this._anonymousAuthentication,
      "ssh-agent": this._sshAgentAuthentication,
      "ssh-key": this._sshKeyAuthentication,
      "user-password": this._userPassAuthentication,
    };
    const strategiesFailures: string[] = [];
    for (const strategyName of strategiesNames) {
      logger.debug(`ssh, trying to connect using ${strategyName}`);
      const strategyFunc = strategies[strategyName].bind(this);
      try {
        const strategyResult = await strategyFunc(); // eslint-disable-line
        if (strategyResult) return strategyResult as SSH;
      } catch (err: any) {
        logger.debug(`ssh, failed to connect using ${strategyName}. ${err.message}`);
        if (err instanceof AuthenticationStrategyFailed) {
          strategiesFailures.push(err.message);
        } else {
          throw err;
        }
      }
    }
    logger.errorAndAddBreadCrumb("ssh", "all connection strategies have been failed!");
    strategiesFailures.unshift("The following strategies were failed");
    throw new AuthenticationFailed(strategiesFailures.join("\n[-] "));
  }

  async _tokenAuthentication(): Promise<SSH> {
    const sshConfig = this._composeTokenAuthObject();
    if (!sshConfig) {
      throw new AuthenticationStrategyFailed(
        "user token not defined in bit-config. please run `bit login` to authenticate.",
      );
    }
    const authFailedMsg =
      "failed to authenticate with user token. generate a new token by running `bit logout && bit login`.";
    return this._connectWithConfig(sshConfig, "token", authFailedMsg);
  }
  async _anonymousAuthentication(): Promise<SSH> {
    const sshConfig = this._composeAnonymousAuthObject();
    if (!sshConfig) {
      throw new AuthenticationStrategyFailed("could not create the anonymous ssh configuration.");
    }
    const authFailedMsg = "collection might be private.";
    return this._connectWithConfig(sshConfig, "anonymous", authFailedMsg);
  }
  async _sshAgentAuthentication(): Promise<SSH> {
    if (!this._hasAgentSocket()) {
      throw new AuthenticationStrategyFailed(
        "unable to get SSH keys from ssh-agent to. perhaps service is down or disabled.",
      );
    }
    const sshConfig = merge(this._composeBaseObject(), { agent: process.env.SSH_AUTH_SOCK });
    const authFailedMsg =
      "no matching private key found in ssh-agent to authenticate to remote server.";
    return this._connectWithConfig(sshConfig, "ssh-agent", authFailedMsg);
  }
  async _sshKeyAuthentication(): Promise<SSH> {
    const keyBuffer = await keyGetter();
    if (!keyBuffer) {
      throw new AuthenticationStrategyFailed(
        "SSH key not found in `~/.ssh/id_rsa` or `ssh_key_file` config in `bit config` either not configured or refers to wrong path.",
      );
    }
    const sshConfig = merge(this._composeBaseObject(), { privateKey: keyBuffer });
    const authFailedMsg =
      "failed connecting to remote server using `~/.ssh/id_rsa` or `ssh_key_file` in `bit config`.";
    return this._connectWithConfig(sshConfig, "ssh-key", authFailedMsg);
  }
  async _userPassAuthentication(): Promise<SSH> {
    const sshConfig = await this._composeUserPassObject();
    const authFailedMsg = "unable to connect using provided username and password combination.";
    return this._connectWithConfig(sshConfig, "user-password", authFailedMsg);
  }

  close() {
    this.connection.end();
    return this;
  }

  _composeBaseObject(passphrase?: string) {
    return {
      username: this.username,
      host: this.host,
      port: this.port,
      passphrase,
      readyTimeout: DEFAULT_SSH_READY_TIMEOUT,
    };
  }
  _composeTokenAuthObject(): Record<string, any> | null | undefined {
    const processToken = globalFlags.token;
    const token = processToken || getSync(CFG_USER_TOKEN_KEY);
    if (token) {
      this._sshUsername = "token";
      return merge(this._composeBaseObject(), { username: "token", password: token });
    }
    return null;
  }
  _composeAnonymousAuthObject(): Record<string, any> | null | undefined {
    this._sshUsername = "anonymous";
    return merge(this._composeBaseObject(), { username: "anonymous", password: "" });
  }
  _composeUserPassObject() {
    // @ts-ignore
    return promptUserpass().then(({ username, password }) => {
      this._sshUsername = username;
      return merge(this._composeBaseObject(), { username, password });
    });
  }
  _hasAgentSocket() {
    return !!process.env.SSH_AUTH_SOCK;
  }
  async _connectWithConfig(
    sshConfig: Record<string, any>,
    authenticationType: string,
    authFailedMsg: string,
  ): Promise<SSH> {
    const connectWithConfigP = () => {
      const conn = new Ssh2Client();
      return new Promise((resolve, reject) => {
        conn
          .on("error", (err) => {
            reject(err);
          })
          .on("ready", () => {
            resolve(conn);
          })
          .connect(sshConfig);
      });
    };
    try {
      this.connection = await connectWithConfigP();
      logger.debug(`ssh, authenticated successfully using ${authenticationType}`);
      return this;
    } catch (err: any) {
      if (err.message === AUTH_FAILED_MESSAGE) {
        throw new AuthenticationStrategyFailed(authFailedMsg);
      }
      logger.error("ssh", err);
      if (err.code === "ENOTFOUND") {
        throw new GeneralError(
          `unable to find the SSH server. host: ${err.host}, port: ${err.port}. Original error message: ${err.message}`,
        );
      }
      if (err.message === PASSPHRASE_POSSIBLY_MISSING_MESSAGE) {
        const macMojaveOs = process.platform === "darwin" && os.release() === "18.2.0";
        let passphrasePossiblyMissing =
          "error connecting with private ssh key. in case passphrase is used, use ssh-agent.";
        if (macMojaveOs) {
          passphrasePossiblyMissing +=
            " for macOS Mojave users, use `-m PEM` for `ssh-keygen` command to generate a valid SSH key";
        }
        throw new AuthenticationStrategyFailed(passphrasePossiblyMissing);
      }
      throw new AuthenticationStrategyFailed(`${authFailedMsg} due to an error "${err.message}"`);
    }
  }

  buildCmd(commandName: string, path: string, payload: any, context: any): string {
    const compress = globalConfig.getSync(CFG_SSH_NO_COMPRESS) !== "true";
    return `bit ${commandName} ${toBase64(path)} ${packCommand(
      buildCommandMessage(payload, context, compress),
      true,
      compress,
    )}`;
  }

  exec(
    commandName: string,
    payload?: any,
    context?: Record<string, any>,
    dataToStream?: string,
  ): Promise<any> {
    logger.debug(`ssh: going to run a remote command ${commandName}, path: ${this.path}`);
    // Add the entered username to context
    if (this._sshUsername) {
      context = context || {};
      context.sshUsername = this._sshUsername;
    }
    // eslint-disable-next-line consistent-return
    return new Promise((resolve, reject) => {
      let res = "";
      let err;
      const cmd = this.buildCmd(commandName, absolutePath(this.path || ""), payload, context);
      if (!this.connection) {
        err = "ssh connection is not defined";
        logger.error("ssh", err);
        return reject(err);
      }
      // eslint-disable-next-line consistent-return
      this.connection.exec(cmd, (error, stream) => {
        if (error) {
          logger.error("ssh, exec returns an error: ", error);
          return reject(error);
        }
        if (dataToStream) {
          stream.stdin.write(dataToStream);
          stream.stdin.end();
        }
        stream
          .on("data", (response) => {
            res += response.toString();
          })
          .on("exit", (code) => {
            logger.debug(`ssh: exit. Exit code: ${code}`);
            const promiseExit = () => {
              return code && code !== 0
                ? reject(this.errorHandler(code, err))
                : resolve(clean(res));
            };
            // sometimes the connection 'exit' before 'close' and then it doesn't have the data (err) ready yet.
            // in that case, we prefer to wait until the onClose will terminate the promise.
            // sometimes though, the connection only 'exit' and never 'close' (happened when _put command sent back
            // more than 1MB of data), in that case, the following setTimeout will terminate the promise.
            setTimeout(promiseExit, 2000);
          })
          .on("close", (code, signal) => {
            // @todo: not sure why the next line was needed. if commenting it doesn't create any bug, please remove.
            // otherwise, replace payload with dataToStream
            // if (commandName === '_put') res = res.replace(payload, '');
            logger.debug(`ssh: returned with code: ${code}, signal: ${signal}.`);
            // DO NOT CLOSE THE CONNECTION (using this.connection.end()), it causes bugs when there are several open
            // connections. Same bugs occur when running "this.connection.end()" on "end" or "exit" events.
            return code && code !== 0 ? reject(this.errorHandler(code, err)) : resolve(clean(res));
          })
          .stderr.on("data", (response) => {
            err = response.toString();
            logger.error(`ssh: got an error, ${err}`);
          });
      });
    });
  }

  errorHandler(code: number, err: string) {
    let parsedError;
    let remoteIsLegacy = false;
    try {
      const { headers, payload } = this._unpack(err, false);
      checkVersionCompatibility(headers.version);
      parsedError = payload;
      remoteIsLegacy =
        headers.version === "14.8.8" &&
        parsedError.message.includes("Please update your Bit client");
    } catch (e: any) {
      // be graceful when can't parse error message
      logger.error(`ssh: failed parsing error as JSON, error: ${err}`);
    }
    if (remoteIsLegacy) {
      return new GeneralError(
        `fatal: unable to connect to a remote legacy SSH server from Harmony client`,
      );
    }
    return remoteErrorHandler(code, parsedError, `${this.host}:${this.path}`, err);
  }

  _unpack(data, base64 = true) {
    try {
      const unpacked = unpackCommand(data, base64);
      return unpacked;
    } catch (err: any) {
      logger.error(
        `unpackCommand found on error "${err}", while parsing the following string: ${data}`,
      );
      throw new SSHInvalidResponse(data);
    }
  }

  async pushMany(
    objectList: ObjectList,
    pushOptions: PushOptions,
    context?: Record<string, any>,
  ): Promise<string[]> {
    // This ComponentObjects.manyToString will handle all the base64 stuff so we won't send this payload
    // to the pack command (to prevent duplicate base64)
    const data = await this.exec("_put", pushOptions, context, objectList.toJsonString());
    const { payload, headers } = this._unpack(data);
    checkVersionCompatibility(headers.version);
    return payload.ids;
  }

  async action<Options, Result>(name: string, options: Options): Promise<Result> {
    const args = { name, options };
    const result = await this.exec(`_action`, args);
    const { payload, headers } = this._unpack(result);
    checkVersionCompatibility(headers.version);
    return payload;
  }

  deleteMany(
    ids: string[],
    force: boolean,
    context?: Record<string, any>,
    idsAreLanes?: boolean,
  ): Promise<ComponentObjects[] | RemovedObjects> {
    return this.exec(
      "_delete",
      {
        bitIds: ids,
        force,
        lanes: idsAreLanes,
      },
      context,
    ).then((data: string) => {
      const { payload } = this._unpack(data);
      return RemovedObjects.fromObjects(payload);
    });
  }

  describeScope(): Promise<ScopeDescriptor> {
    return this.exec("_scope")
      .then((data) => {
        const { payload, headers } = this._unpack(data);
        checkVersionCompatibility(headers.version);
        return payload;
      })
      .catch(() => {
        throw new RemoteScopeNotFound(this.path);
      });
  }

  async list(namespacesUsingWildcards?: string): Promise<ListScopeResult[]> {
    return this.exec("_list", namespacesUsingWildcards).then(async (str: string) => {
      const { payload, headers } = this._unpack(str);
      checkVersionCompatibility(headers.version);
      payload.forEach((result) => {
        result.id = new BitId(result.id);
      });
      return payload;
    });
  }

  async listLanes(name?: string, mergeData?: boolean): Promise<LaneData[]> {
    const options = mergeData ? "--merge-data" : "";
    const str = await this.exec(`_lanes ${options}`, name);
    const { payload, headers } = this._unpack(str);
    checkVersionCompatibility(headers.version);
    return payload.map((result) => ({
      ...result,
      components: result.components.map((component) => ({
        id: new BitId(component.id),
        head: component.head,
      })),
    }));
  }

  latestVersions(componentIds: BitId[]): Promise<string[]> {
    const componentIdsStr = componentIds.map((componentId) => componentId.toString());
    return this.exec("_latest", componentIdsStr).then((str: string) => {
      const { payload, headers } = this._unpack(str);
      checkVersionCompatibility(headers.version);
      return payload;
    });
  }

  search(query: string, reindex: boolean) {
    return this.exec("_search", { query, reindex: reindex.toString() }).then((data) => {
      const { payload, headers } = this._unpack(data);
      checkVersionCompatibility(headers.version);
      return payload;
    });
  }

  show(id: BitId): Promise<ConsumerComponent | null | undefined> {
    return this.exec("_show", id.toString()).then((str: string) => {
      const { payload, headers } = this._unpack(str);
      checkVersionCompatibility(headers.version);
      return str ? ConsumerComponent.fromString(payload) : null;
    });
  }

  log(id: BitId): Promise<ComponentLog[]> {
    return this.exec("_log", id.toString()).then((str: string) => {
      const { payload, headers } = this._unpack(str);
      checkVersionCompatibility(headers.version);
      return str ? JSON.parse(payload) : null;
    });
  }

  graph(bitId?: BitId): Promise<DependencyGraph> {
    const idStr = bitId ? bitId.toString() : "";
    return this.exec("_graph", idStr).then((str: string) => {
      const { payload, headers } = this._unpack(str);
      checkVersionCompatibility(headers.version);
      return DependencyGraph.loadFromString(payload);
    });
  }

  async fetch(
    idsStr: string[],
    fetchOptions: FETCH_OPTIONS,
    context?: Record<string, any>,
  ): Promise<ObjectItemsStream> {
    let options = "";
    const { type, withoutDependencies, includeArtifacts } = fetchOptions;
    if (type !== "component") options = ` --type ${type}`;
    if (withoutDependencies) options += " --no-dependencies";
    if (includeArtifacts) options += " --include-artifacts";
    const str = await this.exec(`_fetch ${options}`, idsStr, context);
    const parseResponse = () => {
      try {
        const results = JSON.parse(str);
        return results;
      } catch (err: any) {
        throw new SSHInvalidResponse(str);
      }
    };
    const { payload, headers } = parseResponse();
    checkVersionCompatibility(headers.version);
    const format = headers.format;
    if (!format) {
      // this is an old version that doesn't have the "format" header
      const componentObjects = CompsAndLanesObjects.fromString(payload);
      return componentObjects.toObjectList().toReadableStream();
    }
    if (format === FETCH_FORMAT_OBJECT_LIST) {
      return ObjectList.fromJsonString(payload).toReadableStream();
    }
    throw new Error(`ssh.fetch, format "${format}" is not supported`);
  }
}
