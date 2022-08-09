"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromExtensions = exports.fromExtension = void 0;
const factory_1 = require("../factory");
const extension_potential_circular_1 = __importDefault(require("../exceptions/extension-potential-circular"));
function getName(manifest) {
    return Reflect.getMetadata('harmony:name', manifest) || manifest.id || manifest.name;
}
/**
 * build vertices and edges from the given extension
 */
function fromExtension(extension) {
    const vertices = {};
    let edges = [];
    function iterate(root) {
        const id = getName(root);
        if (vertices[id])
            return;
        const instance = (0, factory_1.extensionFactory)(root);
        const validDeps = instance.dependencies.filter(dep => dep).map(dep => (0, factory_1.extensionFactory)(dep));
        if (instance.dependencies.length > validDeps.length) {
            throw new extension_potential_circular_1.default(instance, validDeps);
        }
        vertices[id] = instance;
        const newEdges = validDeps.map(dep => {
            return {
                sourceId: id,
                targetId: dep.name,
                edge: {
                    type: 'dependency'
                }
            };
        });
        edges = edges.concat(newEdges);
        // @ts-ignore
        instance.dependencies.forEach(dep => iterate(dep));
    }
    iterate(extension);
    let vertexArray = [];
    for (let [key, value] of Object.entries(vertices)) {
        vertexArray.push({ id: key, node: value });
    }
    return {
        vertices: vertexArray,
        edges
    };
}
exports.fromExtension = fromExtension;
/**
 * build vertices and edges from the given list of extensions
 */
function fromExtensions(extensions) {
    const perExtension = extensions.map(ext => fromExtension(ext));
    return perExtension.reduce((acc, subgraph) => {
        acc.edges = acc.edges.concat(subgraph.edges);
        acc.vertices = acc.vertices.concat(subgraph.vertices);
        return acc;
    }, { vertices: [], edges: [] });
}
exports.fromExtensions = fromExtensions;