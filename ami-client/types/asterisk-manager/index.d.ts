declare module "asterisk-manager" {

export function Manager(port: string, host: string, username: string, password: string, events: boolean): ManagerInstance;

export class ManagerInstance {
    on(event: string, callback: (e: Event) => void): void;
    on(event: "contactstatus", callback: (e: ContactStatusEvent) => void): void;
    on(event: "devicestatechange", callback: (e: DeviceStateChangeEvent) => void): void;

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

export default Manager;

}
