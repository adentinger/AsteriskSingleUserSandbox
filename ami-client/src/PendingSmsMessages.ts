import { SmsFile } from "./SmsFile";
import { Pjsip } from "./Pjsip";
import { SmsFiles } from "./SmsFiles";
import { Device } from "./Device";

export class PendingSmsMessages {
    /**
     * List of pending SmsFile. Key is the absolute path to the file.
     */
    protected readonly pendingByFilename: Map<string, SmsFile> = new Map();
    /**
     * List of SmsFiles pending to a device. Key is the device string of
     * the device.
     */
    protected readonly pendingByDevice: Map<string, Set<string>> = new Map();

    public constructor() {
        SmsFiles
            .loadSmsFiles()
            .forEach(smsFile => {
                this.scheduleSmsReceptionInternal(smsFile);
            });
    }

    public scheduleSmsReception(sms: SmsFile): void {
        this.scheduleSmsReceptionInternal(sms);
    }

    public getNotReceivedBy(device: Device): Set<SmsFile> {
        const absPathSet = this.pendingByDevice.get(device.getDeviceString()) || new Set();
        const notReceivedList = new Set<SmsFile>();
        absPathSet.forEach(smsAbsPath => notReceivedList.add(new SmsFile(smsAbsPath)));
        return notReceivedList;
    }

    /**
     * Unschedules the transmission of the SMS file, and also deletes it
     * from the disk. Ideally, this
     * @param sms The SMS file to remove.
     */
    protected remove(sms: SmsFile): void {
        this.pendingByFilename.delete(sms.abspath);
        this.pendingByDevice.forEach(pendingSmsSet => pendingSmsSet.delete(sms.abspath));
        sms.delete();
    }

    protected scheduleSmsReceptionInternal(smsFile: SmsFile): void {
        const receivedByAll = Pjsip.DEVICES.every(dev1 => smsFile.receivedBy.some(dev2 => dev1.equals(dev2)));
        if (receivedByAll) {
            console.log("SMS", smsFile, "received by all. Deleting.");
            // Delete from this object in case we already had the SMS file in our list.
            this.remove(smsFile);
        }
        else {
            console.log("SMS", smsFile.abspath, "not received by all. Keeping.");
            this.pendingByFilename.set(smsFile.abspath, smsFile);
            const notReceivedBy = Pjsip.DEVICES.filter(
                device => !smsFile.receivedBy.some(receiver => device.equals(receiver))
            );
            notReceivedBy.forEach(device => {
                // Create the SmsFile set for this device if it does not exist.
                if (!this.pendingByDevice.has(device.getDeviceString())) {
                    this.pendingByDevice.set(device.getDeviceString(), new Set());
                }
                this.pendingByDevice.get(device.getDeviceString())?.add(smsFile.abspath);
            });
        }
    }
}
