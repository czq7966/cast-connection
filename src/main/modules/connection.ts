import * as Network from '../network'
import * as Services from '../services'
import * as Cmds from "../cmds/index";
import * as Dispatchers from './dispatchers'
import { Rooms } from './rooms';

export interface IConnectionConstructorParams extends Cmds.Common.IBaseConstructorParams {
    signalerBase: string
    namespace: string
    path?: string
    roomPrefix?: string
    rtcConfig?: {iceServers:[]}
    factorySignaler?: string;
    notInitDispatcherFilters?: boolean;
    parent?: Object;
}

export interface IConnection extends Cmds.Common.ICommandRooter {
    params: IConnectionConstructorParams;
    signalerBase: string
    namespace: string
    signaler: Network.ISignaler;
    rooms: Rooms;
    dispatcher: Dispatchers.IDispatcher
    dispatcherFitlers: Cmds.Common.Helper.KeyValue<Dispatchers.IDispatcherFilter>
    login(user?: Cmds.IUser, namespace?: string, signalerBase?: string): Promise<any> 
    retryLogin(user?: Cmds.IUser, namespace?: string, signalerBase?: string, retryTimeout?: number, retryCount?: number): Promise<any>
    stopRetryLogin()
    isLogin(): boolean
    logout(): Promise<any>
    connect(namespace?: string, signalerBase?: string): Promise<any>
    disconnect()
    getSignalerUrl(): string
}

export class Connection extends Cmds.Common.CommandRooter implements IConnection {    
    params: IConnectionConstructorParams;
    signalerBase: string
    namespace: string
    signaler: Network.ISignaler;
    rooms: Rooms;
    dispatcher: Dispatchers.IDispatcher
    dispatcherFitlers: Cmds.Common.Helper.KeyValue<Dispatchers.IDispatcherFilter>
    constructor(params: IConnectionConstructorParams) {
        super(params);
        this.params = Object.assign({}, params);
        this.instanceId = this.instanceId || Cmds.Common.Helper.uuid();
        this.namespace = params.namespace
        this.signalerBase = params.signalerBase;
        this.dispatcherFitlers = new Cmds.Common.Helper.KeyValue<Dispatchers.IDispatcherFilter>()

        this.signaler = Network.SignalerFactory.create(params.factorySignaler, params.signalerBase, params.path);
        let pms: Dispatchers.IDispatcherConstructorParams = {
            instanceId: this.instanceId,
            signaler: this.signaler,
            isServer: false
        }
        this.dispatcher = Dispatchers.Dispatcher.getInstance(pms) 
        this.rooms = new Rooms(this.instanceId, this.dispatcher);   
        
        this.initEvents();        
    }    
    destroy() {
        this.unInitEvents();
        this.rooms.destroy();        
        this.dispatcher.destroy()
        this.signaler.destroy();
        this.dispatcherFitlers.destroy();        

        delete this.dispatcher;
        delete this.signaler;
        delete this.rooms;
        delete this.dispatcherFitlers;
        delete this.params;
        super.destroy();
    }
    initEvents() {
        this.eventRooter.setParent(this.dispatcher.eventRooter);        
        this.eventRooter.onBeforeRoot.add(this.onBeforeRoot);
        this.eventRooter.onAfterRoot.add(this.onAfterRoot);

        if (!this.params.notInitDispatcherFilters)
            this.initDispatcherFilters()
    }
    unInitEvents() {
        if (!this.params.notInitDispatcherFilters)
            this.unInitDispatcherFilters()      
        this.eventRooter.onBeforeRoot.remove(this.onBeforeRoot)              
        this.eventRooter.onAfterRoot.remove(this.onAfterRoot);
        this.eventRooter.setParent();
    }
    initDispatcherFilters() {
        // this.dispatcherFitlers.add(Dispatchers.InputClientFilter.name, new Dispatchers.InputClientFilter(this.dispatcher, "http://localhost:23670"))
        this.dispatcherFitlers.add(Dispatchers.ExtensionCaptureFilter.name, new Dispatchers.ExtensionCaptureFilter(this.dispatcher))
    }
    unInitDispatcherFilters() {
        this.dispatcherFitlers.keys().forEach(key => {
            let filter = this.dispatcherFitlers.get(key);
            this.dispatcherFitlers.del(key)
            filter.destroy();
        })
    }    

    onBeforeRoot = (cmd: Cmds.Common.ICommand): any => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;

