import { UserEvent as AmiUserEvent } from "asterisk-manager";
import { Device } from "./Device";
import { Caller } from "./Dialplan";

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
    body: string;
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

        // Have to specify device having received the SMS into
        // comma-seperated stringification, otherwise the AMI
        // framework overrides the header arguments by the last one
        // if it is specified multiple times.
        //
        // Note that this is vulnerable to injection if a device name
        // contains a comma.
        if ((e as any).receivedby) {
            const headerValue = (e as any).receivedby as string;
            const deviceStringsMatches = headerValue.match(/[^,]+/g);
            if (deviceStringsMatches) {
                srue.smsReceivedBy = deviceStringsMatches.map(ds => new Device(ds));
            }
        }

        if (!srue.smsReceivedBy) {
            srue.smsReceivedBy = [];
        }

        srue.body = (e as any).body || "";
        return srue;
    }
}
