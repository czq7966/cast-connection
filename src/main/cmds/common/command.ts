import { Base, IBaseConstructorParams, IBase, IBaseClass } from "./base";
import { CmdDispatcher } from "./dispatcher";
import * as Dts from "./dts";




export interface ICommandConstructorParams<P> extends IBaseConstructorParams {
    props?: P
}

export interface ICommand extends IBase {
    data: Dts.ICommandData<any>;
    extra: any
    isOverrideEvent(eventName: string): boolean
    copyProperties(props: Object | string)
    assignData(data: Dts.ICommandData<any>)
    sendCommand(): Promise<any>
};

export interface ICommandClass extends IBaseClass {
    defaultCommandId: string
}

export class Command<T extends Dts.ICommandData<any>, P extends ICommandConstructorParams<any>> extends Base implements ICommand {
    _eventEmitterEvents : Object;

    data: T;
    extra: any

    static defaultCommandId: string = '';
    constructor(params?: P) {
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
                Object.keys(Dts.ECommandEvents).forEach(eventName => {
                        let event = this[eventName +'_Instance'].bind(this);
                        this._eventEmitterEvents[eventName +'_Instance'] = event;
                        this.instanceEventEmitter.addListener(eventName, event);
                    }            
                )
            } else { //注册实例事件
                Object.keys(Dts.ECommandEvents).forEach(eventName => {    
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
            Object.keys(Dts.ECommandEvents).forEach(eventName => {
                    let event = this._eventEmitterEvents[eventName + '_Instance'];
                    event && this.instanceEventEmitter.removeListener(eventName, event);
                }            
            )
        } else { //注册实例事件
            Object.keys(Dts.ECommandEvents).forEach(eventName => {
                if (this.isOverrideEvent(eventName)) {
                    let event = this._eventEmitterEvents[eventName];
                    event && this.getInstance().eventEmitter.removeListener(eventName, event);
                }            
            })
        }
    }       
        
    onDispatched_Instance(...args: any[]) {
        this.eventEmitter.emit(Dts.ECommandEvents.onDispatched, ...args)
    }
    onBeforeDispatched_Instance(...args: any[]) {
        this.eventEmitter.emit(Dts.ECommandEvents.onBeforeDispatched, ...args)
    }    
    
    isOverrideEvent(eventName: string): boolean {
        return !!(this[eventName] && (typeof this[eventName] === 'function'))
    }    


    copyProperties(props: Object | string) {
        props && (typeof props == 'object') && (props = JSON.stringify(props))
        props && (this.data.props = JSON.parse(props as string));
    }

    assignData(data: Dts.ICommandData<any>, merge?: boolean) {
        if (merge) {
            this.data = Object.assign(this.data, data);
        } else {
            this.data = Object.assign({}, data) as any;
        }
        
    }

    sendCommand(...args: any[]): Promise<any> {     
        this.data.to = this.data.to || {};
        this.data.to.type = this.data.to.type || 'server';
        this.data.to.id = this.data.to.id || '';
        this.data.cmdId = this.data.cmdId || ((this as any).constructor as ICommandClass).defaultCommandId;
        return CmdDispatcher.sendCommand(this, ...args);
    }
  
}