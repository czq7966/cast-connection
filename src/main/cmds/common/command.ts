import { Base, IBaseConstructorParams, IBase, IBaseClass } from "./base";
import { CmdDispatcher } from "./dispatcher";
import * as Dts from "./dts";




export interface ICommandConstructorParams extends IBaseConstructorParams {
    props?: any
}

export interface ICommand extends IBase {
    data: Dts.ICommandData;
    extra: any
    isOverrideEvent(eventName: string): boolean
    copyProperties(props: Object | string)
    assignData(data: Dts.ICommandData)
    sendCommand(): Promise<any>
};

export interface ICommandClass extends IBaseClass {
    defaultCommandId: string
}

export class Command extends Base implements ICommand {
    _eventEmitterEvents : Object;

    data: Dts.ICommandData;
    extra: any

    public static defaultCommandId: string = '';
    constructor(params?: ICommandConstructorParams) {
        super(params);
        params = params || {};
        this.data = {
            cmdId: ((this as any).constructor as ICommandClass).defaultCommandId
        }
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
        if (instanceSingle) { //注册单例事件
            Object.keys(Dts.ECommandEvents).forEach(eventName => {
                    let event = this[eventName +'_Instance'].bind(this);
                    this._eventEmitterEvents[eventName +'_Instance'] = event;
                    if (event) {
                        this.instanceEventEmitter.addListener(eventName, event);
                    } 
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
    
    unInitEvents() {
        if (this.isInstance()) { //注册单例事件
            Object.keys(Dts.ECommandEvents).forEach(eventName => {
                    let event = this._eventEmitterEvents[eventName + '_Instance'];
                    if (event) {
                        this.instanceEventEmitter.removeListener(eventName, event);
                    } 
                }            
            )
        } else { //注册实例事件
            Object.keys(Dts.ECommandEvents).forEach(eventName => {
                if (this.isOverrideEvent(eventName)) {
                    let event = this._eventEmitterEvents[eventName];
                    this.getInstance().eventEmitter.removeListener(eventName, event);
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

    assignData(data: Dts.ICommandData) {
        Object.assign(this.data, data);
    }

    sendCommand(...args: any[]): Promise<any> {     
        this.data.to = this.data.to || {};
        this.data.to.type = this.data.to.type || 'server';
        this.data.to.id = this.data.to.id || '';
        this.data.cmdId = this.data.cmdId || ((this as any).constructor as ICommandClass).defaultCommandId;
        return CmdDispatcher.sendCommand(this, ...args);
    }
  
}