import { EventEmitter } from 'events';
import { Client } from './client';

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
    static DefaultSignalerName: string = "adhoc-cast-connection:network:signaler";
    static classes: {[name:string] : ISignalerClass } = {};
    static register(name: string, iClass: ISignalerClass) {
        if (!!iClass)
            this.classes[name] = iClass;
    }
    static unRegister(name: string) {
        delete this.classes[name];
    }
    static create(name: string, ...args: any[]): ISignaler {        
        name = !!name ? name : this.DefaultSignalerName;
        let instance: ISignaler;
        let iClass = this.classes[name];
        if (!!iClass) {
            instance = new iClass(...args) as ISignaler;
        }
        return instance;
    }

}

SignalerFactory.register(SignalerFactory.DefaultSignalerName, Client);