/**
 * Holds a promise, and allows resolving or rejecting that promise.
 */
export class ObservablePromiseHolder<T> {

    protected promiseInternal: Promise<T>;
    protected resolveInternal: () => void;
    protected rejectInternal: () => void;

    public constructor() {
        this.promiseInternal = new Promise((resolve, reject) => {
            this.resolveInternal = resolve;
            this.rejectInternal = reject;
        });
    }

}
