import * as InputDts from './input.dts'
import { IInput } from './input';

export interface IInputElement {
    attachHTMLElement(source: HTMLElement);
    deattachHTMLElement(source: HTMLElement);    
}
export interface IInputElementRect {
    x: number
    y: number
    width: number
    height: number
}

export class InputElement implements IInputElement {
    input: IInput
    htmlElements: Array<HTMLElement>
    constructor(input: IInput) {
        this.input = input;
        this.htmlElements = new Array();
    }
    destroy() {
        delete this.input;
        delete this.htmlElements;
    }
    // H5
    attachHTMLElement(source: HTMLElement) {
        source.onmousedown = this.onHTMLElementMouseEvent
        source.onmouseup = this.onHTMLElementMouseEvent
        // source.onmouseenter = this.onHTMLElementMouseEvent
        // source.onmouseleave = this.onHTMLElementMouseEvent
        source.onmousemove = this.onHTMLElementMouseEvent
        // source.onmouseover = this.onHTMLElementMouseEvent
        // source.onmouseout = this.onHTMLElementMouseEvent
        source.onwheel = this.onHTMLElementMouseEvent
        source.ontouchstart = this.onHTMLElementTouchEvent
        source.ontouchmove = this.onHTMLElementTouchEvent
        source.ontouchend = this.onHTMLElementTouchEvent
        source.ontouchcancel = this.onHTMLElementTouchEvent
        source.onkeydown

        this.htmlElements.push(source)
    }
    deattachHTMLElement(source: HTMLElement) {
        source.onmousedown = null;
        source.onmouseup = null;
        // source.onmouseenter = null;
        // source.onmouseleave = null;
        source.onmousemove = null;
        // source.onmouseover = null;
        // source.onmouseout = null;
        source.onwheel = null;
        source.ontouchstart = null;
        source.ontouchmove = null;
        source.ontouchend = null;
        source.ontouchcancel = null;
        let idx = this.htmlElements.indexOf(source);
        if (idx >= 0)
            this.htmlElements = this.htmlElements.splice(idx, 1);
    }
    onHTMLElementMouseEvent = (ev: MouseEvent) => {   
        let type = InputDts.EInputDeviceMouseType[ev.type];
        if (type ) {
            let event: InputDts.IMouseEvent = {
                type: type,
                x:  ev.clientX,
                y:  ev.clientY,
                deltaX: (ev as WheelEvent).deltaX,
                deltaY: (ev as WheelEvent).deltaY,
                destX: (ev.target as HTMLVideoElement).offsetWidth,
                destY: (ev.target as HTMLVideoElement).offsetHeight,
                button: ev.button == 0 ? 'left': ev.button == 1 ? 'middle' : ev.button == 2 ? 'right' : 'none',
                clickCount:  ev.buttons
            }
            this.input.sendEvent(event)
            ev.preventDefault();
        }        
        
    }    
    onHTMLElementTouchEvent = (ev: TouchEvent) => {
        let type = InputDts.EInputDeviceTouchType[ev.type];
        if (type) {       
            let touches: InputDts.ITouchPoint[] = [];          
            let changedTouches: InputDts.ITouchPoint[] = [];
            for (let i = 0; i < ev.touches.length; i++) {
                let touch = ev.touches[i];
                touches.push({
                    x: touch.clientX,
                    y: touch.clientY,
                    radiusX: touch.radiusX,
                    radiusY: touch.radiusY,
                    rotationAngle: touch.rotationAngle,
                    force: touch.force,
                    id: touch.identifier,
                    timestamp: Date.now()
                })
            }
            for (let i = 0; i < ev.changedTouches.length; i++) {
                let touch = ev.changedTouches[i];
                changedTouches.push({
                    x: touch.clientX,
                    y: touch.clientY,
                    radiusX: touch.radiusX,
                    radiusY: touch.radiusY,
                    rotationAngle: touch.rotationAngle,
                    force: touch.force,
                    id: touch.identifier,
                    timestamp: Date.now()
                })
            }            
            
            let event: InputDts.ITouchEvent = {
                type: type,
                touches: touches,
                changedTouches: changedTouches,
                destX: (ev.target as HTMLVideoElement).offsetWidth,
                destY: (ev.target as HTMLVideoElement).offsetHeight,
            }
            this.input.sendEvent(event)
            ev.preventDefault();            
        }    
    }  

    // RN
    
