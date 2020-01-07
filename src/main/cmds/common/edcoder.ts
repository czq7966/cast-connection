import { Base, IBase, IBaseClass, IBaseConstructorParams } from './base';
import * as Dts from './dts';
import { ICommand } from './command';
import { CommandTypes } from './command-types';
import { CmdTimeout } from './timeout';
import { ICommandData } from './dts';


export interface IDispatcher extends IBase {    
    edCoder: IEDCoderClass
    isServer: boolean
    sendCommand(cmd: ICommandData<any>, ...args: any[]): Promise<any> 
}

export interface IEDCoderClass extends IBaseClass {
    dispatcher: IBaseClass
    getDispatcher(): IBaseClass
    setDispatcher(dispatcher: IBaseClass, isServer: boolean)
    onCommand(cmdData: Dts.ICommandData<any>, dispatcher: IDispatcher, ...args: any[])
    dispatch(cmd: ICommand, event: Dts.ECommandDispatchEvents, ...args: any[])
    sendCommand(cmd: ICommand, ...args: any[]): Promise<any>
    addDispatcherInstance(instanceId: string, instance: IDispatcher)
    removeDispatcherInstance(instanceId: string)    
}

class Dispatcher extends Base {}

export class EDCoder extends Base {  
    static dispatcher: IBaseClass
    static cmdTimeout: CmdTimeout = new CmdTimeout()
    static getDispatcher(): IBaseClass {
        if (!this.dispatcher) {
            this.dispatcher = Dispatcher;
        }
        return this.dispatcher;
    }
    static setDispatcher(dispatcher: IBaseClass) {
        this.dispatcher = dispatcher;
    }
    static onCommand(cmdData: Dts.ICommandData<any>, dispatcher: IDispatcher, ...args: any[]) {
        let cmd = CommandTypes.decode(cmdData, {instanceId: ''});
        if (cmd) {
            cmd.instanceId = dispatcher.instanceId;
            if (!this.cmdTimeout.respCmd(cmd, dispatcher.isServer)) {
                this.dispatch(cmd, Dts.ECommandDispatchEvents.onDispatched, ...args)
            } 
            cmd.destroy();
            cmd = null;
        }
    }

    static dispatch(cmd: ICommand, event: Dts.ECommandDispatchEvents, ...args: any[]) {
        cmd.getInstance().instanceEventEmitter.emit(event, cmd, ...args);
        this.getDispatcher().getInstance<IDispatcher>(cmd.instanceId, false).eventEmitter.emit(event, cmd, ...args);
    }      

    static sendCommand(cmd: ICommand, ...args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            let data = CommandTypes.encode(cmd);
            this.cmdTimeout.addCmd(data);
            let sessionId = data.sessionId;
            this.getDispatcher().getInstance<IDispatcher>(cmd.instanceId, false).sendCommand(data, ...args)
            .then(msg => {                
                resolve(msg);
            })
            .catch(err => {
                sessionId && this.cmdTimeout.delCmd(sessionId);
                reject(err)
            })
        })
    }
    static addDispatcherInstance(instanceId: string, instance: IDispatcher): IDispatcher  {        
        this.getDispatcher().getInstance(instanceId, false);
        if (instance && instance.notDestroyed) {
            this.getDispatcher().instances[instanceId] = instance;
            return this.getDispatcher().instances[instanceId] as IDispatcher
        }
    }
    static removeDispatcherInstance(instanceId: string): IDispatcher {
        this.getDispatcher().getInstance(instanceId, false);
        let instance = this.getDispatcher().instances[instanceId] as IDispatcher;
        delete this.getDispatcher().instances[instanceId]
        return instance;
    }    
}



