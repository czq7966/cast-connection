import * as Cmds from "../../../cmds";
import * as Modules from "../../../modules";
import * as Services from '../../../services'
import * as InputDts from './input.dts'
import { Gesture } from "./gesture";
import { DataChannel, EDataChannelLabel, EDataChannelEvents } from './datachannel';
import { InputElement, IInputElement } from './input-source';
import { IPeer } from "../peer";



export interface IInput extends  Cmds.Common.ICommandRooter {
    peer: IPeer
    OS: InputDts.EInputOS
    platform: InputDts.EInputPlatform
    touchMode: InputDts.EInputDevice        
    datachannel: DataChannel
    gesture: Gesture
    inputElement: IInputElement
    dispatchEvent(event: InputDts.IInputEvent)
    inputEvent(event: InputDts.IInputEvent )
    sendEvent(event: InputDts.IInputEvent): Promise<any>
    setDataChannel(datachannel: DataChannel)
    onDataChannelOpen()
    onDataChannelClose()
}

export class Input extends Cmds.Common.CommandRooter implements IInput {
    peer: IPeer
    OS: InputDts.EInputOS
    platform: InputDts.EInputPlatform
    touchMode: InputDts.EInputDevice        
    datachannel: DataChannel
    gesture: Gesture
    inputElement: InputElement
    constructor(peer: IPeer) {
        super(peer.instanceId);
        this.peer = peer;
        this.OS = InputDts.EInputOS.window;
        this.platform = InputDts.EInputPlatform.browser;
        this.touchMode = InputDts.EInputDevice.touch;

        this.gesture = new Gesture(this);  
        this.inputElement = new InputElement(this);
        this.initEvents();
    }
    destroy() {
        this.unInitEvents();
        this.inputElement.destroy();
        this.gesture.destroy();
        delete this.gesture;
        delete this.datachannel;
        delete this.inputElement;
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
                if (label === Modules.Webrtc.IO.EDataChannelLabel.input) 
                    Services.Cmds.StreamIOInput.Input.onAfterRoot.req(this, cmd as any)
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
        Services.Modules.Webrtc.IO.Input.dataChannelInputEvent(this, JSON.parse(ev.data) as InputDts.IInputEvent)
    }    
    onDataChannelOpen = () => {
        this.sendEvent({
            OS: this.OS,
            platform: this.platform
        })
    }
    onDataChannelClose = () => {
        this.unInitDataChannelEvents();
    }
     
    dispatchEvent(evt: InputDts.IInputEvent) {
        Services.Modules.Webrtc.IO.Input.dispatchInputEvent(this, evt)
    }
    inputEvent(evt: InputDts.IInputEvent ) {
        if (evt) {
            evt.OS && (this.OS = evt.OS);
            evt.platform && (this.platform = evt.platform);
            evt.touchMode && (this.touchMode = evt.touchMode);
            if (evt.type) {
                evt.sourceX = evt.sourceX ? evt.sourceX : evt.destX;
                evt.sourceY = evt.sourceY ? evt.sourceY : evt.destY;
                this.gesture.inputEvent(evt);
            }             
        }
    }
    sendEvent(event: InputDts.IInputEvent): Promise<any> {        
        if (this.datachannel) {
            return this.datachannel.sendMessage(event)
        } else {
            
        }
    }    
}