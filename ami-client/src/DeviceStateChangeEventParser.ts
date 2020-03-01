import { DeviceStateChangeEvent as amiEvent } from "asterisk-manager";
import { DeviceStateChangeEvent } from "./DeviceStateChangeEvent";
import { Chan, Device } from "./Device";

export class DeviceStateChangeEventParser {
    public static parseDeviceStateChangeEvent(e: amiEvent): DeviceStateChangeEvent {
        const chanMatches = e.device.match(/^(?:PJSIP|SIP)(?=\/)/);
        if (!chanMatches) {
            throw new Error(`Device "${e.device}" does not begin with "PJSIP/" or "SIP/"`);
        }
        const chan = chanMatches[0] as Chan;
        const endpoint = e.device.substr(chan.length + 1);

        const device: Device = {
            chan: chan,
            endpoint: endpoint
        };
        return new DeviceStateChangeEvent(device, e.state);
    }
}
