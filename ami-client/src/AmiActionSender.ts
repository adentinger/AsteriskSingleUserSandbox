import { ManagerInstance } from "asterisk-manager";

export class AmiActionSender {

    private readonly ami: ManagerInstance;

    public constructor(ami: ManagerInstance) {
        this.ami = ami;
    }

}
