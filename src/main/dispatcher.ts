import { Signaler } from "./signaler";
import { Rooms } from "./rooms";
import { CmdDispatcher } from './cmds/index'
import * as Dts from "./declare";
import * as Cmds from './cmds/index'



export interface IDispatcherConstructorParams extends Cmds.IBaseConstructorParams {
    signaler: Signaler
}

export interface IDispatcher extends Cmds.IDispatcher {
    signaler: Signaler
}

export class Dispatcher extends Cmds.Base implements IDispatcher {
    signaler: Signaler
    constructor(params: IDispatcherConstructorParams) {
        super(params);
        this.signaler = params.signaler;
        this.initEvents();
    }
    destroy() {
        this.unInitEvents();
        delete this.signaler;
        super.destroy();
    }

    initEvents() {
        this.signaler.eventEmitter.addListener(Dts.CommandID, this.onCommand);
        this.signaler.eventEmitter.addListener(Dts.EClientSocketEvents.disconnect, this.onDisconnect);
    }
    unInitEvents = () => {
        this.signaler.eventEmitter.removeListener(Dts.CommandID, this.onCommand);
        this.signaler.eventEmitter.removeListener(Dts.EClientSocketEvents.disconnect, this.onDisconnect);        
    }

    // Command
    onCommand = (cmd: Cmds.ICommandData) => {
        CmdDispatcher.onCommand(cmd, this);
        this.eventEmitter.emit(Dts.CommandID, cmd)
    }
    sendCommand(cmd: Cmds.ICommandData): Promise<any> {
        return this.signaler.sendCommand(cmd) 
    }

    // Network
    onDisconnect = () => {
        this.eventEmitter.emit(Dts.EClientSocketEvents.disconnect)
    }
}

CmdDispatcher.setDispatcher(Dispatcher as any)