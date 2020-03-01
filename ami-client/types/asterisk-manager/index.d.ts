declare module "asterisk-manager" {

export function Manager(port: string, host: string, username: string, password: string, events: boolean): ManagerInstance;

export class ManagerInstance {
    on(event: string, callback: (e: Event) => void): void;
    on(event: "contactstatus", callback: (e: ContactStatusEvent) => void): void;
    on(event: "devicestatechange", callback: (e: DeviceStateChangeEvent) => void): void;
    on(event: "userevent", callback: (e: UserEvent) => void): void;

    keepConnected(): void;
    connect(): void;
    isConnected(): boolean;
}

export interface Event {
    event: string;
    privilege: string;
}

export interface ContactStatusEvent extends Event {
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
    device: string;
    state: DeviceState;
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

export default Manager;

}
