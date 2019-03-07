import { Base, IBase, IBaseClass } from './base';
import * as Dts from './dts';
import { ICommand } from './command';
import { CommandTypes } from './command-types';
import { CmdTimeout } from './timeout';
import { ICommandData } from './dts';


export interface IDispatcher extends IBase {
    sendCommand(cmd: ICommandData<any>, ...args: any[]): Promise<any> 
}


export class Dispatcher extends Base {  
    static dispatcher: IBaseClass
    static cmdTimeout: CmdTimeout = new CmdTimeout()
    static setDispatcher(dispatcher: IBaseClass, isServer: boolean) {
        this.dispatcher = dispatcher;
        this.cmdTimeout.isServer = isServer;
    }
    static onCommand(cmdData: Dts.ICommandData<any>, dispatcher: IDispatcher, ...args: any[]) {
        let cmd = CommandTypes.decode(cmdData, {instanceId: ''});
        if (cmd) {
            cmd.instanceId = dispatcher.instanceId;
            if (!this.cmdTimeout.respCmd(cmd)) {
                this.dispatch(cmd, Dts.ECommandDispatchEvents.onDispatched, ...args)
            } 
            cmd.destroy();
            cmd = null;
        }
    }

    static dispatch(cmd: ICommand, event: Dts.ECommandDispatchEvents, ...args: any[]) {
        cmd.getInstance().instanceEventEmitter.emit(event, cmd, ...args);
        this.dispatcher.getInstance<IDispatcher>(cmd.instanceId).eventEmitter.emit(event, cmd, ...args);
    }      

    static sendCommand(cmd: ICommand, ...args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cmdTimeout.addCmd(cmd.data);
            let sessionId = cmd.data.sessionId;
            this.dispatcher.getInstance<IDispatcher>(cmd.instanceId, true).sendCommand(cmd.data, ...args)
            .then(msg => {                
                resolve(msg);
            })
            .catch(err => {
                sessionId && this.cmdTimeout.delCmd(sessionId);
                reject(err)
            })
        })
    }
}



