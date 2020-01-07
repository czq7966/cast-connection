import * as Network from '../../network'
import * as Dts from "../../declare";
import * as Cmds from '../../cmds/index'


export interface IDispatcherConstructorParams extends Cmds.Common.IBaseConstructorParams {
    isServer: boolean
    signaler: Network.ISignaler
}

export interface IDispatcher extends Cmds.Common.IDispatcher {
    signaler: Network.ISignaler
    eventRooter: Cmds.Common.IEventRooter
    recvFilter: Cmds.Common.IEventRooter;
    sendFilter: Cmds.Common.IEventRooter;
    onCommand(cmd: Cmds.ICommandData<any>)
}

export class Dispatcher extends Cmds.Common.Base implements IDispatcher {
    edCoder: Cmds.Common.IEDCoderClass
    isServer: boolean
    signaler: Network.ISignaler
    eventRooter: Cmds.Common.IEventRooter
    recvFilter: Cmds.Common.IEventRooter;
    sendFilter: Cmds.Common.IEventRooter;
    constructor(params: IDispatcherConstructorParams, edCoder?: Cmds.Common.IEDCoderClass) {
        super(params);
        this.isServer = params.isServer;
        this.edCoder = edCoder || Cmds.Common.EDCoder
        this.signaler = params.signaler;
        this.eventRooter = new Cmds.Common.EventRooter();
        this.recvFilter = new Cmds.Common.EventRooter();
        this.sendFilter = new Cmds.Common.EventRooter();
        this.initEvents();
    }
    destroy() {
        this.unInitEvents();
        this.edCoder.removeDispatcherInstance(this.instanceId)
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
        this.edCoder.addDispatcherInstance(this.instanceId, this);        
        this.signaler.eventEmitter.addListener(Dts.CommandID, this.onCommand);
        this.signaler.eventEmitter.addListener(Dts.EClientSocketEvents.disconnect, this.onDisconnect);
        this.eventEmitter.addListener(Dts.ECommandDispatchEvents.onDispatched, this.onDispatched)
    }
    unInitEvents() {
        this.signaler.eventEmitter.removeListener(Dts.CommandID, this.onCommand);
        this.signaler.eventEmitter.removeListener(Dts.EClientSocketEvents.disconnect, this.onDisconnect);        
        this.eventEmitter.removeListener(Dts.ECommandDispatchEvents.onDispatched, this.onDispatched);
        this.edCoder.removeDispatcherInstance(this.instanceId);
    }

    // Command
    onCommand = (cmd: Cmds.ICommandData<any>) => {
        adhoc_cast_connection_console.warn('OnCommand', cmd)
        let result = this.recvFilter.root(cmd) ;
        !Cmds.Common.Helper.StateMachine.isset(result, Cmds.Common.EEventEmitterEmit2Result.preventRoot) &&
        Cmds.Common.EDCoder.onCommand(cmd, this);
    }
    sendCommand(cmd: Cmds.ICommandData<any>): Promise<any> {
        adhoc_cast_connection_console.warn('SendCommand', cmd)
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
        adhoc_cast_connection_console.log(...args)
        let data: Cmds.ICommandData<any> = {
            cmdId: Cmds.ECommandId.network_disconnect,
            props: {},
            extra: args
        }
        this.onCommand(data);
    }
}

// Cmds.Common.EDCoder.setDispatcher(Dispatcher as any, false)