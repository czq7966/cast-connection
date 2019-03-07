import { Base, IBaseConstructorParams, IBase, IBaseClass } from "./base";
import { EDCoder } from "./edcoder";
import * as Dts from "./dts";




export interface ICommandConstructorParams<P> extends IBaseConstructorParams {
    props?: P
}

export interface ICommand extends IBase {
    data: Dts.ICommandData<any>;
    extra: any
    preventDefault: boolean
    isOverrideEvent(eventName: string): boolean
    copyProperties(props: Object | string)
    assignData(data: Dts.ICommandData<any>)
    sendCommand(): Promise<any>
};

export interface ICommandClass extends IBaseClass {
    defaultCommandId: string
}

export class Command<T extends any> extends Base implements ICommand {
    _eventEmitterEvents : Object;

    data: Dts.ICommandData<T>;
    extra: any;
    preventDefault: boolean;

    static defaultCommandId: string = '';
    constructor(params?: ICommandConstructorParams<T>) {
        super(params);
        params = params || {} as any;
        this.data = {
            cmdId: ((this as any).constructor as ICommandClass).defaultCommandId
        } as any;
        this.extra = {}
        this._eventEmitterEvents = {};        
        this.copyProperties(params.props);
        this.initEvents(params.instanceSingle);
    }
    destroy() {
        this.unInitEvents();        
        delete this.extra;
        delete this.data;
        delete this._eventEmitterEvents;
        super.destroy();
    }

    initEvents(instanceSingle?: boolean) {
        if (this.instanceId) {
            if (instanceSingle) { //注册单例事件
                Object.keys(Dts.ECommandDispatchEvents).forEach(eventName => {
                        let event = this[eventName +'_Instance'].bind(this);
                        this._eventEmitterEvents[eventName +'_Instance'] = event;
                        this.instanceEventEmitter.addListener(eventName, event);
                    }            
                )
            } else { //注册实例事件
                Object.keys(Dts.ECommandDispatchEvents).forEach(eventName => {    
                    if (this.isOverrideEvent(eventName)) {    
                        let event = this[eventName].bind(this);
                        this._eventEmitterEvents[eventName] = event;                    
                        this.getInstance().eventEmitter.addListener(eventName, event);  
                    }            
                })
            }
        }
    }     
    
    unInitEvents() {
        if (this.isInstance()) { //注册单例事件
            Object.keys(Dts.ECommandDispatchEvents).forEach(eventName => {
                    let event = this._eventEmitterEvents[eventName + '_Instance'];
                    event && this.instanceEventEmitter.removeListener(eventName, event);
                }            
            )
        } else { //注册实例事件
            Object.keys(Dts.ECommandDispatchEvents).forEach(eventName => {
                if (this.isOverrideEvent(eventName)) {
                    let event = this._eventEmitterEvents[eventName];
                    event && this.getInstance().eventEmitter.removeListener(eventName, event);
                }            
            })
        }
    }       
        
    onDispatched_Instance(...args: any[]) {
        this.eventEmitter.emit(Dts.ECommandDispatchEvents.onDispatched, ...args)
    }
    onBeforeDispatched_Instance(...args: any[]) {
        this.eventEmitter.emit(Dts.ECommandDispatchEvents.onBeforeDispatched, ...args)
    }    
    
    isOverrideEvent(eventName: string): boolean {
        return !!(this[eventName] && (typeof this[eventName] === 'function'))
    }    


    copyProperties(props: Object | string): Command<T> {
        props && (typeof props == 'object') && (props = JSON.stringify(props))
        props && (this.data.props = JSON.parse(props as string));
        return this;
    }

    assignData(data: Dts.ICommandData<any>, merge?: boolean): Command<T>  {
        if (merge) {
            this.data = Object.assign(this.data, data);
        } else {
            this.data = Object.assign({}, data) as any;
        }
        return this        
    }

    sendCommand(...args: any[]): Promise<any> {     
        this.data.to = this.data.to || {};
        this.data.to.type = this.data.to.type || 'server';
        this.data.to.id = this.data.to.id || '';
        this.data.cmdId = this.data.cmdId || ((this as any).constructor as ICommandClass).defaultCommandId;
        return EDCoder.sendCommand(this, ...args);
    }
    sendCommandForResp(...args: any[]): Promise<any> {    
        return new Promise((resolve, reject) => {
            let onResp = (cmdResp: ICommand) => {                
                let data = cmdResp.data;
                if (data.respResult) {
                    EDCoder.dispatch(cmdResp , Dts.ECommandDispatchEvents.onDispatched);
                    resolve(data);
                } else {
                    reject(data)
                }
            }
            let onRespTimeout = (data:  Dts.ICommandData<any>) => {
                console.log('onTimeout', data)
                data.respResult = false;
                data.respMsg = 'time out!'                    
                reject(data);
            } 

            this.data.onResp = this.data.onResp || onResp
            this.data.onRespTimeout = this.data.onRespTimeout || onRespTimeout;
            this.sendCommand(...args).catch(err => reject(err));   
        })
    }      
}