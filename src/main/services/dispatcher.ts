import * as Network from '../network'
import * as Dts from "../declare";
import * as Cmds from '../cmds/index'



export interface IDispatcherConstructorParams extends Cmds.Common.IBaseConstructorParams {
    signaler: Network.Signaler
}

export interface IDispatcher extends Cmds.Common.IDispatcher {
    signaler: Network.Signaler
    eventRooter: Cmds.Common.IEventRooter
    dataRooter: Cmds.Common.IEventRooter;
    onCommand(cmd: Cmds.ICommandData<any>)
}

export class Dispatcher extends Cmds.Common.CommandRooter implements IDispatcher {
    signaler: Network.Signaler
    constructor(params: IDispatcherConstructorParams) {
        super(params);
        this.signaler = params.signaler;
        this.initEvents();
    }
    destroy() {
        this.unInitEvents();
        delete this.dataRooter;
        delete this.signaler;
        super.destroy();
    }

    initEvents() {
        this.signaler.eventEmitter.addListener(Dts.CommandID, this.onCommand);
        this.signaler.eventEmitter.addListener(Dts.EClientSocketEvents.disconnect, this.onDisconnect);
        this.eventEmitter.addListener(Dts.ECommandDispatchEvents.onDispatched, this.onDispatched)
    }
    unInitEvents = () => {
        this.signaler.eventEmitter.removeListener(Dts.CommandID, this.onCommand);
        this.signaler.eventEmitter.removeListener(Dts.EClientSocketEvents.disconnect, this.onDisconnect);        
        this.eventEmitter.removeListener(Dts.ECommandDispatchEvents.onDispatched, this.onDispatched);
    }

    // Command
    onCommand = (cmd: Cmds.ICommandData<any>) => {
        console.warn('OnCommand', cmd)
        let result = this.dataRooter.root(cmd) ;
        !Cmds.Common.Helper.StateMachine.isset(result, Cmds.Common.EEventEmitterEmit2Result.preventRoot) &&
        Cmds.Common.Dispatcher.onCommand(cmd, this);
    }
    sendCommand(cmd: Cmds.ICommandData<any>): Promise<any> {
        console.warn('SendCommand', cmd)
        return this.signaler.sendCommand(cmd) 
    }

    onDispatched = (cmd: Cmds.Common.ICommand) => {
        this.eventRooter.root(cmd)
    }

    // Network
    onDisconnect = () => {
        let data: Cmds.ICommandData<any> = {
            cmdId: Cmds.ECommandId.network_disconnect,
            props: {}
        }
        this.onCommand(data);
    }
}

Cmds.Common.Dispatcher.setDispatcher(Dispatcher as any, false)