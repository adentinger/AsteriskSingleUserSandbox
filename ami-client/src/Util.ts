/**
 * Utilitary stuff.
 *
 * Personally, I feel like "Util" classes tend to turn
 * into a huge mess because "Util" stuff is often stuff you don't want
 * to bother finding a place for, but for only a few functions it's not
 * too bad.
 */
export class Util {
    public static delay(timeMs: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), timeMs);
        });
    }
}
