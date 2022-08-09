"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCompiler = void 0;
// @Extension()
class BaseCompiler {
    constructor(cli) {
        this.cli = cli;
    }
    // @Config()
    config() {
        return {
            cjs: 'blue/green'
        };
    }
    // @Command
    main() {
        return {
            synopsis: 'compile <id>',
            report: () => {
                return 'compiled in 0.1 secs';
            }
        };
    }
    compile() {
        this.cli.run();
        return 'hello world';
    }
}
exports.BaseCompiler = BaseCompiler;