        switch(cmdId) {
            case Cmds.ECommandId.adhoc_login:
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.Login.Connection.onBeforeRoot.resp(this, cmd as any) : null;
                break;
            default:
                break;
        }
    }
    onAfterRoot = (cmd: Cmds.Common.ICommand): any => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;

        switch(cmdId) {
            case Cmds.ECommandId.stream_webrtc_ongetconfig:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.StreamWebrtcGetConfig.Connection.onAfterRoot.req(this, cmd as any) : null;
                break;
            case Cmds.ECommandId.network_exception:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.Network.Exception.Connection.onAfterRoot.req(this, cmd as any) : null;
                break;                
            default:
                break;
        }
    }    

    login(user?: Cmds.IUser, namespace?: string, signalerBase?: string): Promise<any> {
        this.namespace = namespace || this.namespace;
        this.signalerBase = signalerBase || this.signalerBase;
        user = user || {id: null};
        let instanceId = this.instanceId;
        this.signaler.setUrl(this.getSignalerUrl(), this.params.path);
        let promise = Services.Cmds.Login.login(instanceId, user);
        return promise;
    }    
    
  // 重试登录
    _retryLoginStopped: boolean = false;
    _retryLoginTimer: any;
    _retryLoginPromiseResolve: Function;
    _retryLoginPromiseReject: Function;
    _retryLoginPromisePromose: Promise<any>;
    retryLogin(user?: Cmds.IUser, namespace?: string, signalerBase?: string, retryTimeout?: number, retryCount?: number): Promise<any> {        
        if (!!this._retryLoginPromisePromose) {
            return this._retryLoginPromisePromose;
        }

        this.stopRetryLogin();

        this._retryLoginStopped = false;
        retryTimeout = retryTimeout || 5000;
        retryCount = retryCount || -1;        
        
        this._retryLoginPromisePromose = new Promise((resolve, reject) => {
            this._retryLoginPromiseResolve = resolve;
            this._retryLoginPromiseReject = reject;
        })

        let _stoped = (): boolean =>  {
            return !this._retryLoginPromisePromose || !!this._retryLoginStopped || retryCount == 0;
        }
        let _complete = (result: boolean) => {
            this._retryLoginPromisePromose = null;
            this._retryLoginPromiseResolve && this._retryLoginPromiseResolve(result);
            this.stopRetryLogin();
        }

        let _delayLogin = () => {
            if (!_stoped()) {
                this._retryLoginTimer = setTimeout(() => {
                    this._retryLoginTimer = null;
                    _tryLogin();
                }, retryTimeout);
            } else {
                _complete(false);
            }            
        }

        let _tryLogin = () => {
            if (!_stoped()) {
                retryCount -= 1;
                this.login(user, namespace, signalerBase)
                .then(v => {
                    _complete(true)
                })
                .catch(e => {
                    console.error("login failed:", e);
                    console.log(`retry login after ${retryTimeout} milliseconds`);
                    this.signaler.disconnect();
                    _delayLogin();
                })
            } else {
                _complete(false);
            }
        }

        _tryLogin();
        return this._retryLoginPromisePromose;

    }

    stopRetryLogin() {
        this._retryLoginStopped = true;
        if (!!this._retryLoginTimer ) {
            this._retryLoginPromisePromose = null;
            clearTimeout(this._retryLoginTimer);
        }

        this._retryLoginTimer = null;        
        this._retryLoginPromiseResolve = null;
        this._retryLoginPromiseReject = null;        
    }
    isLogin(): boolean {
        let instanceId = this.instanceId;
        return Services.Cmds.Login.isLogin(instanceId);
    }
    logout(): Promise<any> {
        if (this.isLogin()) {
            let instanceId = this.instanceId;
            let promise = Services.Cmds.Logout.logout(instanceId);
            return promise;        
        } else {
            return Promise.resolve();
        }
    }

    connect(namespace?: string, signalerBase?: string): Promise<any> {
        this.namespace = namespace || this.namespace;
        this.signalerBase = signalerBase || this.signalerBase;
        this.signaler.setUrl(this.getSignalerUrl(), this.params.path);        
        return this.signaler.connect();
    }
    disconnect(){
        this.signaler.disconnect();
    }
    getSignalerUrl(): string {
        let base = this.signalerBase;
        base = base[base.length - 1] === '/' ? base.substr(0, base.length - 1) : base;
        let nsp = this.namespace;
        return base + '/' + nsp
    }
}