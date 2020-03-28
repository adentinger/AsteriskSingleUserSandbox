export class Util {
    public static delay(timeMs: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), timeMs);
        });
    }
}
