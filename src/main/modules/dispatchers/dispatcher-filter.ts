import * as Cmds from "../../cmds";
import { IDispatcher, Dispatcher } from "./dispatcher";

export interface IDispatcherFilter extends Cmds.Common.ICommandRooter {
    dispatcher: IDispatcher;
    recvRooter: Cmds.Common.IEventRooter
    sendRooter: Cmds.Common.IEventRooter
    sendCommand(cmd: Cmds.ICommandData<any>): Promise<any>
    onCommand(cmd: Cmds.ICommandData<any>)
}
export class DispatcherFilter extends Cmds.Common.CommandRooter implements IDispatcherFilter {
    dispatcher: IDispatcher;
    recvRooter: Cmds.Common.IEventRooter
    sendRooter: Cmds.Common.IEventRooter    
    constructor(dispatcher: IDispatcher ) {
        super(dispatcher.instanceId);        
        this.dispatcher = dispatcher;
        this.recvRooter = new Cmds.Common.EventRooter()
        this.sendRooter = new Cmds.Common.EventRooter()           
    }   
    destroy() {
        this.recvRooter.destroy();
        this.sendRooter.destroy();
        delete this.recvRooter;
        delete this.sendRooter;
        delete this.dispatcher;
        super.destroy();
    }
    sendCommand(cmd: Cmds.ICommandData<any>): Promise<any> {
        return
    }
    onCommand(cmd: Cmds.ICommandData<any>) {
        this.dispatcher.onCommand(cmd)
    }
}