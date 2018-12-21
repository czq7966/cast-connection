import { Base } from "./base";

export enum EInputDevice {
    mouse = 'mouse',
    touch = 'touch',
    keyboard = 'keyboard'
}
export enum EInputDeviceMouseType {
    mousePressed = 'mousePressed',
    mouseReleased = 'mouseReleased',
    mouseMoved = 'mouseMoved',
    mouseWheel = 'mouseWheel'
}
export enum EInputDeviceTouchType {
    touchStart = 'mousePressed',
    touchEnd = 'touchEnd',
    touchMove = 'touchMove',
    mouseWheel = 'touchCancel'
}

export enum EInputPlatform {
    browser = 'browser',
    reactnative = 'reactnative'
}
export interface TouchPoint {
    x: number,
    y: number,
    radiusX?: number
    radiusY?: number
    rotationAngle?: number
    id?: number
}

export class Input extends Base {
    constructor() {
        super();
    }
    destroy() {
        super.destroy();
    }
}