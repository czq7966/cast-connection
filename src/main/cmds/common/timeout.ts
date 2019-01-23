import { Base } from "./base";
import { KeyValue, uuid } from "../../helper";
import { ICommand } from "./command";
import * as Dts from './dts'

var defaultRespTimeout = 10 * 1000;
enum CmdTimeoutSubfix {
    onResp = '_onResp',
    onTimeout = '_onTimeout'
}

export class CmdTimeout extends Base {
    timers: KeyValue<ICommand>
    constructor() {
        super();
        this.timers = new KeyValue();
    }
    destroy() {
        this.timers.destroy();
        delete this.timers;
        super.destroy();
    }
    respCmd(cmd: ICommand): boolean {
        if (cmd.data.type === Dts.ECommandType.resp) {
            let sid = cmd.data.sessionId;
            this.delCmd(sid, false, true);
            let result = !!this.eventEmitter.listeners(sid +  CmdTimeoutSubfix.onResp);
            result && this.eventEmitter.emit(sid + CmdTimeoutSubfix.onResp, cmd);
            return result;
        }        
        return false;        
    }
    addCmd(cmd: ICommand) {
        if (cmd.data.type !== Dts.ECommandType.resp && cmd.data.onResp) {
            cmd.data.sessionId = cmd.data.sessionId || uuid();
            console.log('addCmd', cmd.data.sessionId)
            let sid = cmd.data.sessionId;
            let hander = setTimeout(() => {
                this.delCmd(sid, true, false);
                this.eventEmitter.emit(sid +  CmdTimeoutSubfix.onTimeout, cmd);
            }, defaultRespTimeout);

            cmd.extra.timeoutHandler = hander;
            this.timers.add(sid, cmd);
            cmd.data.onResp && this.eventEmitter.once(sid + CmdTimeoutSubfix.onResp, cmd.data.onResp as any);
            cmd.data.onTimeout && this.eventEmitter.once(sid + CmdTimeoutSubfix.onTimeout, cmd.data.onTimeout as any);
        }
    }
    delCmd(sid: string, removeResp: boolean = true , removeTimeout: boolean = true ) {
        let cmd = this.timers.del(sid);        
        if (cmd) {
            removeResp && cmd.data.onResp && this.eventEmitter.removeListener(sid + CmdTimeoutSubfix.onResp, cmd.data.onResp as any);
            removeTimeout && cmd.data.onTimeout && this.eventEmitter.removeListener(sid + CmdTimeoutSubfix.onTimeout, cmd.data.onTimeout as any);
            let handler = cmd.extra.timeoutHandler;            
            if (handler) {
                delete cmd.extra.timeoutHandler;
                clearTimeout(handler);
            }
        }
    }
}