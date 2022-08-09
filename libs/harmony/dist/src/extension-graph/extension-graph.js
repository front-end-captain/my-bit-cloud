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
Object.defineProperty(exports, "__esModule", { value: true });
const cleargraph_1 = require("cleargraph");
const from_extension_1 = require("./from-extension");
function getName(manifest) {
    return Reflect.getMetadata('harmony:name', manifest) || manifest.id || manifest.name;
}
class DependencyGraph extends cleargraph_1.Graph {
    constructor() {
        super(...arguments);
        this.cache = new Map();
    }
    getRuntimeDependencies(aspect, runtime) {
        const dependencies = this.successors(aspect.name);
        const runtimeDeps = this.successors(aspect.name, (edge) => {
            if (!edge.runtime)
                return false;
            return edge.runtime === runtime.name;
        });
        const runtimeManifest = aspect.getRuntime(runtime);
        if (!runtimeManifest)
            return Array.from(dependencies.values());
        if (runtimeDeps && runtimeDeps.size)
            return this.sortDeps(runtimeManifest.dependencies, Array.from(runtimeDeps.values()));
        return this.sortDeps(runtimeManifest.dependencies, Array.from(dependencies.values()));
    }
    sortDeps(originalDependencies, targetDependencies) {
        return targetDependencies.sort((a, b) => {
            return originalDependencies.findIndex(item => item.id === a.id) - originalDependencies.findIndex(item => item.id === b.id);
        });
    }
    byExecutionOrder() {
        return this.toposort(true);
    }
    enrichRuntimeExtension(id, aspect, runtime, runtimes, requireFn) {
        return __awaiter(this, void 0, void 0, function* () {
            yield requireFn(aspect, runtime);
            const runtimeManifest = aspect.getRuntime(runtime);
            if (!runtimeManifest)
                return;
            const deps = runtimeManifest.dependencies;
            if (!deps)
                return;
            const promises = deps.map((dep) => __awaiter(this, void 0, void 0, function* () {
                if (!this.hasNode(dep.id)) {
                    this.add(dep);
                    if (dep.declareRuntime) {
                        runtimes.add(dep.declareRuntime);
                    }
                    yield requireFn(this.get(dep.id), runtime);
                    yield this.enrichRuntimeExtension(dep.id, this.get(dep.id), runtime, runtimes, requireFn);
                }
                this.setEdge(id, dep.id, {
                    runtime: runtime.name,
                    type: 'runtime-dependency'
                });
            }));
            return Promise.all(promises);
        });
    }
    enrichRuntime(runtime, runtimes, requireFn) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = Array.from(this.nodes.entries()).map(([id, aspect]) => __awaiter(this, void 0, void 0, function* () {
                return this.enrichRuntimeExtension(id, aspect, runtime, runtimes, requireFn);
            }));
            return Promise.all(promises);
        });
    }
    add(manifest) {
        const { vertices, edges } = (0, from_extension_1.fromExtension)(manifest);
        this.setNodes(vertices);
        this.setEdges(edges);
        return this;
    }
    load(extensions) {
        const newExtensions = extensions.filter((extension) => {
            if (!extension.id)
                return false;
            return !this.get(extension.id);
        });
        const { vertices, edges } = (0, from_extension_1.fromExtensions)(newExtensions);
        // Only set new vertices
        this.setNodes(vertices, false); // false because we don't want to override already-loaded extensions
        this.setEdges(edges);
        return this;
    }
    // :TODO refactor this asap
    getExtension(manifest) {
        const id = getName(manifest);
        const cachedVertex = this.cache.get(id);
        if (cachedVertex)
            return cachedVertex;
        const res = this.node(id);
        if (res) {
            this.cache.set(res.name, res);
            return res;
        }
        return null;
    }
    get extensions() {
        return Array.from(this.nodes.values());
    }
    get aspects() {
        return this.extensions;
    }
    get(id) {
        const cachedVertex = this.cache.get(id);
        if (cachedVertex)
            return cachedVertex;
        const res = this.node(id);
        if (res) {
            this.cache.set(res.name, res);
            return res;
        }
        return null;
    }
    /**
     * build Harmony from a single extension.
     */
    static fromRoot(extension) {
        const { vertices, edges } = (0, from_extension_1.fromExtension)(extension);
        return new DependencyGraph(vertices, edges);
    }
    /**
     * build Harmony from set of extensions
     */
    static from(extensions) {
        const { vertices, edges } = (0, from_extension_1.fromExtensions)(extensions);
        return new DependencyGraph(vertices, edges);
    }
}
exports.default = DependencyGraph;
