import * as Cmds from "../../../cmds";
import { IDispatcher } from "../dispatcher";
import { DispatcherFilter, IDispatcherFilter } from "../dispatcher-filter";


export interface IBaseInputFilter extends IDispatcherFilter {
    filterId: string;
    setEnabled(enalbed: boolean)
} 

export class BaseInputFilter extends DispatcherFilter implements IBaseInputFilter {
    filterId: string;
    _enabled: boolean;
    constructor(dispatcher: IDispatcher ) {        
        super(dispatcher);
        this.filterId = Cmds.ECommandId.stream_webrtc_io_input;
    }   
    destroy() {
        this.setEnabled(false);        
        super.destroy();
    }

    initEvents() {
        this.recvRooter.setParent(this.dispatcher.recvFilter);        
        this.recvRooter.onAfterRoot.add(this.onAfterRoot_recvRoot)
    }
    unInitEvents() {
        this.recvRooter.onAfterRoot.remove(this.onAfterRoot_recvRoot)
        this.recvRooter.setParent();        
    }   
    setEnabled(enabled: boolean) {        
        if (!!this.getEnabled() !== !!enabled) {
            if (enabled) {
                this.initEvents();
            } else {
                this.unInitEvents();
            }
            this._enabled = !!enabled;
        }
    } 
    getEnabled() {
        return !!this._enabled;
    }
    onAfterRoot_recvRoot  = (cmd: Cmds.ICommandData<any>): any => {
        if (cmd) {
            let cmdId = cmd.cmdId;
            switch(cmdId) {                
                case this.filterId:                        
                    let _cmd = Object.assign({}, cmd);
                    _cmd.cmdId = Cmds.ECommandId.extension_capture_on_io_input;
                    this.sendCommand(_cmd);
                    return Cmds.Common.EEventEmitterEmit2Result.preventRoot; 
                    break;
                default:
         
                    break;            
            }
        }      
    }
    onCommand(cmd: Cmds.Common.ICommandData<Cmds.ICommandDataProps>) {
        return;
    }
    sendCommand(cmd: Cmds.ICommandData<Cmds.ICommandDataProps>): Promise<any> {
        return Promise.resolve();
    }
}