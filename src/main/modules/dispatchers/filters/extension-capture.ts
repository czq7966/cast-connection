import * as Cmds from "../../../cmds";
import { IDispatcher, Dispatcher } from "../dispatcher";
import { IDispatcherFilter, DispatcherFilter} from '../dispatcher-filter'

export interface IExtensionCaptureMessage extends Cmds.Common.ICommandRooter {
    postMessage(msg: any) 
    onMessage(msg: any) 
}
export class ExtensionCaptureMessage extends Cmds.Common.CommandRooter implements IExtensionCaptureMessage {
    constructor(instanceId: string) {
        super(instanceId);
        this.initEvents();
    }
    destroy() {
        this.unInitEvents();
        super.destroy()
    }   
    initEvents() {
        !Cmds.Common.Helper.HostInfo.IsNode && window && window.addEventListener('message', this.onEventMessage)
    }
    unInitEvents() {
        !Cmds.Common.Helper.HostInfo.IsNode && window && window.removeEventListener('message', this.onEventMessage)        
    }
    onEventMessage = (evt: MessageEvent) => {
        if (evt.source === window) {
            this.onMessage(evt.data)
        }
    }
    onMessage(msg: any) {
        this.eventRooter.root(msg)
    }
    postMessage(msg: any) {
        let delObjFunc = (obj: Object) => {
            Object.keys(obj).forEach(key => {
                let type = typeof(obj[key]);
                switch (type) {
                    case 'function':
                        delete obj[key]
                        break;
                    case 'object':
                        delObjFunc(obj[key])
                        break
                }
            })
        }
        if (typeof(msg) === 'object') {
            msg = Object.assign({}, msg)
            delObjFunc(msg)            
        }
        !Cmds.Common.Helper.HostInfo.IsNode && window && window.postMessage(msg, '*')
    }
}
export interface IExtensionCaptureFilter extends IDispatcherFilter {
}
export class ExtensionCaptureFilter extends DispatcherFilter implements IExtensionCaptureFilter {
    message: IExtensionCaptureMessage
    constructor(dispatcher: IDispatcher ) {
        super(dispatcher);
        this.message = new ExtensionCaptureMessage(this.instanceId);
        this.initEvents();
    }   
    destroy() {
        this.unInitEvents();
        this.message.destroy();
        delete this.message;
        super.destroy();
    }

    initEvents() {
        this.sendRooter.setParent(this.dispatcher.sendFilter);        
        this.sendRooter.onAfterRoot.add(this.onAfterRoot_sendRoot)
        this.recvRooter.setParent(this.message.eventRooter)
        this.recvRooter.onAfterRoot.add(this.onAfterRoot_recvMessage)
    }
    unInitEvents() {
        this.sendRooter.onAfterRoot.remove(this.onAfterRoot_sendRoot)
        this.sendRooter.setParent();        
        this.recvRooter.onAfterRoot.remove(this.onAfterRoot_recvMessage)                
        this.recvRooter.setParent()

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
        this.message.postMessage(cmd)
        return Promise.resolve();
    }
}