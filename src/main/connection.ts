import * as Network from './network'
import * as Services from './services'
import * as Cmds from "./cmds/index";
import * as Modules from './modules'

// import { uuid } from "./helper";

export class Connection extends Cmds.Common.Base {    
    signaler: Network.Signaler;
    rooms: Modules.Rooms;
    dispatcher: Services.Dispatcher
    stream: MediaStream;
    constructor(url: string, instanceId?: string) {
        super()
        this.signaler = new Network.Signaler(url);
        this.instanceId = instanceId || Cmds.Common.Helper.uuid();
        let params: Services.IDispatcherConstructorParams = {
            instanceId: this.instanceId,
            signaler: this.signaler,
        }
        this.dispatcher = Services.Dispatcher.getInstance(params) 
        this.rooms = new Modules.Rooms(this.instanceId);        
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
        // this.signaler.eventEmitter.addListener(Dts.EClientSocketEvents.disconnect, this.onDisconnect)
        // this.rooms.eventEmitter.addListener(ECustomEvents.closeRoom, this.onCloseRoom)

    }
    unInitEvents() {
        // this.rooms.eventEmitter.removeListener(ECustomEvents.closeRoom, this.onCloseRoom)
        // this.signaler.eventEmitter.removeListener(Dts.EClientSocketEvents.disconnect, this.onDisconnect)
    }
    login(): Promise<any> {
        let instanceId = this.instanceId;
        let promise = Services.ServiceLogin.login(instanceId);
        promise.then(() => {
            Services.ServiceHello.sayHello(instanceId);
        })
        return promise;
    }    
    isLogin() {
        let instanceId = this.instanceId;
        return Services.ServiceLogin.isLogin(instanceId);
    }
    logout(): Promise<any> {
        let instanceId = this.instanceId;
        let promise = Services.ServiceLogout.logout(instanceId);
        return promise;        
    }
    // id(): string {
    //     return this.signaler && this.signaler.id();
    // }

    // openRoom(query: IUserQuery, url?: string): Promise<any> {
    //     let promise =  this.signaler.openRoom(query, url);
    //     promise.then((result) => {
    //         query = result;
    //         let room = this.rooms.newRoom(query.roomid, query.password);
    //         let user = new User({ 
    //             socketId: this.signaler.id(),
    //             isOwner: true,
    //             signaler: this.signaler
    //         });
    //         room.addUser(user);
    //     })
    //     return promise;
    // }
    joinRoom(query: any): Promise<any> {
        return;
    }
    // joinRoom(query: IUserQuery): Promise<any> {
    //     let promise =  this.signaler.joinRoom(query);
    //     promise.then(() => {
    //         let room = this.rooms.newRoom(query.roomid, query.password);
    //         let user = new User({ 
    //             socketId: this.signaler.id(),
    //             isOwner: false
    //         });
    //         room.addUser(user);
    //         user.imReady();
    //     })
    //     .catch((err) => {

    //     })
    //     return promise;        
    // }         
    // leaveRoom(query: IUserQuery): Promise<any> {
    //     let promise =  this.signaler.leaveRoom(query);
    //     promise.then(() => {
    //         this.rooms.delRoom(query.roomid);
    //     })
    //     return promise;          
    // }    
    
    // onDisconnect = (reason) => {
    //     this.eventEmitter.emit(Dts.EClientSocketEvents.disconnect, reason)
    // }
    // onCloseRoom = () => {
    //     if (this.rooms.count() <= 0) {
    //         this.signaler.disconnect();            
    //     }
    // }
    // close() {
    //     this.rooms.close();
    //     this.signaler.disconnect();        
    // }    
    close() {

    }   
}