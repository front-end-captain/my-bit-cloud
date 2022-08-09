"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeDefinition = void 0;
const DEFAULT_PREDICATE = (filePath, name) => {
    return filePath.includes(`.${name}.`);
};
class RuntimeDefinition {
    constructor(name, filePredicate = DEFAULT_PREDICATE) {
        this.name = name;
        this.filePredicate = filePredicate;
    }
    getRuntimeFile(paths) {
        return paths.find(path => this.filePredicate(path, this.name));
    }
    require(file) {
        // try {
        //   require(file);
        // } catch(err) {
        //   throw new RuntimeModuleError(err);
        // }
    }
    static create(def) {
        return new RuntimeDefinition(def.name);
    }
}
exports.RuntimeDefinition = RuntimeDefinition;