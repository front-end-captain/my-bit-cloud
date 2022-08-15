export class BitError extends Error {
  isUserError = true; // user errors are not reported to Sentry

  constructor(msg?: string) {
    super(msg || '');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.name = this.constructor.name; // otherwise, the "name" is just Error.
  }

  /**
   * override if you want your error to be pretty (e.g. with color with chalk).
   * eventually, the error shown to the user is the output of this method
   */
  report(): string {
    return this.message;
  }
}