import { IBase, Base } from "./base";
import { IUser, User } from "./user";
import { Signaler } from "./signaler";
import { ECustomEvents, IUserQuery } from "./client";
import { ERTCPeerEvents } from "./peer";
import { Streams } from "./streams";
import { IRooms } from "./rooms";
import { EClientSocketEvents } from "./declare";
import * as Cmds from "./cmds";
import * as Services from './services'



export enum ERoomEvents {
    onadduser = 'onadduser',
    ondeluser = 'ondeluser'
}
export interface IRoomParams {
    roomid: string
    password: string
    max?: number
    Signaler?: Signaler
}
// export interface IRoom extends IBase, IRoomParams {
//     users: {[id: string]: IUser}
//     streams: Streams;    
//     getOwner():IUser
//     isOwner(socketId: string): boolean
//     addUser(user: IUser): IUser
//     delUser(socketId: string)
//     currUser(): IUser
//     addSendStream(stream: MediaStream, user?: IUser)
// }

export interface IRoom extends Cmds.IBase {
    item: Cmds.IRoom;
    users: Cmds.Helper.KeyValue<User>;
    getUser(user: Cmds.IUser | string): IUser

}

export class Room extends Cmds.Base implements IRoom {
    item: Cmds.IRoom;
    rooms: IRooms;
    users: Cmds.Helper.KeyValue<User>;
    streams: Streams;

    constructor(rooms: IRooms, item: Cmds.IRoom) {
        super();
        this.rooms = rooms;
        this.item = Object.assign({}, item);
        this.users = new Cmds.Helper.KeyValue();
        this.streams = new Streams(this);             
        this.initEvents();
    }
    destroy() {                
        this.unInitEvents();   
        this.users.clear();
        this.users.destroy();
        this.streams.destroy();
        delete this.item;
        delete this.users;
        delete this.streams;
        super.destroy();
    }

    initEvents() {
        this.rooms.eventEmitter.addListener(Cmds.ECommandEvents.onDispatched, this.onDispatched_Command)
        this.rooms.eventEmitter.addListener(EClientSocketEvents.disconnect, this.onNetwork_Disconnect);     

        // this.eventEmitter.addListener(ECustomEvents.joinRoom, this.onJoinRoom);
        // this.eventEmitter.addListener(ECustomEvents.leaveRoom, this.onLeaveRoom);
        // this.eventEmitter.addListener(ECustomEvents.closeRoom, this.onCloseRoom);
        // this.eventEmitter.addListener(ECustomEvents.message, this.onMessage);

        // this.eventEmitter.addListener(ERTCPeerEvents.oniceconnectionstatechange, this.onIceConnectionStateChange);
        // this.eventEmitter.addListener(ERTCPeerEvents.onrecvstream, this.onRecvStream);        
    }
    unInitEvents() {
        this.rooms.eventEmitter.removeListener(Cmds.ECommandEvents.onDispatched, this.onDispatched_Command)
        this.rooms.eventEmitter.removeListener(EClientSocketEvents.disconnect, this.onNetwork_Disconnect);     


        // this.eventEmitter.removeListener(ECustomEvents.joinRoom, this.onJoinRoom)
        // this.eventEmitter.removeListener(ECustomEvents.leaveRoom, this.onLeaveRoom);
        // this.eventEmitter.removeListener(ECustomEvents.closeRoom, this.onCloseRoom);
        // this.eventEmitter.removeListener(ECustomEvents.message, this.onMessage)

        // this.eventEmitter.removeListener(ERTCPeerEvents.oniceconnectionstatechange, this.onIceConnectionStateChange);
        // this.eventEmitter.removeListener(ERTCPeerEvents.onrecvstream, this.onRecvStream);        
    }

