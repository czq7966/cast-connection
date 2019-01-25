import { Base } from "./base";
import * as Dts from './dts'
import * as Helper from './helper/index'



var defaultRespTimeout = 10 * 1000;
enum CmdTimeoutSubfix {
    onResp = '_onResp',
    onTimeout = '_onRespTimeout'
}

export class CmdTimeout extends Base {
    timers: Helper.KeyValue<Dts.ICommandData<any>>
    constructor() {
        super();
        this.timers = new Helper.KeyValue();
    }
    destroy() {
        this.timers.destroy();
        delete this.timers;
        super.destroy();
    }
    respCmd(cmd: Dts.ICommandData<any>): boolean {
        if (cmd.type === Dts.ECommandType.resp && cmd.sessionId) {
            let sid = cmd.sessionId;
            this.delCmd(sid, false, true);
            // let result = this.eventEmitter.listeners(sid +  CmdTimeoutSubfix.onResp).length > 0;
            this.eventEmitter.emit(sid + CmdTimeoutSubfix.onResp, cmd);
            return true;
        }        
        return false;        
    }
    addCmd(cmd: Dts.ICommandData<any>) {
        if (cmd.type !== Dts.ECommandType.resp && (cmd.onResp || cmd.onRespTimeout) ) {
            cmd.sessionId = cmd.sessionId || Helper.uuid();
            console.log('addCmd', cmd.sessionId)
            let sid = cmd.sessionId;
            let hander = setTimeout(() => {
                this.delCmd(sid, true, false);
                this.eventEmitter.emit(sid +  CmdTimeoutSubfix.onTimeout, cmd);
            }, defaultRespTimeout);

            cmd.extra.timeoutHandler = hander;
            this.timers.add(sid, cmd);
            cmd.onResp && this.eventEmitter.once(sid + CmdTimeoutSubfix.onResp, cmd.onResp as any);
            cmd.onRespTimeout && this.eventEmitter.once(sid + CmdTimeoutSubfix.onTimeout, cmd.onRespTimeout as any);
        }
    }
    delCmd(sid: string, removeResp: boolean = true , removeTimeout: boolean = true ) {
        let cmd = this.timers.del(sid);        
        if (cmd) {
            removeResp && cmd.onResp && this.eventEmitter.removeListener(sid + CmdTimeoutSubfix.onResp, cmd.onResp as any);
            removeTimeout && cmd.onRespTimeout && this.eventEmitter.removeListener(sid + CmdTimeoutSubfix.onTimeout, cmd.onRespTimeout as any);
            let handler = cmd.extra.timeoutHandler;            
            if (handler) {
                delete cmd.extra.timeoutHandler;
                clearTimeout(handler);
            }
        }
    }
}