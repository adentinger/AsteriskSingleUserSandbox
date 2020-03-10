import { Caller } from "./Dialplan";
import { Device } from "./Device";
import { spawnSync } from "child_process";

export class SmsFile {
    public static readonly SMS_FILE_DIR = "/var/spool/asterisk/sms";
    protected static readonly SMS_FILE_READ_SCRIPT = "/var/lib/asterisk/sms/manip-sms-data.sh";

    protected static readonly SET_ARG = "-s";
    protected static readonly EXTEN_TO_FIELD = "-t";
    protected static readonly CALLERID_NAME_FIELD = "-n";
    protected static readonly CALLERID_NUM_FIELD = "-u";
    protected static readonly RECEIVED_BY_FIELD = "-r";
    protected static readonly BODY_FIELD = "-b";

    public readonly abspath: string;

    public constructor(filePath: string, exten: number = -1) {
        if (exten === -1) {
            // Assume absolute file path.
            this.abspath = filePath;
        }
        else {
            this.abspath = `${SmsFile.SMS_FILE_DIR}/${exten}/${filePath}`;
        }
    }

    public get extenTo(): string {
        return this.readField(SmsFile.EXTEN_TO_FIELD);
    }

    public set extenTo(value: string) {
        this.writeField(SmsFile.EXTEN_TO_FIELD, value);
    }

    public get caller(): Caller {
        return {
            name: this.readField(SmsFile.CALLERID_NAME_FIELD),
            num: this.readField(SmsFile.CALLERID_NUM_FIELD)
        };
    }

    public set caller(value: Caller) {
        this.writeField(SmsFile.CALLERID_NAME_FIELD, value.name);
        this.writeField(SmsFile.CALLERID_NUM_FIELD, value.num);
    }

    public get receivedBy(): Device[] {
        const receivedByString = this.readField(SmsFile.RECEIVED_BY_FIELD);

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

    public set receivedBy(value: Device[]) {
        this.writeField(
            SmsFile.RECEIVED_BY_FIELD,
            value.map(dev => dev.getDeviceString()).join(",")
        );
    }

    public get body(): string {
        return this.readField(SmsFile.BODY_FIELD);
    }

    public set body(value: string) {
        this.writeField(SmsFile.BODY_FIELD, value);
    }

    public delete(): void {
        const cmd = spawnSync("rm", [this.abspath], {encoding: "utf8"});
        if (cmd.stderr !== "") {
            throw new Error(
                `Could not run rm ${this.abspath}:\n${cmd.stderr}`
            );
        }
    }

    protected readField(arg: string): string {
        const cmd = spawnSync(SmsFile.SMS_FILE_READ_SCRIPT, [this.abspath, arg], {encoding: "utf8"});
        if (cmd.stderr !== "") {
            throw new Error(
                `Could not run ${SmsFile.SMS_FILE_READ_SCRIPT} ${this.abspath} ${arg}:\n${cmd.stderr}`
            );
        }
        return cmd.stdout;
    }

    protected writeField(arg: string, value: string): void {
        const cmd = spawnSync(
            SmsFile.SMS_FILE_READ_SCRIPT,
            [this.abspath, SmsFile.SET_ARG, arg, value],
            {encoding: "utf8"}
        );
        if (cmd.stderr !== "") {
            throw new Error(
                `Could not run ${SmsFile.SMS_FILE_READ_SCRIPT} ` +
                `${this.abspath} ${SmsFile.SET_ARG} ${arg} ${value}:\n${cmd.stderr}`
            );
        }
    }
}
