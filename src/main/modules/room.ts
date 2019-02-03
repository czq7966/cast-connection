
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
    rooms: IRooms;
    users: Cmds.Common.Helper.KeyValue<IUser>;
    eventRooter: Cmds.Common.IEventRooter
    getUser(user: Cmds.IUser | string): IUser
    delUser(id: string)
    clearUser()    
    me(): IUser
    owner(): IUser
}

export class Room extends Cmds.Common.CommandDispatcher implements IRoom {
    item: Cmds.IRoom;
    rooms: IRooms;
    users: Cmds.Common.Helper.KeyValue<IUser>;
    eventRooter: Cmds.Common.IEventRooter

    constructor(rooms: IRooms, item: Cmds.IRoom) {
        super(rooms.instanceId);
        this.rooms = rooms;
        this.item = Object.assign({}, item);
        this.users = new Cmds.Common.Helper.KeyValue();
        this.eventRooter = new Cmds.Common.EventRooter(this.rooms.eventRooter)
        this.initEvents();
    }
    destroy() {                
        this.unInitEvents();   
        this.users.clear();
        this.users.destroy();
        this.eventRooter.destroy();
        delete this.item;
        delete this.users;
        delete this.eventRooter;
        super.destroy();
    }

    initEvents() {
        this.rooms.eventEmitter.addListener(Cmds.ECommandDispatchEvents.onDispatched, this.Command_onDispatched);
        this.rooms.eventEmitter.addListener(Cmds.ECommandDispatchEvents.onBeforeDispatched, this.Command_onBeforeDispatched);


        // this.eventEmitter.addListener(ECustomEvents.joinRoom, this.onJoinRoom);
        // this.eventEmitter.addListener(ECustomEvents.leaveRoom, this.onLeaveRoom);
        // this.eventEmitter.addListener(ECustomEvents.closeRoom, this.onCloseRoom);
        // this.eventEmitter.addListener(ECustomEvents.message, this.onMessage);

        // this.eventEmitter.addListener(ERTCPeerEvents.oniceconnectionstatechange, this.onIceConnectionStateChange);
        // this.eventEmitter.addListener(ERTCPeerEvents.onrecvstream, this.onRecvStream);        
    }
    unInitEvents() {
        this.rooms.eventEmitter.removeListener(Cmds.ECommandDispatchEvents.onDispatched, this.Command_onDispatched)
        this.rooms.eventEmitter.removeListener(Cmds.ECommandDispatchEvents.onBeforeDispatched, this.Command_onBeforeDispatched)


        // this.eventEmitter.removeListener(ECustomEvents.joinRoom, this.onJoinRoom)
        // this.eventEmitter.removeListener(ECustomEvents.leaveRoom, this.onLeaveRoom);
        // this.eventEmitter.removeListener(ECustomEvents.closeRoom, this.onCloseRoom);
        // this.eventEmitter.removeListener(ECustomEvents.message, this.onMessage)

        // this.eventEmitter.removeListener(ERTCPeerEvents.oniceconnectionstatechange, this.onIceConnectionStateChange);
        // this.eventEmitter.removeListener(ERTCPeerEvents.onrecvstream, this.onRecvStream);        
    }

    // Command
    onCommand_Dispatched = (cmd: Cmds.Common.ICommand) => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.adhoc_login:
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.Login.Room.onDispatched.resp(this, cmd as any) : null;
                break;
            case Cmds.ECommandId.adhoc_hello:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.Hello.Room.onDispatched.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.Hello.Room.onDispatched.resp(this, cmd as any) : null;
                break;
            case Cmds.ECommandId.room_open:
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomOpen.Room.onDispatched.resp(this, cmd as any) : null
                break;
            case Cmds.ECommandId.room_join:
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomJoin.Room.onDispatched.resp(this, cmd as any) : null                    
                break;
            case Cmds.ECommandId.room_hello:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.RoomHello.Room.onDispatched.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomHello.Room.onDispatched.resp(this, cmd as any) : null;
                break;   
            case Cmds.ECommandId.stream_room_hello:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.StreamRoomHello.Room.onDispatched.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.StreamRoomHello.Room.onDispatched.resp(this, cmd as any) : null;
                break;                               
            default:
                break;
        }
    }
    onCommand_BeforeDispatched = (cmd: Cmds.Common.ICommand) => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.adhoc_logout:
                    Services.Cmds.Logout.Room.onBeforeDispatched.req(this, cmd as any);
                break;
            case Cmds.ECommandId.network_disconnect: 
                    Services.Cmds.Network.Disconnect.Room.onBeforeDispatched.req(this, cmd as any);
                break;
            case Cmds.ECommandId.room_close:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.RoomClose.Room.onBeforeDispatched.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomClose.Room.onBeforeDispatched.resp(this, cmd as any) : null     
                break;   
            case Cmds.ECommandId.room_leave:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.RoomLeave.Room.onBeforeDispatched.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomLeave.Room.onBeforeDispatched.resp(this, cmd as any) : null    
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
    owner(): IUser {
        let user: IUser
        this.users.keys().some(key => {
            let _user = this.users.get(key);
            if (Cmds.Common.Helper.StateMachine.isset(user.item.states, Cmds.EUserState.roomOwner)) {
                user = _user;
                return true;
            }
        })
        return user;
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