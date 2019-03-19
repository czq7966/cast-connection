
import * as Cmds from "../../../cmds";
import * as Network from '../../../network'
import * as Services from '../../../services'
import { IDispatcher, Dispatcher } from "../dispatcher";
import { DispatcherFilter, IDispatcherFilter } from "../dispatcher-filter";

export interface IInputClientFilter extends IDispatcherFilter {
    wsClient: Network.IClient
    setEnabled(enalbed: boolean)
} 

export class InputClientFilter extends DispatcherFilter implements IInputClientFilter {
    wsClient: Network.IClient
    enabled: boolean
    timeoutHandler: number
    constructor(dispatcher: IDispatcher, url: string) {
        super(dispatcher);
        this.wsClient = new Network.Signaler(url);
        this.initEvents();
    }     
    destroy() {
        this.unInitEvents();
        this.wsClient.destroy();
        delete this.wsClient;
        delete this.timeoutHandler;
        super.destroy();
    }

    initEvents() {
        this.recvRooter.setParent(this.dispatcher.recvFilter);        
        this.recvRooter.onAfterRoot.add(this.onAfterRoot_recv)
    }
    unInitEvents() {
        this.recvRooter.onAfterRoot.remove(this.onAfterRoot_recv)
        this.recvRooter.setParent();   

        clearTimeout(this.timeoutHandler) 
    }
    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        if (this.enabled) {
            if(!this.wsClient.connecting() && !this.timeoutHandler) {
                this.wsClient.connect()
                .catch(err => {
                    this.timeoutHandler = setTimeout(() => {
                        clearTimeout(this.timeoutHandler) 
                        this.timeoutHandler = 0;
                        // this.setEnabled(this.enabled)                    
                    }, 5000) as any;
                })
            }
        } else {
            this.wsClient.disconnect();
            clearTimeout(this.timeoutHandler)
            this.timeoutHandler = 0;
        }
    }
    onAfterRoot_recv = (data: Cmds.ICommandData<any>): any => {
        let cmdId = data.cmdId;
        switch(cmdId) {
            case Cmds.ECommandId.stream_webrtc_io_input:     
                Services.Cmds.StreamIOInput.InputClient.onAfterRoot.req(this, data)
                return Cmds.Common.EEventEmitterEmit2Result.preventRoot; 
                break;
            default:
     
                break;            
        }
    }
    sendCommand(cmd: Cmds.ICommandData<any>): Promise<any> {
        if (this.enabled) {
            if (this.wsClient.connected()) {
                this.wsClient.sendCommand(cmd)
                .catch(err => {
                    adhoc_cast_connection_console.log(err)
                })
            } else {
                this.setEnabled(this.enabled)
            }
        }
        return;
    }

    
};