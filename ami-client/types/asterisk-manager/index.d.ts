declare module "asterisk-manager" {

export function Manager(port: string, host: string, username: string, password: string, events: boolean): ManagerInstance;

export class ManagerInstance {
    on(event: string, callback: (e: Event) => void): void;
    on(event: "contactstatus", callback: (e: ContactStatusEvent) => void): void;
    on(event: "devicestatechange", callback: (e: DeviceStateChangeEvent) => void): void;
    on(event: "userevent", callback: (e: UserEvent) => void): void;
    on(event: "endpointlist", callback: (e: EndpointList) => void): void;
    on(event: "endpointlistcomplete", callback: (e: EndpointListComplete) => void): void;

    action(act: Action, callback?: (err: any, res: ActionResponse) => void): void;
    action(act: MessageSendAction, callback?: (err: any, res: ActionResponse) => void): void;

    keepConnected(): void;
    connect(): void;
    isConnected(): boolean;
}

export interface Event {
    event: string;
}

export interface ContactStatusEvent extends Event {
    privilege: string;
    uri: string;
    contactstatus: string;
    aor: string;
    endpointname: string;
    roundtripusec: string;
}

export type DeviceState = 
    "UNKNOWN" | "NOT_INUSE" | "INUSE" | "BUSY" | "INVALID" |
    "UNAVAILABLE" | "RINGING" | "RINGINUSE" | "ONHOLD";

export interface DeviceStateChangeEvent extends Event {
    privilege: string;
    device: string;
    state: DeviceState;
}

export interface EndpointList extends Event {
    event: "EndpointList",
    actionid: string,
    objecttype: "endpoint",
    objectname: string,
    transport: string,
    aor: string,
    auths: string,
    outboundauths: string,
    contacts: string,
    devicestate: DeviceState,
    activechannels: string
}

export interface EndpointListComplete extends Event {
    event: "EndpointListComplete";
    actionid: string;
    eventlist: string;
    listitems: string;
}

export interface UserEvent extends Event {
    channel: string,
    channelstate: string,
    channelstatedesc: string,
    calleridnum: string,
    calleridname: string,
    connectedlinenum: string,
    connectedlinename: string,
    language: string,
    accountcode: string,
    context: string,
    exten: string,
    priority: string,
    uniqueid: string,
    linkedid: string,
    userevent: string,
}

export interface Action {
    action: string;
    actionid?: string;
}

interface MessageSendActionBase extends Action {
    action: "messagesend";
    to: string;
    from: string;
    variable?: string;
}

export interface MessageSendActionStringEncoding extends MessageSendActionBase {
    body: string;
}

export interface MessageSendActionBase64Encoding extends MessageSendActionBase {
    base64body: string;
}

type MessageSendAction = MessageSendActionStringEncoding | MessageSendActionBase64Encoding;

export interface ActionResponse {
    response: string;
    actionid: string;
    message: string;
}

export default Manager;

}
