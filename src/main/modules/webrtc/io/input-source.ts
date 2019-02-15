import { EInputDeviceMouseType, IMouseEvent, IInput } from "./input";

export interface IInputSource {
    attachHTMLElement(source: HTMLElement);
    deattachHTMLElement(source: HTMLElement);    
}
export class InputSource implements IInputSource {
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
    attachHTMLElement(source: HTMLElement) {
        source.onmousedown = this.onHTMLElementMouseEvent
        source.onmouseup = this.onHTMLElementMouseEvent
        source.onmouseenter = this.onHTMLElementMouseEvent
        source.onmouseleave = this.onHTMLElementMouseEvent
        source.onmousemove = this.onHTMLElementMouseEvent
        source.onmouseover = this.onHTMLElementMouseEvent
        source.onmouseout = this.onHTMLElementMouseEvent
        source.onwheel = this.onHTMLElementMouseEvent
        source.ontouchstart = this.onHTMLElementTouchEvent
        source.ontouchmove = this.onHTMLElementTouchEvent
        source.ontouchend = this.onHTMLElementTouchEvent
        source.ontouchcancel = this.onHTMLElementTouchEvent
        this.htmlElements.push(source)
    }
    deattachHTMLElement(source: HTMLElement) {
        source.onmousedown = null;
        source.onmouseup = null;
        source.onmouseenter = null;
        source.onmouseleave = null;
        source.onmousemove = null;
        source.onmouseover = null;
        source.onmouseout = null;
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
        let type = EInputDeviceMouseType[ev.type];
        if (type ) {
            let event: IMouseEvent = {
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
}