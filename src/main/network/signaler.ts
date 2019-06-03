import { EventEmitter } from 'events';

export var DefaultFactorySignalerName = "DefaultFactorySignaler";

export interface ISignaler {
    eventEmitter: EventEmitter;
    destroy()
    id(): string 
    getUrl(): string;    
    setUrl(value: string);    
    connected(): boolean
    connecting(): boolean 
    connect(url?: string): Promise<any>
    disconnect()
    sendCommand(cmd: any): Promise<any>
}

export interface ISignalerClass {
    new(...args: any[]) : Object
}


export class SignalerFactory {
    static classes: {[name:string] : ISignalerClass } = {};
    static register(name: string, iClass: ISignalerClass) {
        if (!!iClass)
            this.classes[name] = iClass;
    }
    static unRegister(name: string) {
        delete this.classes[name];
    }
    static create(name: string, ...args: any[]): ISignaler {        
        name = !!name ? name : DefaultFactorySignalerName;
        let instance: ISignaler;
        let iClass = this.classes[name];
        if (!!iClass) {
            instance = new iClass(...args) as ISignaler;
        }
        return instance;
    }

}

