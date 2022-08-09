import { ExtensionManifest } from '../extension';
import { Extension } from '../extension';
import { Edge } from './extension-graph';
/**
 * build vertices and edges from the given extension
 */
export declare function fromExtension(extension: ExtensionManifest): {
    vertices: {
        id: string;
        node: Extension;
    }[];
    edges: {
        sourceId: string;
        targetId: string;
        edge: Edge;
    }[];
};
/**
 * build vertices and edges from the given list of extensions
 */
export declare function fromExtensions(extensions: ExtensionManifest[]): {
    vertices: {
        id: string;
        node: Extension;
    }[];
    edges: {
        sourceId: string;
        targetId: string;
        edge: Edge;
    }[];
};
