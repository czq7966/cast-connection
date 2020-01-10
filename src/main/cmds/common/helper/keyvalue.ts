import { EventEmitter } from "events";

export interface IKeyValue<T> {
    eventEmitter: EventEmitter
    extra: any
    destroy()
    del(key: string): T
    add(key: string, value: T)
    get(key: string): T
    exist(key: string): boolean
    values(): T[]
    keys(): string[]
    clear()
    count(): number
    on(event: "del" | "add" | "clear" , listener: (...args: any[]) => void)
    off(event: "del" | "add" | "clear" , listener: (...args: any[]) => void)
    emit(event: "del" | "add" | "clear", ...args: any[]): boolean
}

export class KeyValue<T> implements IKeyValue<T> {
    eventEmitter: EventEmitter
    items: {[key: string]: T}
    extra: any
    constructor(createEvent?: boolean, extra?: any) {
        this.items = {}
        if (createEvent) this.eventEmitter = new EventEmitter();
        this.extra = extra
    }
    destroy() {
        this.clear();
        this.eventEmitter && this.eventEmitter.removeAllListeners();
        delete this.eventEmitter;
        delete this.items;
        delete this.extra;
    }
    del(key: string): T {
        let value = this.items[key];
        delete this.items[key];
        this.emit("del", key, value);
        return value;
    }
    add(key: string, value: T) {
        this.items[key] = value;
        this.emit("add", key, value);
    }
    get(key: string): T {
        return this.items[key] as T;
    }
    exist(key: string): boolean {
        return this.get(key) !== undefined
    }
    keys(): string[] {
        return Object.keys(this.items);
    }
    values(): T[] {
        let values: T[] = []
        this.keys().forEach(key => {
            values.push(this.get(key))            
        })      
        return values;
    }
    clear() {
        this.keys().forEach(key => {
            this.del(key)
        })
        this.emit("clear");
    }
    count(): number {
        return this.keys().length;
    }
    on(event: "del" | "add" | "clear", listener: (...args: any[]) => void) {
        this.eventEmitter && this.eventEmitter.on(event, listener);
    }    
    off(event: "del" | "add" | "clear" , listener: (...args: any[]) => void) {
        this.eventEmitter && this.eventEmitter.off(event, listener);
    }
    emit(event: "del" | "add" | "clear", ...args: any[]): boolean {
        return !!this.eventEmitter && this.eventEmitter.emit(event, ...args, this)
    }
}