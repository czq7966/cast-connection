import { Base, IBaseConstructorParams, IBase } from "./base";
import { IEventRooter, EventRooter } from "./event-rooter";

export interface ICommandRooter extends IBase {
    // dataRooter: IEventRooter
    eventRooter: IEventRooter
}

export class CommandRooter extends Base implements ICommandRooter {
    // dataRooter: IEventRooter
    eventRooter: IEventRooter
    constructor(params?: IBaseConstructorParams | string){
        super(params)
        // this.dataRooter = new EventRooter()
        this.eventRooter = new EventRooter()
    }
    destroy() {
        // this.dataRooter.destroy();
        this.eventRooter.destroy();
        // delete this.dataRooter;
        delete this.eventRooter;
        super.destroy();
    }
}