    attachRNPanResponder(PanResponder: any, onGetRect:() => IInputElementRect) {
        let panResponder = PanResponder.create({
            onStartShouldSetPanResponder: this.onStartShouldSetPanResponder,
            onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
            // onMoveShouldSetPanResponderCapture: this.onMoveShouldSetPanResponderCapture
            // onStartShouldSetPanResponderCapture: this.onStartShouldSetPanResponderCapture
            onPanResponderGrant: this.onPanResponderGrant,
            onPanResponderStart: this.onPanResponderStart(onGetRect),
            onPanResponderMove: this.onPanResponderMove(onGetRect),
            onPanResponderRelease: this.onPanResponderEnd(onGetRect),
            onPanResponderTerminate: this.onPanResponderEnd(onGetRect),
            // onShouldBlockNativeResponder: this.onShouldBlockNativeResponder
        })
        return panResponder;
} 

    // //Pan Responder Handler

    onMoveShouldSetPanResponder = (e: any, gestureState: any) => {
        return true;
    }
    onStartShouldSetPanResponder = (e: any, gestureState: any) => {
        return true;
    }
    onPanResponderGrant = (e: any, gestureState: any) => {}
    onPanResponderStart = (onGetRect:() => IInputElementRect) => {
        let _onPanResponderTouch = (e: any, gestureState: any) => {
            this.onPanResponderTouch(InputDts.EInputDeviceTouchType.touchstart, e, gestureState, onGetRect); 
        }
        return _onPanResponderTouch;
    }

    onPanResponderMove = (onGetRect:() => IInputElementRect) => {
        let _onPanResponderTouch = (e: any, gestureState: any) => {
            this.onPanResponderTouch(InputDts.EInputDeviceTouchType.touchmove, e, gestureState, onGetRect); 
        }
        return _onPanResponderTouch;
    }
    onPanResponderEnd = (onGetRect:() => IInputElementRect) => {
        let _onPanResponderTouch = (e: any, gestureState: any) => {
            this.onPanResponderTouch(InputDts.EInputDeviceTouchType.touchend, e, gestureState, onGetRect); 
        }
        return _onPanResponderTouch;
    }    

    // onShouldBlockNativeResponder = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    //     return false;
    // };
    // // onPanResponderRelease = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {}
    // // onPanResponderReject?: (e: GestureResponderEvent, gestureState: PanResponderGestureState) => void;

    // onMoveShouldSetPanResponderCapture = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    //     return true
    // };
    // onStartShouldSetPanResponderCapture = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    //     return true
    // };

    // // onPanResponderTerminationRequest?: (e: GestureResponderEvent, gestureState: PanResponderGestureState) => boolean;
    // // onPanResponderTerminate = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {}

    onPanResponderTouch = (type: InputDts.EInputDeviceTouchType, e: any, gestureState: any, onGetRect:() => IInputElementRect) => {
        if (type) {       
            let rect = onGetRect();
            let touches: InputDts.ITouchPoint[] = [];          
            let changedTouches: InputDts.ITouchPoint[] = [];
            for (let i = 0; i < e.nativeEvent.touches.length; i++) {
                let touch = e.nativeEvent.touches[i];
                touches.push({
                    x: touch.pageX - rect.x, 
                    y: touch.pageY - rect.y,
                    deltaX: gestureState.vx,
                    deltaY: gestureState.vy,
                    radiusX: touch.radiusX,
                    radiusY: touch.radiusY,
                    rotationAngle: touch.rotationAngle,
                    force: touch.force,
                    id: touch.identifier,
                    timestamp: touch.timestamp || Date.now()
                })
            }
            for (let i = 0; i < e.nativeEvent.changedTouches.length; i++) {
                let touch = e.nativeEvent.changedTouches[i];
                changedTouches.push({
                    x: touch.pageX - rect.x, 
                    y: touch.pageY - rect.y,
                    deltaX: gestureState.vx,
                    deltaY: gestureState.vy,                    
                    radiusX: touch.radiusX,
                    radiusY: touch.radiusY,
                    rotationAngle: touch.rotationAngle,
                    force: touch.force,
                    id: touch.identifier,
                    timestamp: touch.timestamp || Date.now()
                })
            }      
            let event: InputDts.ITouchEvent = {
                type: type,
                touches: touches,
                changedTouches: changedTouches,
                destX: rect.width,
                destY: rect.height,
            }
            this.input.sendEvent(event)
            e.preventDefault();            
        }  
    }        
}