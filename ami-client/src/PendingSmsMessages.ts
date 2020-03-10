import { SmsFile } from "./SmsFile";
import { Pjsip } from "./Pjsip";
import { SmsFiles } from "./SmsFiles";

export class PendingSmsMessages {
    protected readonly pending: Map<string, SmsFile> = new Map();

    public constructor() {
        SmsFiles
            .loadSmsFiles()
            .forEach(smsFile => {
                this.scheduleSmsReception(smsFile);
            });
    }

    public add(sms: SmsFile): void {
        this.scheduleSmsReception(sms);
    }

    protected scheduleSmsReception(smsFile: SmsFile): void {
        const receivedBy = smsFile.receivedBy;
        const receivedByAll = Pjsip.DEVICES.every(dev1 => receivedBy.some(dev2 => dev1.equals(dev2)));
        if (receivedByAll) {
            console.log(`SMS ${smsFile} received by all. Deleting.`);
            smsFile.delete();
            this.pending.delete(smsFile.abspath);
        }
        else {
            this.pending.set(smsFile.abspath, smsFile);
            console.log(`SMS ${smsFile} not received by all. Keeping.`, this.pending);
        }
    }
}
