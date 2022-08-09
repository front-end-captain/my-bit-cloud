"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Harmony = void 0;
require("reflect-metadata");
const extension_graph_1 = __importDefault(require("./extension-graph/extension-graph"));
const exceptions_1 = require("./exceptions");
const utils_1 = require("./utils");
const config_1 = require("./config");
const runtimes_1 = require("./runtimes/runtimes");
const exceptions_2 = require("./runtimes/exceptions");
class Harmony {
    constructor(
    /**
     * extension graph
     */
    graph, 
    /**
     * harmony top level config
     */
    config, runtimes, activeRuntime) {
        this.graph = graph;
        this.config = config;
        this.runtimes = runtimes;
        this.activeRuntime = activeRuntime;
        this.current = null;
    }
    /**
     * list all registered extensions
     */
    get extensions() {
        return this.graph.nodes;
    }
    /**
     * list all registered extensions ids
     */
    get extensionsIds() {
        return [...this.graph.nodes.keys()];
    }
    /**
     * load an Aspect into the dependency graph.
     */
    load(extensions) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.set(extensions);
        });
    }
    /**
     * set extensions during Harmony runtime.
     * hack!
     */
    set(extensions) {
        return __awaiter(this, void 0, void 0, function* () {
            this.graph.load(extensions);
            // Only load new extensions and their dependencies
            const extensionsToLoad = extensions.map((ext) => {
                // @ts-ignore
                return Reflect.getMetadata('harmony:name', ext) || ext.id || ext.name;
            });
            // @ts-ignore
            yield this.graph.enrichRuntime(this.runtime, this.runtimes, () => { });
            // @ts-ignore
            const subgraphs = this.graph.successorsSubgraph(extensionsToLoad);
            if (subgraphs) {
                const executionOrder = subgraphs.toposort(true);
                yield (0, utils_1.asyncForEach)(executionOrder, (ext) => __awaiter(this, void 0, void 0, function* () {
                    if (!this.runtime)
                        throw new exceptions_2.RuntimeNotDefined(this.activeRuntime);
                    yield this.runOne(ext, this.runtime);
                }));
            }
        });
    }
    runOne(extension, runtime) {
        return __awaiter(this, void 0, void 0, function* () {
            if (extension.loaded)
                return;
            // create an index of all vertices in dependency graph
            const deps = this.graph.getRuntimeDependencies(extension, runtime);
            const instances = deps.map(extension => extension.instance);
            try {
                return extension.__run(instances, this, runtime);
            }
            catch (err) {
                throw new exceptions_1.ExtensionLoadError(extension, err);
            }
        });
    }
    getDependencies(aspect) {
        if (!this.runtime)
            throw new exceptions_2.RuntimeNotDefined(this.activeRuntime);
        return this.graph.getRuntimeDependencies(aspect, this.runtime);
    }
    initExtension(id) {
        this.current = id;
    }
    endExtension() {
        this.current = null;
    }
    /**
     * get an extension from harmony.
     */
    get(id) {
        const extension = this.graph.get(id);
        if (!extension || !extension.instance)
            throw new Error(`failed loading extension ${id}`);
        return extension.instance;
    }
    resolveRuntime(name) {
        return this.runtimes.get(name);
    }
    run(requireFn) {
        return __awaiter(this, void 0, void 0, function* () {
            const runtime = this.resolveRuntime(this.activeRuntime);
            this.runtime = runtime;
            const defaultRequireFn = (aspect, runtime) => __awaiter(this, void 0, void 0, function* () {
                const runtimeFile = runtime.getRuntimeFile(aspect.files);
                if (!runtimeFile)
                    return;
                // runtime.require(runtimeFile);
            });
            // requireFn ? await requireFn(aspect, runtime) : defaultRequireFn(this.graph);
            yield this.graph.enrichRuntime(runtime, this.runtimes, requireFn || defaultRequireFn);
            const executionOrder = this.graph.byExecutionOrder();
            yield (0, utils_1.asyncForEach)(executionOrder, (ext) => __awaiter(this, void 0, void 0, function* () {
                yield this.runOne(ext, runtime);
            }));
        });
    }
    static load(aspects, runtime, globalConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const aspectGraph = extension_graph_1.default.from(aspects);
            const runtimes = yield runtimes_1.Runtimes.load(aspectGraph);
            return new Harmony(aspectGraph, config_1.Config.from(globalConfig), runtimes, runtime);
        });
    }
}
exports.Harmony = Harmony;
