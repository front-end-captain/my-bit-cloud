import { Extension } from "../extension/extension";
import { HarmonyError } from "./harmony-error";
export default class ExtensionPotentialCircular extends HarmonyError {
    /**
     * failed extension
     */
    private extension;
    /**
     * valid extensions dependencies
     */
    private validDeps;
    constructor(
    /**
     * failed extension
     */
    extension: Extension, 
    /**
     * valid extensions dependencies
     */
    validDeps: Extension[]);
    toString(): string;
}