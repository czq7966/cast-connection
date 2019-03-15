import { Base, IBase } from "./base";
import { EEventEmitterEmit2Result } from "./events-ex";

enum EEventRooterEvents {
    onPreventRoot = 'onPreventRoot',
    onBeforeRoot = 'onBeforeRoot',
    onAfterRoot = 'onAfterRoot',
    onRoot = 'onRoot'
}
export interface IEventRooterEvents {
    add(fn: (...args: any[]) => EEventEmitterEmit2Result)
    remove(fn: (...args: any[]) => EEventEmitterEmit2Result)
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
    add(fn: (...args: any[]) => EEventEmitterEmit2Result) {
        this.rooter.eventEmitter.addListener(this.event, fn)
    }
    remove(fn: (...args: any[]) => EEventEmitterEmit2Result) {
        this.rooter.eventEmitter.removeListener(this.event, fn)
    }    
}

export interface IEventRooter extends IBase {
    parent: IEventRooter;
    onPreventRoot: IEventRooterEvents;
    onBeforeRoot: IEventRooterEvents;
    onAfterRoot: IEventRooterEvents;
    root(...args: any[]): EEventEmitterEmit2Result;
    setParent(parent?: IEventRooter);

}

export class EventRooter extends Base implements IEventRooter {
    parent: IEventRooter;
    onPreventRoot: IEventRooterEvents;
    onBeforeRoot: IEventRooterEvents;
    onAfterRoot: IEventRooterEvents;

    constructor(parent?: IEventRooter){
        super();
        this.parent = parent;
        this.onAfterRoot = new EventRooterEvents(EEventRooterEvents.onAfterRoot, this);
        this.onBeforeRoot = new EventRooterEvents(EEventRooterEvents.onBeforeRoot, this);
        this.onPreventRoot = new EventRooterEvents(EEventRooterEvents.onPreventRoot, this);
        this.parent && this.parent.eventEmitter.addListener(EEventRooterEvents.onRoot, this.root)        

    }
    destroy() {
        this.parent && this.parent.notDestroyed && this.parent.eventEmitter.removeListener(EEventRooterEvents.onRoot, this.root)
        delete this.parent;
        delete this.onAfterRoot;
        delete this.onBeforeRoot;
        delete this.onPreventRoot;
        super.destroy()
    }
    setParent(parent?: IEventRooter) {
        this.parent && this.parent.notDestroyed && this.parent.eventEmitter.removeListener(EEventRooterEvents.onRoot, this.root);
        this.parent = parent;
        this.parent && this.parent.notDestroyed && this.parent.eventEmitter.addListener(EEventRooterEvents.onRoot, this.root);
    }


    root = (...args: any[]): EEventEmitterEmit2Result => {
        let onPreventRoot = EEventEmitterEmit2Result.none;
        let onBeforeRoot = EEventEmitterEmit2Result.none;
        let onRoot = EEventEmitterEmit2Result.none;
        let onAfterRoot = EEventEmitterEmit2Result.none;

        onPreventRoot = (this.eventEmitter as any).emit2(EEventRooterEvents.onPreventRoot, ...args) as EEventEmitterEmit2Result;
        if ((onPreventRoot & EEventEmitterEmit2Result.preventRoot) !== EEventEmitterEmit2Result.preventRoot) {
            onBeforeRoot = (this.eventEmitter as any).emit2(EEventRooterEvents.onBeforeRoot, ...args) as EEventEmitterEmit2Result;
            if ((onBeforeRoot & EEventEmitterEmit2Result.preventRoot) !== EEventEmitterEmit2Result.preventRoot) {
                onRoot = (this.eventEmitter as any).emit2(EEventRooterEvents.onRoot, ...args) as EEventEmitterEmit2Result;
                if ((onRoot & EEventEmitterEmit2Result.preventRoot) !== EEventEmitterEmit2Result.preventRoot) {
                    onAfterRoot = (this.eventEmitter as any).emit2(EEventRooterEvents.onAfterRoot, ...args) as EEventEmitterEmit2Result;                
                }
            }
        }
        return onAfterRoot | onRoot;
    }
}