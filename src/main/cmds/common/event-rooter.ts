import { Base, IBaseConstructorParams, IBase } from "./base";
import { ICommand } from "./command";
import { ECommandDispatchEvents, ECommandEvents, ICommandData } from "./dts";

enum EEventRooterEvents {
    onCanStopRoot = 'onCanStopRoot',
    onBeforeRoot = 'onBeforeRoot',
    onAfterRoot = 'onAfterRoot',
    onRoot = 'onRoot'
}
export interface IEventRooterEvents {
    add(fn: (...args: any[]) => boolean)
    remove(fn: (...args: any[]) => boolean)
}

export class EventRooterEvents {
    rooter: IEventRooter
    event: string
    constructor(event: string, rooter: IEventRooter) {
        this.event = event
        this.rooter = rooter;
    }
    destroy() {
        delete this.event;
        delete this.rooter;
    }
    add(fn: (...args: any[]) => boolean) {
        this.rooter.eventEmitter.addListener(this.event, fn)
    }
    remove(fn: (...args: any[]) => boolean) {
        this.rooter.eventEmitter.removeListener(this.event, fn)
    }    
}

export interface IEventRooter extends IBase {
    parent: IEventRooter;
    onCanStopRoot: IEventRooterEvents;
    onBeforeRoot: IEventRooterEvents;
    onAfterRoot: IEventRooterEvents;

}

export class EventRooter extends Base implements IEventRooter {
    parent: IEventRooter;
    onCanStopRoot: IEventRooterEvents;
    onBeforeRoot: IEventRooterEvents;
    onAfterRoot: IEventRooterEvents;

    constructor(parent: IEventRooter){
        super();
        this.parent = parent;
        this.onAfterRoot = new EventRooterEvents(EEventRooterEvents.onAfterRoot, this);
        this.onBeforeRoot = new EventRooterEvents(EEventRooterEvents.onBeforeRoot, this);
        this.onCanStopRoot = new EventRooterEvents(EEventRooterEvents.onCanStopRoot, this);
        this.parent && this.parent.eventEmitter.removeListener(EEventRooterEvents.onRoot, this.root)        

    }
    destroy() {
        this.parent && this.parent.eventEmitter.removeListener(EEventRooterEvents.onRoot, this.root)
        delete this.parent;
        delete this.onAfterRoot;
        delete this.onBeforeRoot;
        delete this.onCanStopRoot;
        super.destroy()
    }


    root = (...args: any[]) => {
        let onCanStopRoot = (this.eventEmitter as any).emit2(EEventRooterEvents.onCanStopRoot, ...args) === true;
        if (!onCanStopRoot) {
            (this.eventEmitter as any).emit2(EEventRooterEvents.onBeforeRoot, ...args);
            (this.eventEmitter as any).emit2(EEventRooterEvents.onRoot, ...args);
            (this.eventEmitter as any).emit2(EEventRooterEvents.onAfterRoot, ...args);                
        }
    }
}