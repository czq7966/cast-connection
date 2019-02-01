import { Base } from "../base";
import { IInputEvent, EInputOS, EInputPlatform, Input, IInputPoint, IMouseEvent, ITouchEvent, EInputDeviceTouchType, EInputDeviceMouseType, EInputDevice } from "./input";

export class Gesture extends Base {
    input: Input
    touchCount: number;
    constructor(input: Input) {
        super();
        this.input = input;
        this.touchCount = 0
    }
    destroy() {
        delete this.touchCount;
        delete this.input;
        super.destroy();
    }
    inputEvent(event: IInputEvent) {
        switch(this.input.OS) {
            case EInputOS.window:
                this.inputEventWindow(event);
                break;
            case EInputOS.android:
                this.inputEventAndroid(event);
                break;
        }
    }

    dealInputEvent(event: IInputEvent) {
        switch(this.input.OS) {
            case EInputOS.window:
                this.inputEventWindow(event);
                break;
            case EInputOS.android:
                this.inputEventAndroid(event);
                break;
        }
    }
    inputEventWindow(event: IInputEvent) {
        switch(this.input.platform) {
            case EInputPlatform.browser:
                this.inputEventWindowBrowser(event)
                break;
            case EInputPlatform.reactnative:
                this.inputEventWindowBrowser(event)
                break;
        }

    }
    inputEventAndroid(event: IInputEvent) {
        switch(this.input.platform) {
            case EInputPlatform.browser:
                this.inputEventAndroidBrowser(event);
                break;
            case EInputPlatform.reactnative:
                this.inputEventAndroidReactnative(event);
                break;
        }
    }
    inputEventWindowBrowser(event: IInputEvent) {
        switch(event.type) {
            case EInputDeviceMouseType.mousedown:
            case EInputDeviceMouseType.mousemove:
            case EInputDeviceMouseType.mouseup:
            case EInputDeviceMouseType.wheel:   
                this.handleMouseEvent(event as IMouseEvent);
                break;
            case EInputDeviceTouchType.touchcancel:
            case EInputDeviceTouchType.touchend:
            case EInputDeviceTouchType.touchmove:
            case EInputDeviceTouchType.touchstart:
                this.handleTouchEvent(event as ITouchEvent);
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
    changeTouchMode() {
        switch(this.input.touchMode) {
            case EInputDevice.mouse:
                this.input.touchMode = EInputDevice.touch;
                break;
            case EInputDevice.touch:
                this.input.touchMode = EInputDevice.mouse;
                break;
        }
        this.input.sendEvent({
            touchMode: this.input.touchMode
        })
    }
    handleMouseEvent(evt: IMouseEvent) {
        let p = this.calcInputEventXY({x: evt.x, y: evt.y}, {x: evt.sourceX, y: evt.sourceY}, {x: evt.destX, y: evt.destY});
        if (p.x >= 0 ) {
            evt.x = p.x;
            evt.y = p.y;
            this.input.dispatchEvent(evt)
        }        
    }
    handleTouchEvent(event: ITouchEvent) {
        // if (evt.points.length >= 4) {                
        //     this.changeTouchMode();  
        //     return;             
        // }

        if (this.input.touchMode === EInputDevice.mouse) {
            this.handleTouchToMouseEvent(event)
        } else {
            event.touchPoints = [];
            event.changedTouches.forEach(point => {
                let p = this.calcInputEventXY({x: point.x, y: point.y}, {x: event.sourceX, y: event.sourceY}, {x: event.destX, y: event.destY});
                if (p.x >= 0 ) {
                    point.x = p.x;
                    point.y = p.y;
                }            
            })
            event.touchPoints = event.changedTouches;
            switch(event.type) {
                case EInputDeviceTouchType.touchcancel:
                    event.touchPoints = [];
                    this.touchCount = 0;
                    this.input.dispatchEvent(event)
                    break;
                case EInputDeviceTouchType.touchend:
                    event.touchPoints = [];
                    this.touchCount = event.touches.length;
                    this.touchCount <= 0 && (this.touchCount = 0, this.input.dispatchEvent(event))
                    break;
                case EInputDeviceTouchType.touchmove:
                    this.touchCount = event.touches.length;
                    event.touches.length == 1 && this.input.dispatchEvent(event);                    
                    break;
                case EInputDeviceTouchType.touchstart:
                    if (this.touchCount <= 0  ) {                        
                        this.touchCount = event.touches.length;
                        this.input.dispatchEvent(event);
                    } else {
                        this.touchCount = event.touches.length;
                    }
                    break;
                default:
                    
                    break;
            }
            
        }        
    }
    handleTouchToMouseEvent(event: ITouchEvent) {
        event.changedTouches.forEach(point => {
            let p = this.calcInputEventXY({x: point.x, y: point.y}, {x: event.sourceX, y: event.sourceY}, {x: event.destX, y: event.destY});
            if (p.x >= 0 ) {
                point.x = p.x;
                point.y = p.y;
            }            
        })        
        let evtMouse: IMouseEvent = { 
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
                evtMouse.type = EInputDeviceMouseType.wheel;  
                evtMouse.deltaX = event.changedTouches[0].deltaX * 100 || 0;
                evtMouse.deltaY = event.changedTouches[0].deltaX * 100 || 10;
                break;
            case 3:
                evtMouse.button = 'right';
                evtMouse.clickCount = 4;                                        
                break;
        }

        let type: EInputDeviceMouseType;
        switch(event.type) {
            case EInputDeviceTouchType.touchcancel:
                type = EInputDeviceMouseType.mouseup;
                break;
            case EInputDeviceTouchType.touchend:
                type = EInputDeviceMouseType.mouseup;
                break;
            case EInputDeviceTouchType.touchmove:
                type = EInputDeviceMouseType.mousemove;
                break;
            case EInputDeviceTouchType.touchstart:
                type = EInputDeviceMouseType.mousedown;                
                break;
        } 
        !evtMouse.type && (evtMouse.type = type) 
        this.input.dispatchEvent(evtMouse);
    }
}