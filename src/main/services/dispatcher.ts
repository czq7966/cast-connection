import * as Network from '../network'
import * as Dts from "../declare";
import * as Cmds from '../cmds/index'



export interface IDispatcherConstructorParams extends Cmds.Common.IBaseConstructorParams {
    signaler: Network.Signaler
}

export interface IDispatcher extends Cmds.Common.IDispatcher {
    signaler: Network.Signaler
    eventRooter: Cmds.Common.IEventRooter
    onCommand(cmd: Cmds.ICommandData<any>)
}

export class Dispatcher extends Cmds.Common.Base implements IDispatcher {
    signaler: Network.Signaler
    eventRooter: Cmds.Common.IEventRooter
    constructor(params: IDispatcherConstructorParams) {
        super(params);
        this.signaler = params.signaler;
        this.eventRooter = new Cmds.Common.EventRooter(null);
        this.initEvents();
    }
    destroy() {
        this.unInitEvents();
        this.eventRooter.destroy();
        delete this.signaler;
        delete this.eventRooter;
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
    onCommand = (cmd: Cmds.ICommandData<any>) => {
        console.warn('OnCommand', cmd)
        this.eventEmitter.emit(Dts.ECommandEvents.onBeforeCommand, cmd);
        this.eventEmitter.emit(Dts.ECommandEvents.onCommand, cmd);
        if (cmd.preventDispatch !== true) {
            Cmds.Common.Dispatcher.onCommand(cmd, this);
            this.eventEmitter.emit(Dts.CommandID, cmd)
        }
    }
    sendCommand(cmd: Cmds.ICommandData<any>): Promise<any> {
        console.warn('SendCommand', cmd)
        return this.signaler.sendCommand(cmd) 
    }

    // Network
    onDisconnect = () => {
        // this.eventEmitter.emit(Dts.EClientSocketEvents.disconnect)
        let data: Cmds.ICommandData<any> = {
            cmdId: Cmds.ECommandId.network_disconnect
        }
        this.onCommand(data);
    }
}

Cmds.Common.Dispatcher.setDispatcher(Dispatcher as any, false)