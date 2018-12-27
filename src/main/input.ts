import { Base } from "./base";
import { DataChannels, EDataChannelsEvents } from "./datachannels";
import { DataChannel, EDataChannelLabel, EDataChannelEvents } from "./datachannel";

export enum EInputEvents {
    onDispatchEvent = 'onDispatchEvent',
    onInputEvent = 'onInputEvent'
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
    touchStart = 'touchStart',
    touchMove = 'touchMove',
    touchEnd = 'touchEnd',
    touchCancel = 'touchCancel',
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
    points?: Array<ITouchPoint>
    touchPoints?: Array<ITouchPoint>
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
    datachannel: DataChannel
    datachannels: DataChannels
    constructor(datachannels: DataChannels) {
        super();
        this.OS = EInputOS.window;
        this.platform = EInputPlatform.browser;
        this.datachannels = datachannels;        
        this.initEvents();
    }
    destroy() {
        this.unInitDataChannelEvents();
        this.unInitEvents();

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
                if (event.type) {
                    event.sourceX = event.sourceX ? event.sourceX : event.destX;
                    event.sourceY = event.sourceY ? event.sourceY : event.destY;
                    this.dealInputEvent(event);
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
    dealInputEvent(event: IInputEvent) {
        switch(this.OS) {
            case EInputOS.window:
                this.inputEventWindow(event);
                break;
            case EInputOS.android:
                this.inputEventAndroid(event);
                break;
        }
    }
    inputEventWindow(event: IInputEvent) {
        switch(this.platform) {
            case EInputPlatform.browser:
                this.inputEventWindowBrowser(event)
                break;
            case EInputPlatform.reactnative:
                // this.inputEventWindowReactnative(event);
                break;
        }

    }
    inputEventAndroid(event: IInputEvent) {
        switch(this.platform) {
            case EInputPlatform.browser:
                this.inputEventAndroidBrowser(event);
                break;
            case EInputPlatform.reactnative:
                this.inputEventAndroidReactnative(event);
                break;
        }
    }
    inputEventWindowBrowser(event: IInputEvent) {
        let handleMouseEvent = () => {
            let evt = event as IMouseEvent;
            let p = this.calcInputEventXY({x: evt.x, y: evt.y}, {x: evt.sourceX, y: evt.sourceY}, {x: evt.destX, y: evt.destY});
            if (p.x >= 0 ) {
                evt.x = p.x;
                evt.y = p.y;
                this.dispatchEvent(evt)
            }
        }
        let handleTouchEvent  = () => {
            let evt = event as ITouchEvent;
            evt.touchPoints = [];
            evt.points.forEach(point => {
                let p = this.calcInputEventXY({x: point.x, y: point.y}, {x: evt.sourceX, y: evt.sourceY}, {x: evt.destX, y: evt.destY});
                if (p.x >= 0 ) {
                    point.x = p.x;
                    point.y = p.y;
                }            
            })
            switch(event.type) {
                case EInputDeviceTouchType.touchCancel:
                case EInputDeviceTouchType.touchEnd:
                    break;
                default:
                    evt.touchPoints = evt.points;   
                    break;
            }
            this.dispatchEvent(evt);
        }
                    
        switch(event.type) {
            case EInputDeviceMouseType.mousedown:
            case EInputDeviceMouseType.mousemove:
            case EInputDeviceMouseType.mouseup:
            case EInputDeviceMouseType.wheel:   
                handleMouseEvent();
                break;
            case EInputDeviceTouchType.touchCancel:
            case EInputDeviceTouchType.touchEnd:
            case EInputDeviceTouchType.touchMove:
            case EInputDeviceTouchType.touchStart:
                handleTouchEvent();
                break;
            case EInputDeviceMouseType.mouseenter:
            case EInputDeviceMouseType.mouseleave:                    
            case EInputDeviceMouseType.mouseout:
            case EInputDeviceMouseType.mouseover:              
                break;
            default: 
                break;
        }        

    }
    inputEventAndroidBrowser(event: IInputEvent) {
        this.inputEventWindowBrowser(event)

    }
    inputEventAndroidReactnative(event: IInputEvent) {
        this.inputEventWindowBrowser(event)
    }
    calcInputEventXY(point: IInputPoint, source: IInputPoint, dest: IInputPoint): IInputPoint {
            let x = 0, y = 0;
            let xp = point.x;
            let yp = point.y;
            let xs = source.x;
            let ys = source.y;
            let xd = dest.x;
            let yd = dest.y;
            let zs = xs / ys;
            let zd = xd / yd;
            //计算投屏宽高
            zs > zd ? (x = xd, y = xd / zs) : zs < zd ? (x = yd * zs, y = yd) : (x = xd, y = yd);            
            //计算投屏起始点
            let xq = (xd - x) / 2, yq = (yd - y) / 2;

            //计算点击偏移量
            let xo = -1, yo = -1;
            xp >= xq && xp <= xq + x && yp >= yq && yp <= yq + y ? (xo = xp - xq, yo= yp - yq) : null;
            //计算比例
            let xr = xo / x, yr = yo / y;
            //计算点击点
            x = Math.ceil(xr * xs), y = Math.ceil(yr * ys);             
            return {x, y}
    }
    
}