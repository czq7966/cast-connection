import * as Cmds from "../../../cmds";
import { IDispatcher, Dispatcher } from "../dispatcher";
import { IDispatcherFilter, DispatcherFilter} from '../dispatcher-filter'


export interface IMediaCaptureFilter extends IDispatcherFilter {
}
export class MediaCaptureFilter extends DispatcherFilter implements IMediaCaptureFilter {
    constructor(dispatcher: IDispatcher ) {
        super(dispatcher);
        this.initEvents();
    }   
    destroy() {
        this.unInitEvents();
        super.destroy();
    }

    initEvents() {
        this.sendRooter.setParent(this.dispatcher.sendFilter);        
        this.sendRooter.onAfterRoot.add(this.onAfterRoot_sendRoot)
    }
    unInitEvents() {
        this.sendRooter.onAfterRoot.remove(this.onAfterRoot_sendRoot)
        this.sendRooter.setParent();        
    }    
    onAfterRoot_sendRoot = (cmd: Cmds.Common.ICommandData<Cmds.ICommandDataProps>): any => {
        let cmdId = cmd.cmdId;
        switch(cmdId) {
            case Cmds.ECommandId.extension_capture_are_you_ready:
            case Cmds.ECommandId.extension_capture_get_custom_sourceId:
                this.sendCommand(cmd)
                return Cmds.Common.EEventEmitterEmit2Result.preventRoot;
                break;
            default:
                break;
        }        
    }   
    onAfterRoot_recvMessage  = (cmd: Cmds.Common.ICommandData<Cmds.ICommandDataProps>): any => {
        if (cmd) {
            cmd.props = cmd.props || {}
            this.onCommand(cmd);
        }      
    }
    onCommand(cmd: Cmds.Common.ICommandData<Cmds.ICommandDataProps>) {
        if (cmd.to.type === 'user' && cmd.to.id === this.instanceId) {
            let cmdId = cmd.cmdId;            
            switch(cmdId) {
                case Cmds.ECommandId.extension_capture_are_you_ready:
                case Cmds.ECommandId.extension_capture_get_custom_sourceId:   
                        super.onCommand(cmd)     
                    break;
                default:
                    break;            
            }        
        }
    }
    sendCommand(cmd: Cmds.ICommandData<Cmds.ICommandDataProps>): Promise<any> {
        cmd.type = cmd.type || Cmds.ECommandType.req;        
        cmd.from = cmd.from || {type: 'user', id: this.instanceId}
        cmd.to = cmd.to || {type: 'server', id: Cmds.ECommandServerId.extension_capture}
        cmd.to.id = cmd.to.id || Cmds.ECommandServerId.extension_capture
        cmd.props = cmd.props || {}

        return Promise.resolve();
    }
}