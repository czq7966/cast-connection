import { Base } from './base'
// import { DataChannels, EDataChannelsEvents } from "./datachannels";
// import { DataChannel, EDataChannelLabel, EDataChannelEvents } from "./datachannel";
import { Gesture } from "./gesture";
import { DataChannel, EDataChannelLabel, EDataChannelEvents } from './datachannel';
import { DataChannels, EDataChannelsEvents } from './datachannels';

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


export class Input extends Base {
    OS: EInputOS
    platform: EInputPlatform
    touchMode: EInputDevice        
    datachannel: DataChannel
    datachannels: DataChannels
    gesture: Gesture
    constructor(datachannels: DataChannels) {
        super();
        this.OS = EInputOS.window;
        this.platform = EInputPlatform.browser;
        this.touchMode = EInputDevice.touch;
        this.datachannels = datachannels;      
        this.gesture = new Gesture(this);  
        this.initEvents();
    }
    destroy() {
        this.unInitDataChannelEvents();
        this.unInitEvents();
        this.gesture.destroy();
        delete this.gesture;
        delete this.datachannel;
        delete this.datachannels;
        super.destroy();
    }
    initEvents() {
        this.datachannels.eventEmitter.addListener(EDataChannelsEvents.onAddDataChannel, this.onAddDataChannel)
    }
    unInitEvents() {
        this.datachannels.eventEmitter.removeListener(EDataChannelsEvents.onAddDataChannel, this.onAddDataChannel)
    }
    onAddDataChannel = (datachannel: DataChannel) => {
        if (datachannel && datachannel.rtcchannel.label === EDataChannelLabel.input) {
            this.datachannel = datachannel;
            this.datachannel.eventEmitter.addListener(EDataChannelEvents.onmessage, this.onDataChannelMessage)                        
            this.datachannel.eventEmitter.addListener(EDataChannelEvents.onopen, this.onDataChannelOpen)                 
            this.datachannel.eventEmitter.addListener(EDataChannelEvents.onclose, this.onDataChannelClose) 
        }
    }
    unInitDataChannelEvents() {
        if (this.datachannel && this.datachannel.notDestroyed) {
            this.datachannel.eventEmitter.removeListener(EDataChannelEvents.onmessage, this.onDataChannelMessage);
            this.datachannel.eventEmitter.removeListener(EDataChannelEvents.onopen, this.onDataChannelOpen)
            this.datachannel.eventEmitter.removeListener(EDataChannelEvents.onclose, this.onDataChannelClose) 
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
        } else {
            
        }
        
    }    
}