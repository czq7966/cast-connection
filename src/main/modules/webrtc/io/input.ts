import * as Cmds from "../../../cmds";
import * as Modules from "../../../modules";
import * as Services from '../../../services'
import { Gesture } from "./gesture";
import { DataChannel, EDataChannelLabel, EDataChannelEvents } from './datachannel';
import { InputSource } from './input-source';
import { IPeer } from "../peer";

export enum EInputEvents {
    onDispatchEvent = 'onDispatchEvent',
    onInputEvent = 'onInputEvent',
    onTouchModeEvent = 'onTouchModeEvent'
}
export enum EInputDevice {
    mouse = 'mouse',
    touch = 'touch',
    keyboard = 'keyboard'
}
export enum EInputDeviceMouseType {
    mousedown = 'mousePressed',
    mouseup = 'mouseReleased',
    mouseenter = 'mouseEnter',
    mouseleave = 'mouseLeave',
    mousemove = 'mouseMoved',
    mouseover = 'mouseOver',
    mouseout = 'mouseOut',
    wheel = 'mouseWheel',
}
export enum EInputDeviceTouchType {
    touchstart = 'touchStart',
    touchmove = 'touchMove',
    touchend = 'touchEnd',
    touchcancel = 'touchCancel',
}
export enum EInputDeviceKeyType {
    keyDown = 'keyDown',
    keyUp = 'keyUp',
    rawKeyDown = 'rawKeyDown',
    char = 'char'
}
export enum EInputOS {
    window = 'window',
    android = 'android'
}
export enum EInputPlatform {
    browser = 'browser',
    reactnative = 'reactnative'
}
export interface IInputPoint {
    x: number,
    y: number
}
export interface ITouchPoint {
    x: number,
    y: number,
    radiusX?: number
    radiusY?: number
    rotationAngle?: number
    force?: number
    id?: number
    deltaX?: number,
    deltaY?: number,    
}
export interface ITouchEvent extends ICavansEvent {
    type?: EInputDeviceTouchType,    
    touchPoints?: Array<ITouchPoint>
    touches?: Array<ITouchPoint>
    changedTouches?: Array<ITouchPoint>
}
export interface IMousePoint {
    x: number,
    y: number,
    button?: 'none' | 'left' | 'middle' | 'right',
    clickCount?: number,
    deltaX?: number,
    deltaY?: number,
}
export interface IMouseEvent extends ICavansEvent, IMousePoint {
    type?: EInputDeviceMouseType,    
}
export interface ICavansEvent {
    OS?: EInputOS,
    platform?: EInputPlatform,
    touchMode?: EInputDevice,
    modifiers?: number, //Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8 (default: 0)
    timestamp?: number
    sourceX?: number,
    sourceY?: number,
    destX?: number,
    destY?: number,
    async?: boolean     
}
export type IInputEvent = ITouchEvent | IMouseEvent

export interface IInput extends  Cmds.Common.ICommandRooter {
    peer: IPeer
    OS: EInputOS
    platform: EInputPlatform
    touchMode: EInputDevice        
    datachannel: DataChannel
    gesture: Gesture
    dispatchEvent(event: IInputEvent)
    inputEvent(event: IInputEvent )
    sendEvent(event: IInputEvent): Promise<any>
    setDataChannel(datachannel: DataChannel)
    onDataChannelOpen()
    onDataChannelClose()
}

export class Input extends Cmds.Common.CommandRooter implements IInput {
    peer: IPeer
    OS: EInputOS
    platform: EInputPlatform
    touchMode: EInputDevice        
    datachannel: DataChannel
    gesture: Gesture
    inputSource: InputSource
    constructor(peer: IPeer) {
        super(peer.instanceId);
        this.peer = peer;
        this.OS = EInputOS.window;
        this.platform = EInputPlatform.browser;
        this.touchMode = EInputDevice.touch;

        this.gesture = new Gesture(this);  
        this.inputSource = new InputSource(this);
        this.initEvents();
    }
    destroy() {
        this.unInitEvents();
        this.inputSource.destroy();
        this.gesture.destroy();
        delete this.gesture;
        delete this.datachannel;
        delete this.inputSource;
        super.destroy();
    }
    initEvents() {
        this.eventRooter.setParent(this.peer.eventRooter);        
        this.eventRooter.onBeforeRoot.add(this.onBeforeRoot)
        this.eventRooter.onAfterRoot.add(this.onAfterRoot)
    }
    unInitEvents() {
        this.unInitDataChannelEvents();
        this.eventRooter.onBeforeRoot.remove(this.onBeforeRoot)
        this.eventRooter.onAfterRoot.remove(this.onAfterRoot)
        this.eventRooter.setParent();           
    } 
    onBeforeRoot = (cmd: Cmds.Common.ICommand): any => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.stream_webrtc_ondatachannel: 
                let label = cmd.data.extra as string;
                if (label !== EDataChannelLabel.input)
                    Services.Cmds.StreamIOInput.Input.onBeforeRoot.req(this, cmd as any)
                    
                break;
            default:
                
                break;
        }
    }     
    onAfterRoot = (cmd: Cmds.Common.ICommand): any => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        let label = cmd.data.extra as string;
        switch(cmdId) {
            case Cmds.ECommandId.stream_webrtc_ondatachannelopen: 
            case Cmds.ECommandId.stream_webrtc_ondatachannelclose:                 
                if (label !== Modules.Webrtc.IO.EDataChannelLabel.input) 
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
        if (ev.data) {
            this.inputEvent(JSON.parse(ev.data) as IInputEvent)
        }        
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
     
    dispatchEvent(event: IInputEvent) {
        this.eventEmitter.emit(EInputEvents.onDispatchEvent, event, this)
    }
    inputEvent(event: IInputEvent ) {
        if (event) {
            let callback = (evt: IInputEvent) => {
                evt = evt ? evt : event;
                evt.OS && (this.OS = evt.OS);
                evt.platform && (this.platform = evt.platform);
                if (evt.touchMode && evt.touchMode !== this.touchMode) {
                    this.touchMode = evt.touchMode;
                    this.eventEmitter.emit(EInputEvents.onTouchModeEvent, evt.touchMode)
                }
                if (event.type) {
                    event.sourceX = event.sourceX ? event.sourceX : event.destX;
                    event.sourceY = event.sourceY ? event.sourceY : event.destY;
                    this.gesture.inputEvent(event);
                } 
            }
            this.eventEmitter.emit(EInputEvents.onInputEvent, event, this, callback)
            !event.async && callback(event);
        }
    }
    sendEvent(event: IInputEvent): Promise<any> {        
        if (this.datachannel) {
            return this.datachannel.sendMessage(event)
            console.warn(event)
        } else {
            
        }
        
    }    
}