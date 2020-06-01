import * as Cmds from "../../../cmds";
import * as Modules from "../../../modules";
import * as Services from '../../../services';
import { DataChannel, EDataChannelEvents } from './datachannel';
import { IPeer } from "../peer";



export interface ISignaler extends  Cmds.Common.ICommandRooter {
    peer: IPeer
    datachannel: DataChannel
    setDataChannel(datachannel: DataChannel)
    onDataChannelOpen()
    onDataChannelClose()
    onCommand(cmd: any): Promise<any>
    sendCommand(cmd: any): Promise<any>
}

export class Signaler extends Cmds.Common.CommandRooter implements ISignaler {
    peer: IPeer
    datachannel: DataChannel
    constructor(peer: IPeer) {
        super(peer.instanceId);
        this.peer = peer;
        this.initEvents();
    }
    destroy() {
        this.unInitEvents();
        delete this.datachannel;
        super.destroy();
    }
    initEvents() {
        this.eventRooter.setParent(this.peer.eventRooter);        
        this.eventRooter.onAfterRoot.add(this.onAfterRoot)
    }
    unInitEvents() {
        this.unInitDataChannelEvents();
        this.eventRooter.onAfterRoot.remove(this.onAfterRoot)
        this.eventRooter.setParent();           
    } 
    onAfterRoot = (cmd: Cmds.Common.ICommand): any => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        let label = cmd.data.extra as string;
        switch(cmdId) {
            case Cmds.ECommandId.stream_webrtc_ondatachanneladd: 
            case Cmds.ECommandId.stream_webrtc_ondatachannelopen: 
            case Cmds.ECommandId.stream_webrtc_ondatachannelclose:                 
                if (label === Modules.Webrtc.IO.EDataChannelLabel.signaler) 
                    Services.Cmds.StreamIOSignaler.signaler.onAfterRoot.req(this, cmd as any)
                break;
            default:
                
                break;
        }
    }  
    setDataChannel(datachannel: DataChannel){
        this.unInitDataChannelEvents();
        if (datachannel) {
            this.datachannel = datachannel;
            this.datachannel.rtcdatachannel.addEventListener(EDataChannelEvents.onmessage, this.onDataChannelMessage)                        
        }
    }
    unInitDataChannelEvents() {
        if (this.datachannel) {
            this.datachannel.rtcdatachannel.removeEventListener(EDataChannelEvents.onmessage, this.onDataChannelMessage)                        
            delete this.datachannel
        }
    }
    onDataChannelMessage = (ev: MessageEvent) => {    
        let cmd = JSON.parse(ev.data) as Cmds.ICommandData<any>;
        this.onCommand(cmd);
    }    
    onDataChannelOpen = () => {

    }
    onDataChannelClose = () => {
        this.unInitDataChannelEvents();
    }
     
    onCommand(cmd: Cmds.ICommandData<any>): Promise<any> {
        Services.Modules.Webrtc.IO.Signaler.dispatchCommand(this, cmd);
        return Promise.resolve();
    }

    sendCommand(cmd: any): Promise<any> {        
        if (this.datachannel) {
            return this.datachannel.sendMessage(cmd)
        } else {
            Promise.reject('signaler dataChannel is null');            
        }
    }
    
    handshake() {
        
    }
}