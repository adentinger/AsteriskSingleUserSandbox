import { DeviceStateChangeEvent as amiEvent } from "asterisk-manager";
import { DeviceStateChangeEvent } from "./DeviceStateChangeEvent";
import { Device } from "./Device";

export class DeviceStateChangeEventParser {
    public static parseDeviceStateChangeEvent(e: amiEvent): DeviceStateChangeEvent {
        return new DeviceStateChangeEvent(new Device(e.device), e.state);
    }
}
