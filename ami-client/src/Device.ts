
export type Chan = "PJSIP" | "SIP";

export class Device {
    public readonly chan: Chan;
    public readonly endpoint: string;

    public constructor(chan: Chan, endpoint: string) {
        this.chan = chan;
        this.endpoint = endpoint;
    }

}
