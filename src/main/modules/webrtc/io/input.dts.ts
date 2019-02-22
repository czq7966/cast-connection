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
    timestamp?: number
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
