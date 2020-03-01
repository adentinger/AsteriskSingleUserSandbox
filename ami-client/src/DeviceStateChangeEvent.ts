import { DeviceState as amiState } from "asterisk-manager";
import { DeviceState } from "./DeviceState";
import { Device } from "./Device";

export class DeviceStateChangeEvent {
    public readonly state: DeviceState;

    public constructor(device: Device, state: amiState) {
        this.state = new DeviceState(device, state);
    }
}
