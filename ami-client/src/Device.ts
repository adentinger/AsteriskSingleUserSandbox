
export type Chan = "PJSIP" | "SIP";

export class Device {
    public readonly chan: Chan;
    public readonly endpoint: string;

    public constructor(deviceString: string) {
        const d = this.parseDeviceString(deviceString);
        this.chan = d.chan;
        this.endpoint = d.endpoint;
    }

    protected parseDeviceString(ds: string): {chan: Chan, endpoint: string} {
        const chanMatches = ds.match(/^(?:PJSIP|SIP)(?=\/)/);
        if (!chanMatches) {
            throw new Error(`Device "${ds}" does not begin with "PJSIP/" or "SIP/"`);
        }
        const chan = chanMatches[0] as Chan;
        const endpoint = ds.substr(chan.length + 1);

        return {chan: chan, endpoint: endpoint};
    }
}
