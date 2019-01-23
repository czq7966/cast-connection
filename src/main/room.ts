import { IBase, Base } from "./base";
import { IUser, User } from "./user";
import { Signaler, ISignalerMessage, ESignalerMessageType } from "./signaler";
import { ECustomEvents, IUserQuery } from "./client";
import { ERTCPeerEvents } from "./peer";
import { Streams } from "./streams";
import { KeyValue } from "./helper";
import * as Cmds from "./cmds";
import { IRooms, ERoomsEvents } from "./rooms";


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

export enum ERoomEvents {
    onDispatched_CommandLoginReq = 'onDispatched_CommandLoginReq',
    onDispatched_CommandLoginResp = 'onDispatched_CommandLoginResp'    
}

export class Room extends Cmds.Base {
    item: Cmds.IRoom;
    rooms: IRooms;
    users: KeyValue<User>;
    streams: Streams;

    constructor(rooms: IRooms, item: Cmds.IRoom) {
        super();
        this.rooms = rooms;
        this.item = Object.assign({}, item);
        this.users = new KeyValue();
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
        this.rooms.eventEmitter.addListener(ERoomsEvents.onDispatched_CommandLoginReq, this.onDispatched_CommandLoginReq)
        this.rooms.eventEmitter.addListener(ERoomsEvents.onDispatched_CommandLoginResp, this.onDispatched_CommandLoginResp)

        // this.eventEmitter.addListener(ECustomEvents.joinRoom, this.onJoinRoom);
        // this.eventEmitter.addListener(ECustomEvents.leaveRoom, this.onLeaveRoom);
        // this.eventEmitter.addListener(ECustomEvents.closeRoom, this.onCloseRoom);
        // this.eventEmitter.addListener(ECustomEvents.message, this.onMessage);

        // this.eventEmitter.addListener(ERTCPeerEvents.oniceconnectionstatechange, this.onIceConnectionStateChange);
        // this.eventEmitter.addListener(ERTCPeerEvents.onrecvstream, this.onRecvStream);        
    }
    unInitEvents() {
        this.rooms.eventEmitter.removeListener(ERoomsEvents.onDispatched_CommandLoginReq, this.onDispatched_CommandLoginReq)
        this.rooms.eventEmitter.removeListener(ERoomsEvents.onDispatched_CommandLoginResp, this.onDispatched_CommandLoginResp)

        // this.eventEmitter.removeListener(ECustomEvents.joinRoom, this.onJoinRoom)
        // this.eventEmitter.removeListener(ECustomEvents.leaveRoom, this.onLeaveRoom);
        // this.eventEmitter.removeListener(ECustomEvents.closeRoom, this.onCloseRoom);
        // this.eventEmitter.removeListener(ECustomEvents.message, this.onMessage)

        // this.eventEmitter.removeListener(ERTCPeerEvents.oniceconnectionstatechange, this.onIceConnectionStateChange);
        // this.eventEmitter.removeListener(ERTCPeerEvents.onrecvstream, this.onRecvStream);        
    }
    onDispatched_CommandLoginReq = (cmd: Cmds.CommandLoginReq) => {
        //belong to other room , return
        if (this.item.id !== cmd.data.props.user.room.id) {
            return;
        }

        let data = cmd.data;        
        let us = data.props.user;
        let user = this.getUser(us.id);
        if (!user) {
            user = this.getUser(us);
            this.eventEmitter.emit(ERoomEvents.onDispatched_CommandLoginReq, cmd);
        }
    }

    onDispatched_CommandLoginResp = (cmd: Cmds.CommandLoginResp) => {
        //belong to other room , return
        if (this.item.id !== cmd.data.props.user.room.id) {
            return;
        }

        let data = cmd.data;
        if (data.props.result){
            let us = data.props.user;
            let user = this.getUser(us.id);
            if (!user) {
                user = this.getUser(us);
                this.eventEmitter.emit(ERoomEvents.onDispatched_CommandLoginReq, cmd);
            }
        }
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