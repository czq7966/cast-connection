import * as Network from '../network'
import * as Services from '../services'
import * as Cmds from "../cmds/index";
import * as Dispatchers from './dispatchers'
import { Rooms } from './rooms';

export interface IConnectionConstructorParams extends Cmds.Common.IBaseConstructorParams {
    url: string
}
export class Connection extends Cmds.Common.Base {    
    signaler: Network.Signaler;
    rooms: Rooms;
    dispatcher: Dispatchers.Dispatcher
    inputClient: Dispatchers.InputClientFilter
    extensionCapture: Dispatchers.ExtensionCaptureFilter;

    constructor(params: IConnectionConstructorParams) {
        super(params);
        this.instanceId = this.instanceId || Cmds.Common.Helper.uuid();

        this.signaler = new Network.Signaler(params.url);
        
        let pms: Dispatchers.IDispatcherConstructorParams = {
            instanceId: this.instanceId,
            signaler: this.signaler,
        }
        this.dispatcher = Dispatchers.Dispatcher.getInstance(pms) 
        this.rooms = new Rooms(this.instanceId, this.dispatcher);     
        
        this.inputClient = new Dispatchers.InputClientFilter({
            instanceId: this.instanceId,
            url: 'http://localhost:23670'
        }, this.dispatcher);

        this.extensionCapture = new Dispatchers.ExtensionCaptureFilter(this.instanceId, this.dispatcher)

        this.initEvents();
    }    
    destroy() {
        this.unInitEvents();
        this.extensionCapture.destroy();
        this.inputClient.destroy();
        this.signaler.destroy();
        this.rooms.destroy();        
        delete this.signaler;
        delete this.rooms;
        delete this.inputClient;
        delete this.extensionCapture;
        super.destroy();
    }
    initEvents() {

    }
    unInitEvents() {
    }

    login(user?: Cmds.IUser, url?: string): Promise<any> {
        user = user || {id: null};
        let instanceId = this.instanceId;
        url && (this.signaler.url = url)
        let promise = Services.Cmds.Login.login(instanceId, user);
        return promise;
    }       
    isLogin() {
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

    disconnect(){
        this.signaler.disconnect();
    }

}