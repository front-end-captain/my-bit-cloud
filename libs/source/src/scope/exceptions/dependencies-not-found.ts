import { BitError } from '@unknown/bit-error';

export class DependenciesNotFound extends BitError {
  constructor(id: string, dependencies: string[]) {
    super(`fatal: "${id}" has the following dependencies missing: "${dependencies.join(', ')}"`);
  }
}
