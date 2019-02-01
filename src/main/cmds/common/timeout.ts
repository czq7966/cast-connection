import { Base } from "./base";
import * as Dts from './dts'
import * as Helper from './helper/index'
import { ICommand } from "./command";



var defaultRespTimeout = 10 * 1000;
enum CmdTimeoutSubfix {
    onResp = '_onResp',
    onTimeout = '_onRespTimeout'
}

export class CmdTimeout extends Base {
    timers: Helper.KeyValue<Dts.ICommandData<any>>
    timeoutHandlers: Helper.KeyValue<number>
    isServer: boolean
    constructor() {
        super();
        this.timers = new Helper.KeyValue();
        this.timeoutHandlers = new Helper.KeyValue();
    }
    destroy() {
        this.timers.destroy();
        this.timeoutHandlers.destroy();
        delete this.timers;
        delete this.timeoutHandlers;
        super.destroy();
    }
    respCmd(cmd: ICommand): boolean {
        if (cmd.data.type === Dts.ECommandType.resp && cmd.data.sessionId ) {
            let sid = cmd.data.sessionId;
            this.delCmd(sid, false, true);
            // let result = this.eventEmitter.listeners(sid +  CmdTimeoutSubfix.onResp).length > 0;
            this.eventEmitter.emit(sid + CmdTimeoutSubfix.onResp, cmd);
            if (this.isServer && (cmd.data.to.type || 'server') !== 'server') {
                return false                
            }
            return true;
        }        
        return false;        
    }
    addCmd(cmd: Dts.ICommandData<any>) {
        if (cmd.type !== Dts.ECommandType.resp && (cmd.onResp || cmd.onRespTimeout) ) {
            console.log(cmd, cmd.onResp)
            cmd.sessionId = cmd.sessionId || Helper.uuid();
            let sid = cmd.sessionId;
            let hander = setTimeout(() => {
                this.delCmd(sid, true, false);
                this.eventEmitter.emit(sid +  CmdTimeoutSubfix.onTimeout, cmd);
            }, defaultRespTimeout);

            this.timers.add(sid, cmd);
            this.timeoutHandlers.add(sid, hander as any)            
            cmd.onResp && this.eventEmitter.once(sid + CmdTimeoutSubfix.onResp, cmd.onResp as any);
            cmd.onRespTimeout && this.eventEmitter.once(sid + CmdTimeoutSubfix.onTimeout, cmd.onRespTimeout as any);
        }
    }
    delCmd(sid: string, removeResp: boolean = true , removeTimeout: boolean = true ) {
        let cmd = this.timers.del(sid);  
        let handler = this.timers.del(sid) as any;
        if (cmd) {
            removeResp && cmd.onResp && this.eventEmitter.removeListener(sid + CmdTimeoutSubfix.onResp, cmd.onResp as any);
            removeTimeout && cmd.onRespTimeout && this.eventEmitter.removeListener(sid + CmdTimeoutSubfix.onTimeout, cmd.onRespTimeout as any);
            if (handler) {
                delete cmd.extra.timeoutHandler;
                clearTimeout(handler);
            }
        }
    }
}