import { Caller } from "./Dialplan";
import { Device } from "./Device";
import { spawnSync } from "child_process";

export class SmsFile {
    public static readonly SMS_FILE_DIR = "/var/spool/asterisk/sms";
    protected static readonly SMS_FILE_READ_SCRIPT = "/var/lib/asterisk/sms/get-sms-data.sh";

    protected file: string;

    public constructor(fileBasename: string, exten: number) {
        this.file = `${SmsFile.SMS_FILE_DIR}/${exten}/${fileBasename}`;
    }

    public get extenTo(): string {
        return this.readHeader("-t");
    }

    public get caller(): Caller {
        return {
            name: this.readHeader("-n"),
            num: this.readHeader("-u")
        };
    }

    public get receivedBy(): Device[] {
        const receivedByString = this.readHeader("-r");

        // Note that this is vulnerable to injection if a device name
        // contains a comma.
        const deviceStringsMatches = receivedByString.match(/[^,]+/g);
        if (deviceStringsMatches) {
            return deviceStringsMatches.map(ds => new Device(ds));
        }
        else {
            return [];
        }
    }

    public get body(): string {
        return this.readHeader("-b");
    }

    protected readHeader(arg: string): string {
        const cmd = spawnSync(SmsFile.SMS_FILE_READ_SCRIPT, [this.file, arg], {encoding: "utf8"});
        return cmd.stdout;
    }
}
