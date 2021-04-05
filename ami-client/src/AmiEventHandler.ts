import { DeviceState } from "./DeviceState";
import { DeviceStateChangeEvent } from "./DeviceStateChangeEvent";
import { SmsReceivedUserEvent } from "./UserEventParser";
import { PendingSmsMessages } from "./PendingSmsMessages";
import { AmiMessageSendAction } from "./AmiMessageSendAction";
import { ManagerInstance } from "asterisk-manager";
import { Device } from "./Device";
import { SmsFile } from "./SmsFile";
import { Util } from "./Util";

export class AmiEventHandler {

    public static readonly TRANSMISSION_DELAY_MS = 1000;

    protected readonly deviceStates: Map<string, DeviceState> = new Map();
    protected readonly pendingMessages: PendingSmsMessages;
    protected messageSender!: AmiMessageSendAction;
    protected isAmiInstanceSet: boolean = false;
    protected isMessageSendingCanceled: boolean = false;
    protected cancelAsserter: () => void;
    protected messageSendingDone: Promise<void>;

    public constructor() {
        this.pendingMessages = new PendingSmsMessages();
        this.cancelAsserter = () => {
            if (this.isMessageSendingCanceled) {
                this.isMessageSendingCanceled = false;
                throw new CanceledError();
            }
        };
        this.messageSendingDone = Promise.resolve();
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

        console.log(`Device ${e.state.getAmiDeviceString()} is connected (${e.state.value})`);
        const pendingSmsForDevice = this.pendingMessages.getNotReceivedBy(e.state.device);
        this.sendMessages(e.state.device, pendingSmsForDevice, this.cancelAsserter);
    }

    protected onDisconnect(e: DeviceStateChangeEvent) {
        console.log(`Device ${e.state.getAmiDeviceString()} is disconnected (${e.state.value})`);
    }

    /**
     * Sends a list of messages to a device, wating for each message
     * to be correctly received before sending the next.
     * @param to The device to send the SMS to.
     * @param messages The list of messages to send.
     * @param assertNotCanceled A closure that throws a CanceledError when we
     * need to stop sending messages early.
     */
    protected async sendMessages(to: Device, messages: SmsFile[], assertNotCanceled: () => void): Promise<void> {
        for (let i = 0; i < messages.length; ++i) {
            assertNotCanceled();
            const sms = messages[i];
            console.log(
                "Sending", sms.abspath, "to", to.getDeviceString(), "; body:", sms.body,
                "; timestamp:", sms.date
            );
            // This throws an error if the message was not received correctly.
            await this.messageSender.messageSend(to, sms);
            assertNotCanceled();

            const isLastMessage = i === (messages.length - 1);
            if (!isLastMessage) {
                // Wait a moment before sending the next message ; some
                // clients (e.g. Zoiper :S) do not seem to handle receiving
                // text messsages rapidly very well.
                await Util.delay(AmiEventHandler.TRANSMISSION_DELAY_MS);
            }

            const receivedBy = sms.receivedBy;
            receivedBy.push(to);
            sms.receivedBy = receivedBy;
        }
    }

    protected assertAmiInstanceIsSet(): void {
        if (!this.isAmiInstanceSet) {
            throw new Error(`Ami instance is not set (not connected to AMI yet?)`);
        }
    }
}