    // Command
    onDispatched_Command = (cmd: Cmds.ICommand) => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.adhoc_login:
                type === Cmds.ECommandType.resp ?
                    Services.ServiceLogin.Room.onDispatched.resp(this, cmd as any) : null;
                break;
            case Cmds.ECommandId.adhoc_hello:
                type === Cmds.ECommandType.req ?
                    Services.ServiceHello.Room.onDispatched.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.ServiceHello.Room.onDispatched.resp(this, cmd as any) : null;
                break;
            case Cmds.ECommandId.adhoc_logout:
                type === Cmds.ECommandType.req ?
                    Services.ServiceLogout.Room.onDispatched.req(this, cmd as any) : null
            default:
                break;
        }
        this.eventEmitter.emit(Cmds.ECommandEvents.onDispatched, cmd);
    }

    // Network
    onNetwork_Disconnect = () => {
        this.eventEmitter.emit(EClientSocketEvents.disconnect);
    }

    // User
    getUser(user: Cmds.IUser | string) {
        if (typeof user === 'string') {
            return this.users.get(user);
        } else {
            if (user && user.id) {
                let us =this.getUser(user.id);
                if (!us) {
                    us = new User(this, us);
                    this.users.add(user.id, us);
                }
                return us;
            }
        }
    }    
    // onJoinRoom = (query: IUserQuery) => {
    //     if (!this.users[query.from]) {
    //         let user = new User({
    //             socketId: query.from,
    //             isOwner: query.isOwner
    //         })
    //         this.addUser(user);
    //         this.currUser().sayHello(user.socketId);
    //     }
    // }
    // onLeaveRoom = (query: IUserQuery) => {
    //     this.delUser(query.from);
    // }
    // onCloseRoom = (query: IUserQuery) => {
        
    // }
    // onMessage = (query: IUserQuery) => {
    //     let msg = query.msg as ISignalerMessage;
    //     let user = this.getUser(query.from);
    //     switch(msg.type) {
    //         case ESignalerMessageType.hello:
    //             if (!user) {
    //                 user = new User({
    //                     socketId: query.from,
    //                     isOwner: query.isOwner
    //                 })
    //                 this.addUser(user); 
    //             }
    //             break;
    //         default:                
    //             break;
    //     }
    //     user && user.eventEmitter.emit(ECustomEvents.message, query);        
    // }
    // onRecvStream = (stream: MediaStream, user: IUser) => {
    //     this.streams.addRecvStream(stream);
    // }
    // onIceConnectionStateChange = (ev: RTCTrackEvent, user: IUser) => {
    //     // this.eventEmitter.emit(ERTCPeerEvents.oniceconnectionstatechange, ev, user);
    // }    

    // getOwner():IUser {
    //     let user: IUser
    //     Object.keys(this.users).some(key => {
    //         if (this.users[key].isOwner) {
    //             user = this.users[key];
    //             return true;
    //         }
    //     })
    //     return user;
    // }
    // isOwner(socketId: string): boolean {
    //     return this.users[socketId] && this.users[socketId].isOwner;        
    // }
    // addUser(user: IUser): IUser {
    //     if (user && user.socketId) {
    //         user.room = this;
    //         user.signaler = user.signaler || this.signaler;
    //         this.users[user.socketId] = user;
    //         this.eventEmitter.emit(ERoomEvents.onadduser, user)

    //         return this.users[user.socketId]
    //     }
    // }
    // delUser(socketId: string) {
    //     let user = this.users[socketId];
    //     if (user) {
    //         delete this.users[socketId];
    //         this.eventEmitter.emit(ERoomEvents.ondeluser, user)
    //         user.destroy();            
    //     }        
    // }
    // clearUsers() {
    //     Object.keys(this.users).forEach(key => {
    //         this.delUser(key)
    //     })
    // }
    // getUser(socketId: string) {
    //     return this.users[socketId];
    // }
    // getUsers(): Array<IUser> {
    //     let result = [];
    //     Object.keys(this.users).forEach(id => {
    //         result.push(this.users[id])
    //     })
    //     return result;
    // }
    // currUser(): IUser {
    //     return this.getUser(this.signaler.id());
    // }
    // addSendStream(stream: MediaStream, user?: IUser) {    
    //     if (stream) {
    //         if (!this.streams.getSendStream(stream.id)) {
    //             this.streams.addSendStream(stream);
    //         }
    //     }
    //     this.sendStreamsToUser();  
    // }
    // sendStreamsToUser(user?: IUser) {
    //     let streams = this.streams.getSendStreams();
    //     if (user) {
    //         user.addSendStreams(streams)
    //     } else {
    //         this.getUsers().forEach(user => {
    //             user.addSendStreams(streams)
    //         })            
    //     }
    // }
    // close() {
    //     Object.keys(this.users).forEach(key => {
    //         this.users[key].close();
    //     })      
    // }    
    // userCount(): number {
    //     return this.getUsers().length;
    // }
}