import { Device } from "./Device";

export class Pjsip {
    protected static readonly DEVICE_STRINGS = [
        "PJSIP/linux",
        "PJSIP/home-phone",
        "PJSIP/tablet",
        "PJSIP/cell-phone",
        "PJSIP/work-computer1"
    ];

    // tslint:disable-next-line: member-ordering
    public static readonly DEVICES = Pjsip.DEVICE_STRINGS.map(ds => new Device(ds));

}
