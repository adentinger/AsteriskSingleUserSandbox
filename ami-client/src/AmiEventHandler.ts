import { spawnSync } from "child_process";
import { DeviceState } from "./DeviceState";
import { DeviceStateChangeEvent } from "./DeviceStateChangeEvent";
import { SmsReceivedUserEvent } from "./UserEventParser";
import { PendingSmsMessages } from "./PendingSmsMessages";
import { AmiMessageSendAction } from "./AmiMessageSendAction";
import { ManagerInstance } from "asterisk-manager";

export class AmiEventHandler {
    protected readonly deviceStates: Map<string, DeviceState> = new Map();
    protected readonly pendingMessages: PendingSmsMessages;
    protected messageSender!: AmiMessageSendAction;
    protected isAmiInstanceSet: boolean = false;

    public constructor() {
        this.pendingMessages = new PendingSmsMessages();
    }

    public setAmiInstance(ami: ManagerInstance): void {
        if (!this.messageSender) {
            this.messageSender = new AmiMessageSendAction(ami);
            this.isAmiInstanceSet = true;
        }
        else {
            throw new Error(`Cannot ${this.setAmiInstance.name}() a second time.`);
        }
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
        this.assertAmiInstanceIsSet();

        console.log(`Device ${e.state.getAmiDeviceString()} is connecting (${e.state.value})`);
        const pendingSmsForDevice = this.pendingMessages.getNotReceivedBy(e.state.device);
        pendingSmsForDevice.forEach(sms => {
            console.log("Sending", sms.abspath, "to", e.state.device.getDeviceString());
            this.messageSender.messageSend(e.state.device, sms)
                .then(() => {
                    const receivedBy = sms.receivedBy;
                    receivedBy.push(e.state.device);
                    sms.receivedBy = receivedBy;
                })
                .catch(err => {
                    console.error(`Could not send SMS ${sms.abspath} to ${e.state.device.getDeviceString()}: `, err);
                });
        });
    }

    protected onDisconnect(e: DeviceStateChangeEvent) {
        console.log(`Device ${e.state.getAmiDeviceString()} is disconnecting (${e.state.value})`);
    }

    protected assertAmiInstanceIsSet(): void {
        if (!this.isAmiInstanceSet) {
            throw new Error(`Ami instance is not set (not connected to AMI yet?)`);
        }
    }
}
