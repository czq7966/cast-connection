import * as Network from '../../network'
import * as Dts from "../../declare";
import * as Cmds from '../../cmds/index'
import { IDispatcherFilter } from './dispatcher-filter';



export interface IDispatcherConstructorParams extends Cmds.Common.IBaseConstructorParams {
    signaler: Network.Signaler
}

export interface IDispatcher extends Cmds.Common.IDispatcher {
    signaler: Network.Signaler
    eventRooter: Cmds.Common.IEventRooter
    recvFilter: Cmds.Common.IEventRooter;
    sendFilter: Cmds.Common.IEventRooter;
    onCommand(cmd: Cmds.ICommandData<any>)
}

export class Dispatcher extends Cmds.Common.Base implements IDispatcher {
    signaler: Network.Signaler
    eventRooter: Cmds.Common.IEventRooter
    recvFilter: Cmds.Common.IEventRooter;
    sendFilter: Cmds.Common.IEventRooter;
    constructor(params: IDispatcherConstructorParams) {
        super(params);
        this.signaler = params.signaler;
        this.eventRooter = new Cmds.Common.EventRooter();
        this.recvFilter = new Cmds.Common.EventRooter();
        this.sendFilter = new Cmds.Common.EventRooter();
        this.initEvents();
    }
    destroy() {
        this.unInitEvents();
        this.eventRooter.destroy();
        this.recvFilter.destroy();
        this.sendFilter.destroy();
        delete this.eventRooter;
        delete this.recvFilter;
        delete this.sendFilter;
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
        let result = this.recvFilter.root(cmd) ;
        !Cmds.Common.Helper.StateMachine.isset(result, Cmds.Common.EEventEmitterEmit2Result.preventRoot) &&
        Cmds.Common.EDCoder.onCommand(cmd, this);
    }
    sendCommand(cmd: Cmds.ICommandData<any>): Promise<any> {
        console.warn('SendCommand', cmd)
        if (cmd.props === undefined) cmd.props = {};
        let result = this.sendFilter.root(cmd) ;
        if (Cmds.Common.Helper.StateMachine.isset(result, Cmds.Common.EEventEmitterEmit2Result.preventRoot))
            return Promise.resolve();
        else 
            return this.signaler.sendCommand(cmd) 
    }

    onDispatched = (cmd: Cmds.Common.ICommand) => {
        this.eventRooter.root(cmd)
    }

    // Network
    onDisconnect = (...args: any[]) => {
        console.log(...args)
        let data: Cmds.ICommandData<any> = {
            cmdId: Cmds.ECommandId.network_disconnect,
            props: {},
            extra: args
        }
        this.onCommand(data);
    }
}

Cmds.Common.EDCoder.setDispatcher(Dispatcher as any, false)