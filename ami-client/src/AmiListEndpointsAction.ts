import { ManagerInstance, EndpointList, EndpointListComplete, DeviceState as AmiDeviceState } from "asterisk-manager";
import { DeviceState } from "./DeviceState";
import { Device } from "./Device";

export interface PjsipEndpointInfo {
    device: Device;
    devicestate: DeviceState;
}

type ListResolveType = (value?: PjsipEndpointInfo[] | PromiseLike<PjsipEndpointInfo[]> | undefined) => void;

export class AmiListEndpointsAction {

    protected pendingListPromise: Promise<PjsipEndpointInfo[]> | null = null;
    protected markPendingListResolved: ListResolveType | null = null;
    protected listEndpointInfoData: PjsipEndpointInfo[] | null = null;
    protected ami: ManagerInstance;

    public constructor(ami: ManagerInstance) {
        this.ami = ami;
        this.registerOnAmi(ami);
    }

    public listEndpoints(): Promise<PjsipEndpointInfo[]> {
        if (!this.isListingEndpoints) {
            // FIXME Data race here. What if EndpointListComplete comes
            // after doing the action but before pendingListPromise is set?
            this.pendingListPromise = new Promise((resolve, reject) => {
                this.markPendingListResolved = resolve;
                this.listEndpointInfoData = [];
                this.ami.action({action: "PJSIPShowEndpoints"});
            });
            return this.pendingListPromise;
        }
        else {
            // Reuse pending endpoint list.
            return this.pendingListPromise as Promise<PjsipEndpointInfo[]>;
        }
    }

    protected get isListingEndpoints() {
        return this.pendingListPromise !== null;
    }

    protected registerOnAmi(ami: ManagerInstance): void {
        ami.on("endpointlist", e => this.onEndpointList(e));
        ami.on("endpointlistcomplete", e => this.onEndpointListComplete(e));
    }

    protected onEndpointList(e: EndpointList): void {
        const device = new Device(`PJSIP/${e.objectname}`);
        const eInfo: PjsipEndpointInfo = {
            device: device,
            devicestate: new DeviceState(device, e.devicestate.toUpperCase() as AmiDeviceState)
        };
        if (this.listEndpointInfoData) {
            this.listEndpointInfoData.push(eInfo);
        }
        else {
            this.throwException();
        }
    }

    protected onEndpointListComplete(e: EndpointListComplete): void {
        if (this.markPendingListResolved && this.listEndpointInfoData) {
            this.markPendingListResolved(this.listEndpointInfoData);
        }
        else {
            this.throwException();
        }
    }

    protected throwException(): void {
        throw new Error("[BUG]: Was not expecting to receive list event at this time.");
    }

}
