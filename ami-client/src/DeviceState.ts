import { DeviceState as AmiState } from "asterisk-manager";
import { Device } from "./Device";

export class DeviceState {
    public readonly device: Device;
    public readonly value: AmiState;

    public constructor(device: Device, state: AmiState) {
        this.device = device;
        this.value = state;
    }

    public getAmiDeviceString(): string {
        return `${this.device.chan}/${this.device.endpoint}`;
    }

    public isDeviceAvailable(): boolean {
        return this.value !== "UNAVAILABLE";
    }
}
