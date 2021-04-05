class CanceledError extends Error {

    private static readonly BASE_MESSAGE = "A cancel error was sent";

    constructor(message?: string) {
        super(`${CanceledError.BASE_MESSAGE}${message ? ": " : "."}${message ? message : ""}`);
        // From here: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#example
        Object.setPrototypeOf(this, new.target.prototype);
    }

}