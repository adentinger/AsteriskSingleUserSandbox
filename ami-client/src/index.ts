import { AmiEventHandler } from "./AmiEventHandler";

import amiGen, { DeviceState } from "asterisk-manager";
import { DeviceStateChangeEventParser } from "./DeviceStateChangeEventParser";

const ami = amiGen(
    "5038",
    "@AMI_IP_ADDRESS@",
    "@AMI_USERNAME@",
    "@AMI_PASSWORD@",
    true
);
ami.keepConnected();

const handler = new AmiEventHandler();
ami.on(
    "devicestatechange",
    (e) => {
        handler.onDeviceStateChange(
            DeviceStateChangeEventParser.parseDeviceStateChangeEvent(e)
        );
    }
);

// Display message confirming when we are connected to the AMI.
let intervalId: NodeJS.Timeout;
const checkIfConnected = () => {
    if (ami.isConnected()) {
        console.log("Connected to AMI.");
        clearInterval(intervalId);
    }
};
intervalId = setInterval(checkIfConnected, 1000);
