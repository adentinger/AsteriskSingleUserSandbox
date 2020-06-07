import { SmsFile } from "./SmsFile";
import { SmsFiles } from "./SmsFiles";
import { Device } from "./Device";

export class PendingSmsMessages {
    /**
     * List of pending SmsFiles. Key is the absolute path to the file.
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
                this.scheduleSmsReception(smsFile);
            });
    }

    /**
     * Reads the SMS file and does whatever is appropriate with it:
     * add it to the list of pending messages if it didn't exist,
     * update it if it did, or remove and delete it if it was
     * received by all devices.
     * @param sms The SMS file to take the modifications of into account.
     */
    public updateSmsStatus(sms: SmsFile): void {
        this.scheduleSmsReception(sms);
    }

    /**
     * Gets an array of all messages not received by given device, sorted
     * from oldest nonreceived to newest nonreceived.
     * @param device The device to get the messages not received by.
     */
    public getNotReceivedBy(device: Device): SmsFile[] {
        const absPathSet = this.pendingByDevice.get(device.getDeviceString()) || new Set();
        const notReceivedList: SmsFile[] = [];
        absPathSet.forEach(smsAbsPath => notReceivedList.push(new SmsFile(smsAbsPath)));
        notReceivedList.sort((a, b) => {
            const dateA = a.date;
            const dateB = b.date;
            return dateA.getTime() - dateB.getTime();
        });
        return notReceivedList;
    }

    /**
     * Unschedules the transmission of the SMS file, and also deletes it
     * from the disk.
     * @param sms The SMS file to remove.
     */
    protected remove(sms: SmsFile): void {
        this.pendingByFilename.delete(sms.abspath);
        this.pendingByDevice.forEach(pendingSmsSet => pendingSmsSet.delete(sms.abspath));
        sms.delete();
    }

    protected scheduleSmsReception(sms: SmsFile): void {
        if (sms.wasReceivedByAll()) {
            if (!this.pendingByFilename.has(sms.abspath)) {
                console.log("New SMS", sms.abspath, "received by all. Deleting.");
            }
            else {
                console.log("Updated SMS", sms.abspath, "received by all. Deleting.");
            }
            // Delete from this object in case we already had the SMS file in our list.
            this.remove(sms);
        }
        else {
            if (!this.pendingByFilename.has(sms.abspath)) {
                console.log("New SMS", sms.abspath, "not received by all. Keeping.");
            }
            else {
                console.log("Updated SMS", sms.abspath, "not received by all. Keeping.");
            }
            this.pendingByFilename.set(sms.abspath, sms);
            sms.getNotReceivedBy().forEach(device => {
                // Create the SmsFile set for this device if it does not exist.
                if (!this.pendingByDevice.has(device.getDeviceString())) {
                    this.pendingByDevice.set(device.getDeviceString(), new Set());
                }
                this.pendingByDevice.get(device.getDeviceString())?.add(sms.abspath);
            });
        }
    }
}
