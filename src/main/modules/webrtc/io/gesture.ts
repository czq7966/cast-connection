import * as InputDts from './input.dts'
import { Base, IBase } from "../base";
import { IInput } from './input';

export interface IGesture extends IBase {
    input: IInput
    inputEvent(event: InputDts.IInputEvent)
}

export class Gesture extends Base implements IGesture {
    input: IInput
    touchCount: number;
    previousTouchEvent: InputDts.ITouchEvent;
    constructor(input: IInput) {
        super();
        this.input = input;
        this.touchCount = 0
    }
    destroy() {
        delete this.touchCount;
        delete this.input;
        super.destroy();
    }
    inputEvent(event: InputDts.IInputEvent) {
        switch(this.input.OS) {
            case InputDts.EInputOS.window:
                this.inputEventWindow(event);
                break;
            case InputDts.EInputOS.android:
                this.inputEventAndroid(event);
                break;
        }
    }

    dealInputEvent(event: InputDts.IInputEvent) {
        switch(this.input.OS) {
            case InputDts.EInputOS.window:
                this.inputEventWindow(event);
                break;
            case InputDts.EInputOS.android:
                this.inputEventAndroid(event);
                break;
        }
    }
    inputEventWindow(event: InputDts.IInputEvent) {
        switch(this.input.platform) {
            case InputDts.EInputPlatform.browser:
                this.inputEventWindowBrowser(event)
                break;
            case InputDts.EInputPlatform.reactnative:
                this.inputEventWindowBrowser(event)
                break;
        }

    }
    inputEventAndroid(event: InputDts.IInputEvent) {
        switch(this.input.platform) {
            case InputDts.EInputPlatform.browser:
                this.inputEventAndroidBrowser(event);
                break;
            case InputDts.EInputPlatform.reactnative:
                this.inputEventAndroidReactnative(event);
                break;
        }
    }
    inputEventWindowBrowser(event: InputDts.IInputEvent) {
        switch(event.type) {
            case InputDts.EInputDeviceMouseType.mousedown:
            case InputDts.EInputDeviceMouseType.mousemove:
            case InputDts.EInputDeviceMouseType.mouseup:
            case InputDts.EInputDeviceMouseType.wheel:   
                this.handleMouseEvent(event as InputDts.IMouseEvent);
                break;
            case InputDts.EInputDeviceTouchType.touchcancel:
            case InputDts.EInputDeviceTouchType.touchend:
            case InputDts.EInputDeviceTouchType.touchmove:
            case InputDts.EInputDeviceTouchType.touchstart:
                this.handleTouchEvent(event as InputDts.ITouchEvent);
                break;
            case InputDts.EInputDeviceMouseType.mouseenter:
            case InputDts.EInputDeviceMouseType.mouseleave:                    
            case InputDts.EInputDeviceMouseType.mouseout:
            case InputDts.EInputDeviceMouseType.mouseover:              
                break;
            default: 
                break;
        }        

    }
    inputEventAndroidBrowser(event: InputDts.IInputEvent) {
        this.inputEventWindowBrowser(event)
    }
    inputEventAndroidReactnative(event: InputDts.IInputEvent) {
        this.inputEventWindowBrowser(event)
    }
    calcInputEventXY(point: InputDts.IInputPoint, source: InputDts.IInputPoint, dest: InputDts.IInputPoint): InputDts.IInputPoint {
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
    calcInputEventDeltaXY(first: InputDts.IInputPoint, second: InputDts.IInputPoint, delta: number): InputDts.IInputPoint {
        let x = 0, y = 0;
        let xf = first.x;
        let yf = first.y;
        let xs = second.x;
        let ys = second.y;
        x = (xs - xf) * delta;
        y = (ys - yf) * delta;
        return {x, y}
    }    
    changeTouchMode() {
        switch(this.input.touchMode) {
            case InputDts.EInputDevice.mouse:
                this.input.touchMode = InputDts.EInputDevice.touch;
                break;
            case InputDts.EInputDevice.touch:
                this.input.touchMode = InputDts.EInputDevice.mouse;
                break;
        }
        this.input.sendEvent({
            touchMode: this.input.touchMode
        })
    }
    getPreviousTouchPoint(id: number): InputDts.ITouchPoint {
        let previous = this.previousTouchEvent;
        if (previous) {
            let prePoint: InputDts.ITouchPoint;
            previous.changedTouches.forEach(pp => {
                if (pp.id === id) {
                    prePoint = pp
                }
            })
            return prePoint;
        }
    }
    handleMouseEvent(evt: InputDts.IMouseEvent) {
        let p = this.calcInputEventXY({x: evt.x, y: evt.y}, {x: evt.sourceX, y: evt.sourceY}, {x: evt.destX, y: evt.destY});
        if (p.x >= 0 ) {
            evt.x = p.x;
            evt.y = p.y;
            this.input.dispatchEvent(evt)
        }        
    }
    handleTouchEvent(evt: InputDts.ITouchEvent) {     
        let valid = false;
        evt.changedTouches.forEach(point => {            
            let p = this.calcInputEventXY({x: point.x, y: point.y}, {x: evt.sourceX, y: evt.sourceY}, {x: evt.destX, y: evt.destY});
            if (p.x >= 0 ) {
                point.x = p.x;
                point.y = p.y;
                valid = true;

                if (evt.type === InputDts.EInputDeviceTouchType.touchmove) {
                    let prePoint = this.getPreviousTouchPoint(point.id)
                    if (prePoint) {
                        let delta = point.timestamp - prePoint.timestamp;
                        p = this.calcInputEventDeltaXY({x: prePoint.x, y: prePoint.y}, {x: point.x, y: point.y}, 1);
                        if (p.y <=5 && p.y >=-5 ) return;
                        valid = false;
                        point.deltaX = 0;
                        point.deltaY = p.y;
                    }    
                }    
            }            
        })        

        if (valid) {
            this.previousTouchEvent = null;            
            if (evt.type === InputDts.EInputDeviceTouchType.touchmove) 
                this.previousTouchEvent = evt;
            this.input.dispatchEvent(evt)
        }

        return;

        if (this.input.touchMode === InputDts.EInputDevice.mouse) {
            this.handleTouchToMouseEvent(evt)
        } else {
            evt.touchPoints = [];
            evt.changedTouches.forEach(point => {
                let p = this.calcInputEventXY({x: point.x, y: point.y}, {x: evt.sourceX, y: evt.sourceY}, {x: evt.destX, y: evt.destY});
                if (p.x >= 0 ) {
                    point.x = p.x;
                    point.y = p.y;
                }            
            })
            evt.touchPoints = evt.changedTouches;
            switch(event.type) {
                case InputDts.EInputDeviceTouchType.touchcancel:
                    evt.touchPoints = [];
                    this.touchCount = 0;
                    this.input.dispatchEvent(evt)
                    break;
                case InputDts.EInputDeviceTouchType.touchend:
                    evt.touchPoints = [];
                    this.touchCount = evt.touches.length;
                    this.touchCount <= 0 && (this.touchCount = 0, this.input.dispatchEvent(evt))
                    break;
                case InputDts.EInputDeviceTouchType.touchmove:
                    this.touchCount = evt.touches.length;
                    evt.touches.length == 1 && this.input.dispatchEvent(evt);                    
                    break;
                case InputDts.EInputDeviceTouchType.touchstart:
                    if (this.touchCount <= 0  ) {                        
                        this.touchCount = evt.touches.length;
                        this.input.dispatchEvent(evt);
                    } else {
                        this.touchCount = evt.touches.length;
                    }
                    break;
                default:
                    
                    break;
            }
            
        }        
    }
    handleTouchToMouseEvent(event: InputDts.ITouchEvent) {
        event.changedTouches.forEach(point => {
            let p = this.calcInputEventXY({x: point.x, y: point.y}, {x: event.sourceX, y: event.sourceY}, {x: event.destX, y: event.destY});
            if (p.x >= 0 ) {
                point.x = p.x;
                point.y = p.y;
            }            
        })        
        let evtMouse: InputDts.IMouseEvent = { 
                x: event.changedTouches[0].x, 
                y: event.changedTouches[0].y,
                destX: event.destX,
                destY: event.destY
            }

        switch(event.touches.length) {
            case 1:
                evtMouse.button = 'left';                
                evtMouse.clickCount = 1;                
                break;
            case 2:
                evtMouse.button = 'left';                
                evtMouse.clickCount = 0;           
                evtMouse.type = InputDts.EInputDeviceMouseType.wheel;  
                evtMouse.deltaX = event.changedTouches[0].deltaX * 100 || 0;
                evtMouse.deltaY = event.changedTouches[0].deltaX * 100 || 10;
                break;
            case 3:
                evtMouse.button = 'right';
                evtMouse.clickCount = 4;                                        
                break;
        }

        let type: InputDts.EInputDeviceMouseType;
        switch(event.type) {
            case InputDts.EInputDeviceTouchType.touchcancel:
                type = InputDts.EInputDeviceMouseType.mouseup;
                break;
            case InputDts.EInputDeviceTouchType.touchend:
                type = InputDts.EInputDeviceMouseType.mouseup;
                break;
            case InputDts.EInputDeviceTouchType.touchmove:
                type = InputDts.EInputDeviceMouseType.mousemove;
                break;
            case InputDts.EInputDeviceTouchType.touchstart:
                type = InputDts.EInputDeviceMouseType.mousedown;                
                break;
        } 
        !evtMouse.type && (evtMouse.type = type) 
        this.input.dispatchEvent(evtMouse);
    }
}