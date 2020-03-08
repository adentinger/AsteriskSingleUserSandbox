import { UserEvent as AmiUserEvent } from "asterisk-manager";
import { Device } from "./Device";
import { Caller } from "./Dialplan";
import { SmsFile } from "./SmsFile";

export const SMS_RECEIVED_STRING = "SmsReceived";
export type UserEventTypeString = "SmsReceived";

export interface GenericUserEvent {
    type: UserEventTypeString;
    caller: Caller;
    language: string;
    context: string;
    exten: string;
}

export interface SmsReceivedUserEvent extends GenericUserEvent {
    /**
     * List of devices that received the SMS.
     */
    smsReceivedBy: Device[];
    /**
     * File the SMS message is saved in.
     * This file is in /var/spool/asterisk/sms/<destination exten> .
     */
    file: SmsFile;
}

export class UserEventParser {
    public static parse(e: AmiUserEvent): GenericUserEvent {
        if (e.userevent === SMS_RECEIVED_STRING) {
            return UserEventParser.parseSmsReceived(e);
        }
        throw new Error(`User event ${e.userevent} cannot be parsed because is unknown event.`);
    }

    protected static parseGeneric(e: AmiUserEvent): GenericUserEvent {
        const gue: GenericUserEvent = {
            type: e.userevent as UserEventTypeString,
            caller: { name: e.calleridname, num: e.calleridnum },
            context: e.context,
            exten: e.exten,
            language: e.language
        };
        return gue;
    }

    protected static parseSmsReceived(e: AmiUserEvent): SmsReceivedUserEvent {
        const srue = this.parseGeneric(e) as SmsReceivedUserEvent;
        srue.file = new SmsFile((e as any).file, (e as any).extento);
        srue.smsReceivedBy = srue.file.receivedBy;
        return srue;
    }
}
