import { EventEmitter } from "events";

var ChangeEventName = 'onChange';
class OnChange {
    events: EventEmitter
    constructor() {
        this.events = new EventEmitter()

    }
    destroy() {
        this.events.removeAllListeners();
        delete this.events;
    }    
    add(fn: (...args: any[]) => void) {
        this.events.addListener(ChangeEventName, fn)
    }
    remove(fn: (...args: any[]) => void) {
        this.events.removeListener(ChangeEventName, fn)
    }    
}
export class StateMachine<T extends number> {
    states: T
    onChange: OnChange;
    static set(states: number, chgStates: number ): number {
        return states | chgStates
    }
    static reset(states: number, chgStates: number ): number {
        return (states | chgStates) - chgStates;
    }    
    static isset(states: number, chkStates: number ): boolean {
        return (states & chkStates) === chkStates        
    }
    constructor(states?: T) {
        this.states = states || 0 as T;
        this.onChange = new OnChange();
    }
    destroy() {
        this.onChange.destroy();
        delete this.onChange;
        delete this.states;
    }
    set(states: T, target?: T, replace?: boolean): T {
        target = target !== null && target !== undefined ? target : this.states;
        let oldStates = target;
        let newStates = replace ? states : oldStates | states ;
        this.states = newStates as T;
        let chgStates = oldStates ^ newStates;
        if (chgStates !== 0) {
            this.onChange.events.emit(ChangeEventName, chgStates, oldStates, newStates)
        }
        return this.states
    }
    reset(states: T, target?: T): T {
        target = target !== null && target !== undefined ? target : this.states;
        let oldStates = target;
        let newStates = (oldStates | states) - states;
        this.states = newStates as T;
        let chgStates = oldStates ^ newStates;
        if (chgStates !== 0) {
            this.onChange.events.emit(ChangeEventName, chgStates, oldStates, newStates)
        }                
        return this.states
    }
    isset(states: T, target?: T): boolean {
        target = target !== null && target !== undefined ? target : this.states;
        return StateMachine.isset(target, states);
    }

}