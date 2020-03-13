import { spawnSync } from "child_process";
import { DeviceState } from "./DeviceState";
import { DeviceStateChangeEvent } from "./DeviceStateChangeEvent";
import { SmsReceivedUserEvent } from "./UserEventParser";
import { PendingSmsMessages } from "./PendingSmsMessages";

export class AmiEventHandler {
    protected readonly deviceStates: Map<string, DeviceState> = new Map();
    protected readonly pendingMessages: PendingSmsMessages;

    public constructor() {
        this.pendingMessages = new PendingSmsMessages();
    }

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
        this.pendingMessages.updateSmsStatus(e.file);
    }

    protected onConnect(e: DeviceStateChangeEvent): void {
        console.log(`Device ${e.state.getAmiDeviceString()} is connecting (${e.state.value})`);
        const pendingSmsForDevice = this.pendingMessages.getNotReceivedBy(e.state.device);
        pendingSmsForDevice.forEach(sms => {
            console.log("Sending", sms.abspath, "to", e.state.device.getDeviceString());
            // TODO Actually send the SMS message. If the message was sent
            // successfully, update the receivedBy field of the SMS file.
            this.pendingMessages.updateSmsStatus(sms);
        });
    }

    protected onDisconnect(e: DeviceStateChangeEvent) {
        console.log(`Device ${e.state.getAmiDeviceString()} is disconnecting (${e.state.value})`);
    }
}
