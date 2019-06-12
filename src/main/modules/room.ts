
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
    Signaler?: Network.ISignaler
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
    subEventRooter: Cmds.Common.IEventRooter
    getParent(): IRoom
    getUser(user: Cmds.IUser | string): IUser
    getUserBySid(sid: string, isRegex?: boolean): IUser
    delUser(id: string)
    clearUser()    
    me(): IUser
    owner(): IUser
}

export class Room extends Cmds.Common.CommandRooter implements IRoom {
    item: Cmds.IRoom;
    rooms: IRooms;
    users: Cmds.Common.Helper.KeyValue<IUser>;
    subEventRooter: Cmds.Common.IEventRooter;

    constructor(rooms: IRooms, item: Cmds.IRoom) {
        super(rooms.instanceId);
        this.rooms = rooms;
        this.item = Object.assign({}, item);
        this.users = new Cmds.Common.Helper.KeyValue();
        this.subEventRooter = new Cmds.Common.EventRooter();
        this.eventRooter.eventEmitter.setMaxListeners(61);
        this.initEvents();
    }
    destroy() {                
        this.unInitEvents();   
        this.users.clear();
        this.users.destroy();
        delete this.item;
        delete this.users;
        super.destroy();
    }

    initEvents() {
        this.subEventRooter.setParent(this.eventRooter);
        this.eventRooter.setParent(this.rooms.eventRooter);        
        this.eventRooter.onPreventRoot.add(this.onPreventRoot)
        this.eventRooter.onBeforeRoot.add(this.onBeforeRoot)
        this.eventRooter.onAfterRoot.add(this.onAfterRoot)
    }
    unInitEvents() {
        this.eventRooter.onPreventRoot.remove(this.onPreventRoot)
        this.eventRooter.onBeforeRoot.remove(this.onBeforeRoot)
        this.eventRooter.onAfterRoot.remove(this.onAfterRoot)
        this.eventRooter.setParent();   
        this.subEventRooter.setParent();     
    }

    // Command

    onPreventRoot = (cmd: Cmds.Common.ICommand): any => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.adhoc_logout:
            case Cmds.ECommandId.network_disconnect:            
                break;
            default:
                let user = cmd.data.props.user as Cmds.IUser;            
                if (user && user.room && user.room.id.indexOf(this.item.id) !== 0 ) {
                    return Cmds.Common.EEventEmitterEmit2Result.preventRoot;                    
                }            
                break;            
        }


    }

    onBeforeRoot = (cmd: Cmds.Common.ICommand): any => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            default:
                let user = cmd.data.props.user as Cmds.IUser;            
                if (user && user.room && user.room.id !== this.item.id)
                    return;
                break;
        }

        switch(cmdId) {
            case Cmds.ECommandId.adhoc_login:
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.Login.Room.onBeforeRoot.resp(this, cmd as any) : null;
                break;
            case Cmds.ECommandId.adhoc_hello:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.Hello.Room.onBeforeRoot.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.Hello.Room.onBeforeRoot.resp(this, cmd as any) : null;
                break;
            case Cmds.ECommandId.room_open:
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomOpen.Room.onBeforeRoot.resp(this, cmd as any) : null
                break;
            case Cmds.ECommandId.room_join:
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomJoin.Room.onBeforeRoot.resp(this, cmd as any) : null                    
                break;
            case Cmds.ECommandId.room_hello:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.RoomHello.Room.onBeforeRoot.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomHello.Room.onBeforeRoot.resp(this, cmd as any) : null;
                break;   
            case Cmds.ECommandId.stream_room_hello:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.StreamRoomHello.Room.onBeforeRoot.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.StreamRoomHello.Room.onBeforeRoot.resp(this, cmd as any) : null;
                break;                               
            default:
                break;
        }
    }

    onAfterRoot = (cmd: Cmds.Common.ICommand): any => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;

        switch(cmdId) {
            case Cmds.ECommandId.adhoc_logout:
            case Cmds.ECommandId.network_disconnect:  
                break;
            default:
                let user = cmd.data.props.user as Cmds.IUser;            
                if (user && user.room && user.room.id !== this.item.id)
                    return;
                break;
        }

        switch(cmdId) {
            case Cmds.ECommandId.adhoc_logout:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.Logout.Room.onAfterRoot.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?            
                    Services.Cmds.Logout.Room.onAfterRoot.resp(this, cmd as any) : null
                break; 
            case Cmds.ECommandId.network_disconnect: 
                    Services.Cmds.Network.Disconnect.Room.onAfterRoot.req(this, cmd as any);
                break;
            case Cmds.ECommandId.room_close:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.RoomClose.Room.onAfterRoot.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomClose.Room.onAfterRoot.resp(this, cmd as any) : null     
                break;   
            case Cmds.ECommandId.room_leave:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.RoomLeave.Room.onAfterRoot.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomLeave.Room.onAfterRoot.resp(this, cmd as any) : null    
                break;                              
            default:
                break;
        }        
    }    

    // Room
    getParent(): IRoom {
        return Services.Modules.Room.getParent(this)
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
            if (Cmds.Common.Helper.StateMachine.isset(_user.item.states, Cmds.EUserState.roomOwner)) {
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
    getUserBySid(sid: string, isRegex?: boolean): IUser {
        let result: IUser;
        let regEx = new RegExp(sid, 'g');
        this.users.values().some(user => {
            if (user.item.sid == sid || isRegex && regEx.test(user.item.sid)) {
                result = user;
                return true;    
            }
        });        
        return result;
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
}