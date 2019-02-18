
import * as Cmds from "../cmds";
import * as Network from '../network'
import * as Services from '../services'

export interface IInputClient extends Cmds.Common.IBase {
    wsClient: Network.Client
    dispatcher?:Services. IDispatcher
} 

export interface IInputClientConstructorParams extends Cmds.Common.IBaseConstructorParams {
    url: string
}

export class InputClient extends Cmds.Common.CommandRooter implements IInputClient {
    wsClient: Network.Client
    dispatcher?:Services. IDispatcher
    constructor(params: IInputClientConstructorParams, dispatcher?:Services. IDispatcher) {
        super(params);
        this.wsClient = new Network.Signaler(params.url);
        this.dispatcher = dispatcher || Services.Dispatcher.getInstance(this.instanceId);

        this.initEvents();
    }     
    destroy() {
        this.unInitEvents();
        this.wsClient.destroy();
        delete this.wsClient;
        delete this.dispatcher;
        super.destroy();
    }

    initEvents() {
        this.eventRooter.setParent(this.dispatcher.dataRooter);        
        this.eventRooter.onAfterRoot.add(this.onAfterRoot)
    }
    unInitEvents() {
        this.eventRooter.onAfterRoot.remove(this.onAfterRoot)
        this.eventRooter.setParent();   
    }

    onAfterRoot = (data: Cmds.ICommandData<any>): any => {
        let cmdId = data.cmdId;
        switch(cmdId) {
            case Cmds.ECommandId.stream_webrtc_io_input:     
                // Services.Cmds.StreamIOInput.InputClient.onAfterRoot.req(this, data)
                return Cmds.Common.EEventEmitterEmit2Result.preventRoot; 
                break;
            default:
     
                break;            
        }
    }

    
};