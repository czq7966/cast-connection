import { Base, IBase, IBaseClass } from './base';
import * as Dts from './dts';
import { ICommand } from './command';
import { CommandTypes } from './command-types';
import { CmdTimeout } from './timeout';
import { ICommandData } from './dts';


export interface IDispatcher extends IBase {
    sendCommand(cmd: ICommandData, ...args: any[]): Promise<any> 
}


class CCmdDispatcher extends Base {  
    dispatcher: IBaseClass
    cmdTimeout: CmdTimeout
    constructor() {
        super();
        this.cmdTimeout = new CmdTimeout();
    }
    destroy() {
        this.cmdTimeout.destroy();
        delete this.cmdTimeout;
        super.destroy();
    }
    setDispatcher(dispatcher: IBaseClass) {
        this.dispatcher = dispatcher;
    }
    onCommand(cmdData: Dts.ICommandData, dispatcher: IDispatcher, ...args: any[]) {
        let cmd = CommandTypes.decode(cmdData, {instanceId: ''});
        if (cmd) {
            cmd.instanceId = dispatcher.instanceId;
            if (!this.cmdTimeout.respCmd(cmd)) {
                this.dispatch(cmd, Dts.ECommandEvents.onBeforeDispatched, ...args)
                this.dispatch(cmd, Dts.ECommandEvents.onDispatched, ...args)
            }
            cmd.destroy();
            cmd = null;
        }
    }

    dispatch(cmd: ICommand, event: Dts.ECommandEvents, ...args: any[]) {
        cmd.getInstance().instanceEventEmitter.emit(event, cmd, ...args);
        this.dispatcher.getInstance<IDispatcher>(cmd.instanceId).eventEmitter.emit(event, cmd, ...args);
    }      

    sendCommand(cmd: ICommand, ...args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cmdTimeout.addCmd(cmd);
            this.dispatcher.getInstance<IDispatcher>(cmd.instanceId, true).sendCommand(cmd.data, ...args)
            .then(msg => {                
                resolve(msg);
            })
            .catch(err => {
                this.cmdTimeout.delCmd(cmd.data.sessionId);
                reject(err)
            })
        })
    }
}

export var CmdDispatcher = new CCmdDispatcher();



