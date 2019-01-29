
import { Streams } from "./streams";
import { IRooms } from "./rooms";
import * as Cmds from "../cmds";
import * as Services from '../services'
import * as Network from '../network'
import { User, IUser } from "./user";



export enum ERoomEvents {
    onadduser = 'onadduser',
    ondeluser = 'ondeluser'
}
export interface IRoomParams {
    roomid: string
    password: string
    max?: number
    Signaler?: Network.Signaler
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

export interface IRoom extends Cmds.Common.IBase {
    item: Cmds.IRoom;
    users: Cmds.Common.Helper.KeyValue<IUser>;
    getUser(user: Cmds.IUser | string): IUser
    delUser(id: string)
    me(): IUser
    clearUser()
}

export class Room extends Cmds.Common.Base implements IRoom {
    item: Cmds.IRoom;
    rooms: IRooms;
    users: Cmds.Common.Helper.KeyValue<IUser>;
    streams: Streams;

    constructor(rooms: IRooms, item: Cmds.IRoom) {
        super();
        this.rooms = rooms;
        this.item = Object.assign({}, item);
        this.users = new Cmds.Common.Helper.KeyValue();
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
        this.rooms.eventEmitter.addListener(Cmds.ECommandEvents.onDispatched, this.onDispatched_Command);
        this.rooms.eventEmitter.addListener(Cmds.ECommandEvents.onBeforeDispatched, this.onBeforeDispatched_Command);


        // this.eventEmitter.addListener(ECustomEvents.joinRoom, this.onJoinRoom);
        // this.eventEmitter.addListener(ECustomEvents.leaveRoom, this.onLeaveRoom);
        // this.eventEmitter.addListener(ECustomEvents.closeRoom, this.onCloseRoom);
        // this.eventEmitter.addListener(ECustomEvents.message, this.onMessage);

        // this.eventEmitter.addListener(ERTCPeerEvents.oniceconnectionstatechange, this.onIceConnectionStateChange);
        // this.eventEmitter.addListener(ERTCPeerEvents.onrecvstream, this.onRecvStream);        
    }
    unInitEvents() {
        this.rooms.eventEmitter.removeListener(Cmds.ECommandEvents.onDispatched, this.onDispatched_Command)
        this.rooms.eventEmitter.removeListener(Cmds.ECommandEvents.onBeforeDispatched, this.onBeforeDispatched_Command)


        // this.eventEmitter.removeListener(ECustomEvents.joinRoom, this.onJoinRoom)
        // this.eventEmitter.removeListener(ECustomEvents.leaveRoom, this.onLeaveRoom);
        // this.eventEmitter.removeListener(ECustomEvents.closeRoom, this.onCloseRoom);
        // this.eventEmitter.removeListener(ECustomEvents.message, this.onMessage)

        // this.eventEmitter.removeListener(ERTCPeerEvents.oniceconnectionstatechange, this.onIceConnectionStateChange);
        // this.eventEmitter.removeListener(ERTCPeerEvents.onrecvstream, this.onRecvStream);        
    }

    // Command
    onDispatched_Command = (cmd: Cmds.Common.ICommand) => {
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
            case Cmds.ECommandId.room_open:
                type === Cmds.ECommandType.resp ?
                    Services.ServiceRoomOpen.Room.onDispatched.resp(this, cmd as any) : null
                break;
            case Cmds.ECommandId.room_join:
                type === Cmds.ECommandType.resp ?
                    Services.ServiceRoomJoin.Room.onDispatched.resp(this, cmd as any) : null                    
                break;
            case Cmds.ECommandId.room_hello:
                type === Cmds.ECommandType.req ?
                    Services.ServiceRoomHello.Room.onDispatched.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.ServiceRoomHello.Room.onDispatched.resp(this, cmd as any) : null;
                break;                
            default:
                break;
        }
        cmd.preventDefault !== true && this.eventEmitter.emit(Cmds.ECommandEvents.onDispatched, cmd);
    }
    onBeforeDispatched_Command = (cmd: Cmds.Common.ICommand) => {
        this.eventEmitter.emit(Cmds.ECommandEvents.onBeforeDispatched, cmd);
        if (cmd.preventDefault === true) return;

        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.adhoc_logout:
                    Services.ServiceLogout.Room.onBeforeDispatched.req(this, cmd as any);
                break;
            case Cmds.ECommandId.network_disconnect: 
                    Services.ServiceNetwork.Disconnect.Room.onBeforeDispatched.req(this, cmd as any);
                break;
            case Cmds.ECommandId.room_close:
                type === Cmds.ECommandType.req ?
                    Services.ServiceRoomClose.Room.onBeforeDispatched.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.ServiceRoomClose.Room.onBeforeDispatched.resp(this, cmd as any) : null     
                break;   
            case Cmds.ECommandId.room_leave:
                type === Cmds.ECommandType.req ?
                    Services.ServiceRoomLeave.Room.onBeforeDispatched.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.ServiceRoomLeave.Room.onBeforeDispatched.resp(this, cmd as any) : null    
                break;                              
            default:
                break;
        }        
    }    


    // User
    me(): IUser {
        let currUser = Cmds.CommandLoginResp.getInstance<Cmds.CommandLoginResp>(this.rooms.dispatcher.instanceId).data.props.user;
        if (currUser) {
            return this.getUser(currUser.id)
        }
    }
    getUser(user: Cmds.IUser | string) {
        if (typeof user === 'string') {
            return this.users.get(user);
        } else {
            if (user && user.id) {
                let usObj =this.getUser(user.id);
                if (!usObj) {
                    usObj = new User(this, user);
                    this.users.add(user.id, usObj);
                }
                return usObj;
            }
        }
    }    
    removeUser(id: string): IUser {
        return this.users.del(id)
    }
    delUser(id: string) {
        let user = this.users.del(id);
        user && user.destroy();        
    }
    clearUser() {
        this.users.keys().forEach(key => {
            this.delUser(key)
        });
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