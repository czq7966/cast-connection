import { Client } from './client'; 

export var DefaultFactorySignalerName = "DefaultFactorySignaler";
export interface ISignaler {
    destroy();
    id(): string;
    connected(): boolean;
    connect(url?: string): Promise<any>;
    disconnect();
    connecting(): boolean;
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
    static create(name?: string, ...args: any[]): ISignaler {        
        name = !!name ? name : DefaultFactorySignalerName;
        let instance: ISignaler;
        let iClass = this.classes[name];
        if (!!iClass) {
            instance = new iClass(...args) as ISignaler;
        }
        return instance;
    }

}


export class Signaler extends Client implements ISignaler {
    
};

SignalerFactory.register(DefaultFactorySignalerName, Signaler);