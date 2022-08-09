import { Extension } from "../extension/extension";
export default class ExtensionLoadError extends Error {
    /**
     * failed extension
     */
    private extension;
    /**
     * extension error
     */
    private originalError;
    /**
     * extension formatted / handled error message
     */
    private msg?;
    constructor(
    /**
     * failed extension
     */
    extension: Extension, 
    /**
     * extension error
     */
    originalError: Error, 
    /**
     * extension formatted / handled error message
     */
    msg?: string);
    toString(): string;
}
