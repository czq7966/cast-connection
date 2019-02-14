import * as Network from '../network'
import * as Services from '../services'
import * as Cmds from "../cmds/index";
import { Rooms } from './rooms';

export interface IConnectionConstructorParams extends Cmds.Common.IBaseConstructorParams {
    url: string
}
export class Connection extends Cmds.Common.Base {    
    signaler: Network.Signaler;
    rooms: Rooms;
    dispatcher: Services.Dispatcher
    stream: MediaStream;
    constructor(params: IConnectionConstructorParams) {
        super(params);
        this.instanceId = this.instanceId || Cmds.Common.Helper.uuid();

        this.signaler = new Network.Signaler(params.url);
        
        let pms: Services.IDispatcherConstructorParams = {
            instanceId: this.instanceId,
            signaler: this.signaler,
        }
        this.dispatcher = Services.Dispatcher.getInstance(pms) 
        this.rooms = new Rooms(this.instanceId, this.dispatcher);        
        this.initEvents();
    }    
    destroy() {
        this.unInitEvents();
        this.signaler.destroy();
        this.rooms.destroy();
        delete this.signaler;
        delete this.rooms;
        super.destroy();
    }
    initEvents() {

    }
    unInitEvents() {
    }

    login(): Promise<any> {
        let instanceId = this.instanceId;
        let promise = Services.Cmds.Login.login(instanceId, {id: Cmds.Common.Helper.uuid()});
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

    //temp
    joinRoom(query: any): Promise<any> {
        return;
    }    
    close(){}

}