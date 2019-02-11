import { Base, IBaseConstructorParams, IBase } from "./base";
import { IEventRooter, EventRooter } from "./event-rooter";

export interface ICommandRooter extends IBase {
    eventRooter: IEventRooter
}

export class CommandRooter extends Base implements ICommandRooter {
    eventRooter: IEventRooter
    constructor(params?: IBaseConstructorParams | string){
        super(params)
        this.eventRooter = new EventRooter()
    }
    destroy() {
        this.eventRooter.destroy();
        delete this.eventRooter;
        super.destroy();
    }
}