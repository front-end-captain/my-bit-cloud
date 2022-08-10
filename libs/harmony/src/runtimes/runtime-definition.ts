export type RuntimeDefProps = {
  name: string
};

const DEFAULT_PREDICATE = (filePath: string, name: string) => {
  return filePath.includes(`.${name}.`);
}

export class RuntimeDefinition {
  constructor(
    readonly name: string,
    readonly filePredicate: (filePath: string, name: string) => boolean = DEFAULT_PREDICATE
  ) {}

  getRuntimeFile(paths: string[]): string|undefined {
    return paths.find(path => this.filePredicate(path, this.name));
  }

  static create(def: RuntimeDefProps) {
    return new RuntimeDefinition(def.name);
  }
}
