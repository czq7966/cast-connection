import { EventEmitter } from "events";

export interface IClass {
    new() : Object
}

export interface IBase {
    notDestroyed: boolean
    eventEmitter: EventEmitter,
    instanceId: string;
    instanceSingle: boolean
    instanceEventEmitter: EventEmitter;   
    isInstance(): boolean     
    getInstance<T extends Base>(params?: IBaseConstructorParams | string, create?: boolean): T
    destroy()
}

export interface IBaseClass extends IClass {
    getInstance<T extends Base>(params?: IBaseConstructorParams | string, create?: boolean): T
}

export interface IBaseConstructorParams {
    instanceId?: string
    instanceSingle?: boolean
}


export class Base {
    notDestroyed: boolean
    eventEmitter: EventEmitter

    instanceId: string;
    instanceSingle: boolean
    instanceEventEmitter: EventEmitter;
    
    
    private static instances : {[name: string]: Base} = {};
    public static instanceDefauleName: string = 'default'
    public static getInstance<T extends Base>(params?: IBaseConstructorParams | string, create: boolean = true): T {
        !this.hasOwnProperty('instances') && (this.instances = {});  
        if (typeof params === 'string') {
            params = { instanceId: params }
        } else {
            params = params || { instanceId: Base.instanceDefauleName };
        }
        params.instanceSingle = params.instanceSingle === false ? false : true
        let id = params.instanceId;

        return this.instances[id] ? this.instances[id] : create ? this.instances[id] = new (this as any)(params) : null;
    }    
    
    constructor(params?: IBaseConstructorParams) {
        params = params || {}
        this.notDestroyed = true;
        this.instanceId = params.instanceId || Base.instanceDefauleName;
        this.instanceSingle = params.instanceSingle;         
        this.eventEmitter = new EventEmitter();
        this.instanceEventEmitter = new EventEmitter();    

   
    }
    destroy() {
        this.eventEmitter.removeAllListeners();
        this.instanceEventEmitter.removeAllListeners();        
        delete this.eventEmitter;
        delete this.instanceEventEmitter;
        delete this.instanceId;
        delete this.instanceSingle;
        delete this.notDestroyed;
    }

    getInstance<T extends Base>(params?: IBaseConstructorParams | string, create?: boolean): T{
        params = params || this.instanceId;
        return (this.constructor as any as IBaseClass).getInstance(params, create);
    }  
    isInstance(): boolean {
        return this === this.getInstance(this.instanceId, false);
    }             
}