import { spawnSync } from "child_process";
import { DeviceState } from "./DeviceState";
import { DeviceStateChangeEvent } from "./DeviceStateChangeEvent";
import { SmsReceivedUserEvent } from "./UserEventParser";

export class AmiEventHandler {
    protected readonly deviceStates: Map<string, DeviceState> = new Map();

    public constructor() { }

    public onDeviceStateChange(e: DeviceStateChangeEvent) {
        const existingDs = this.deviceStates.get(e.state.getAmiDeviceString());

        const becomesAvailable = !existingDs && e.state.isDeviceAvailable();
        const becomesUnavailable = !e.state.isDeviceAvailable();
        if (becomesAvailable) {
            this.deviceStates.set(e.state.getAmiDeviceString(), e.state);
            this.onConnect(e);
        }
        else if (becomesUnavailable) {
            this.deviceStates.delete(e.state.getAmiDeviceString());
            this.onDisconnect(e);
        }
    }

    public onSmsReceived(e: SmsReceivedUserEvent): void {
        console.log("TODO", e);
    }

    protected onConnect(e: DeviceStateChangeEvent): void {
        console.log(`Device ${e.state.getAmiDeviceString()} is connecting (${e.state.value})`);
    }

    protected onDisconnect(e: DeviceStateChangeEvent) {
        console.log(`Device ${e.state.getAmiDeviceString()} is disconnecting (${e.state.value})`);
    }
}
