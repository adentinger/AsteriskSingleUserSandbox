import { ManagerInstance, Action } from "asterisk-manager";
import { Device } from "./Device";
import { SmsFile } from "./SmsFile";

export class AmiMessageSendAction {

    protected readonly ami: ManagerInstance;

    public constructor(ami: ManagerInstance) {
        this.ami = ami;
    }

    public messageSend(to: Device, message: SmsFile): Promise<void> {
        return new Promise((resolve, reject) => {
            // Send message as base64, otherwise characters like
            // CR/LF would make the send fail.
            const buf = new Buffer(message.body);
            const asBase64 = buf.toString("base64");
            const act = {
                action: "messagesend",
                to: `${to.chan.toLowerCase()}:${to.endpoint}`,
                from: `${message.caller.num}`,
                base64body: asBase64
            };

            this.ami.action(act, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }

}
