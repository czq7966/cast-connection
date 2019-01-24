import { Base } from "./base";
import { ICommand } from "./command";
import * as Dts from './dts'
import * as Helper from './helper/index'



var defaultRespTimeout = 10 * 1000;
enum CmdTimeoutSubfix {
    onResp = '_onResp',
    onTimeout = '_onRespTimeout'
}

export class CmdTimeout extends Base {
    timers: Helper.KeyValue<ICommand>
    constructor() {
        super();
        this.timers = new Helper.KeyValue();
    }
    destroy() {
        this.timers.destroy();
        delete this.timers;
        super.destroy();
    }
    respCmd(cmd: ICommand): boolean {
        if (cmd.data.type === Dts.ECommandType.resp && cmd.data.sessionId) {
            let sid = cmd.data.sessionId;
            this.delCmd(sid, false, true);
            // let result = this.eventEmitter.listeners(sid +  CmdTimeoutSubfix.onResp).length > 0;
            this.eventEmitter.emit(sid + CmdTimeoutSubfix.onResp, cmd);
            return true;
        }        
        return false;        
    }
    addCmd(cmd: ICommand) {
        if (cmd.data.type !== Dts.ECommandType.resp && (cmd.data.onResp || cmd.data.onRespTimeout) ) {
            cmd.data.sessionId = cmd.data.sessionId || Helper.uuid();
            console.log('addCmd', cmd.data.sessionId)
            let sid = cmd.data.sessionId;
            let hander = setTimeout(() => {
                this.delCmd(sid, true, false);
                this.eventEmitter.emit(sid +  CmdTimeoutSubfix.onTimeout, cmd);
            }, defaultRespTimeout);

            cmd.extra.timeoutHandler = hander;
            this.timers.add(sid, cmd);
            cmd.data.onResp && this.eventEmitter.once(sid + CmdTimeoutSubfix.onResp, cmd.data.onResp as any);
            cmd.data.onRespTimeout && this.eventEmitter.once(sid + CmdTimeoutSubfix.onTimeout, cmd.data.onRespTimeout as any);
        }
    }
    delCmd(sid: string, removeResp: boolean = true , removeTimeout: boolean = true ) {
        let cmd = this.timers.del(sid);        
        if (cmd) {
            removeResp && cmd.data.onResp && this.eventEmitter.removeListener(sid + CmdTimeoutSubfix.onResp, cmd.data.onResp as any);
            removeTimeout && cmd.data.onRespTimeout && this.eventEmitter.removeListener(sid + CmdTimeoutSubfix.onTimeout, cmd.data.onRespTimeout as any);
            let handler = cmd.extra.timeoutHandler;            
            if (handler) {
                delete cmd.extra.timeoutHandler;
                clearTimeout(handler);
            }
        }
    }
}