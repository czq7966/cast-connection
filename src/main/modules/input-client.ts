
import * as Cmds from "../cmds";
import * as Network from '../network'
import * as Dispatchers from './dispatchers'
import * as Services from '../services'

export interface IInputClient extends Cmds.Common.IBase {
    wsClient: Network.IClient
    dispatcher?: Dispatchers.IDispatcher
    sendCommand(cmd: Cmds.ICommandData<any>)
    setEnabled(enalbed: boolean)
} 

export interface IInputClientConstructorParams extends Cmds.Common.IBaseConstructorParams {
    url: string
}

export class InputClient extends Cmds.Common.CommandRooter implements IInputClient {
    wsClient: Network.IClient
    dispatcher?: Dispatchers.IDispatcher
    enabled: boolean
    timeoutHandler: number
    constructor(params: IInputClientConstructorParams, dispatcher?: Dispatchers.IDispatcher) {
        super(params);
        this.wsClient = new Network.Signaler(params.url);
        this.dispatcher = dispatcher || Dispatchers.Dispatcher.getInstance(this.instanceId);

        this.initEvents();
    }     
    destroy() {
        this.unInitEvents();
        this.wsClient.destroy();
        delete this.wsClient;
        delete this.dispatcher;
        delete this.timeoutHandler;
        super.destroy();
    }

    initEvents() {
        this.eventRooter.setParent(this.dispatcher.dataRooter);        
        this.eventRooter.onAfterRoot.add(this.onAfterRoot)
    }
    unInitEvents() {
        this.eventRooter.onAfterRoot.remove(this.onAfterRoot)
        this.eventRooter.setParent();   

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
    onAfterRoot = (data: Cmds.ICommandData<any>): any => {
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
    sendCommand(cmd: Cmds.ICommandData<any>) {
        if (this.enabled) {
            if (this.wsClient.connected()) {
                this.wsClient.sendCommand(cmd)
                .catch(err => {
                    console.log(err)
                })
            } else {
                this.setEnabled(this.enabled)
            }
        }
    }

    
};