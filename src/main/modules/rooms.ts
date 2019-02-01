import { IRoom, Room } from "./room";
import * as Cmds from "../cmds";
import * as Services from '../services'


export interface IRooms extends Cmds.Common.IBase {
    items: Cmds.Common.Helper.KeyValue<IRoom>;
    dispatcher: Services.IDispatcher;  
    getRoom(room: Cmds.IRoom | string): IRoom;
    removeRoom(roomid: string): IRoom;
    delRoom(roomid: string);
    existRoom(roomid: string): boolean
    clearRoom();
}

export class Rooms extends Cmds.Common.CommandDispatcher implements IRooms {
    items: Cmds.Common.Helper.KeyValue<IRoom>;
    dispatcher: Services.IDispatcher;

    constructor(instanceId: string, dispatcher?:Services. IDispatcher ) {
        super(instanceId);
        this.dispatcher = dispatcher || Services.Dispatcher.getInstance(instanceId);
        this.items = new Cmds.Common.Helper.KeyValue();
        this.initEvents();
    }
    destroy() {
        this.unInitEvents();
        this.items.clear();
        delete this.items;
        delete this.dispatcher;
        super.destroy();
    }

    initEvents() {
        this.dispatcher.eventEmitter.addListener(Cmds.ECommandDispatchEvents.onDispatched, this.Command_onDispatched)
        this.dispatcher.eventEmitter.addListener(Cmds.ECommandDispatchEvents.onBeforeDispatched, this.Command_onBeforeDispatched)
    }
    unInitEvents() {
        this.dispatcher.eventEmitter.removeListener(Cmds.ECommandDispatchEvents.onDispatched, this.Command_onDispatched);
        this.dispatcher.eventEmitter.removeListener(Cmds.ECommandDispatchEvents.onBeforeDispatched, this.Command_onBeforeDispatched)
    }

    onCommand_Dispatched = (cmd: Cmds.Common.ICommand) => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.adhoc_login:
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.Login.Rooms.onDispatched.resp(this, cmd as any) : null
                break;
            // case Cmds.ECommandId.adhoc_hello:
            //     type === Cmds.ECommandType.req ?
            //         Services.Cmds.Hello.Rooms.onDispatched.req(this, cmd as any) :
            //     type === Cmds.ECommandType.resp ?
            //         Services.Cmds.Hello.Rooms.onDispatched.resp(this, cmd as any) : null
            //     break;
            case Cmds.ECommandId.room_open: 
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomOpen.Rooms.onDispatched.resp(this, cmd as any) : null
                break;
            case Cmds.ECommandId.room_join: 
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomJoin.Rooms.onDispatched.resp(this, cmd as any) : null                    
                break;
            default:
                break;
        }
    }

    onCommand_BeforeDispatched = (cmd: Cmds.Common.ICommand) => {
        // cmd.preventDefault = false;
        // this.eventEmitter.emit(Cmds.ECommandDispatchEvents.onBeforeDispatched, cmd);
        // if (!!cmd.preventDefault === true) return;

        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;

        switch(cmdId) {
            case Cmds.ECommandId.adhoc_logout:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.Logout.Rooms.onBeforeDispatched.req(this, cmd as any) : null
                break;
            case Cmds.ECommandId.network_disconnect: 
                Services.Cmds.Network.Disconnect.Rooms.onBeforeDispatched.req(this, cmd as any);
                break;     
            case Cmds.ECommandId.room_close:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.RoomClose.Rooms.onBeforeDispatched.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomClose.Rooms.onBeforeDispatched.resp(this, cmd as any) : null    
                break;   
            case Cmds.ECommandId.room_leave:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.RoomLeave.Rooms.onBeforeDispatched.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomLeave.Rooms.onBeforeDispatched.resp(this, cmd as any) : null    
                break;                                             
            default:
                break;
        }        
    }    

    // Room
    getRoom(room: Cmds.IRoom | string) {
        if (typeof room === 'string') {
            return this.items.get(room)            
        } else {
            if (room && room.id) {
                let rm =this.getRoom(room.id);
                if (!rm) {
                    rm = new Room(this, room);
                    this.items.add(room.id, rm);
                }
                return rm;
            }
        }
    }
    delRoom(roomid: string){
        let room = this.items.del(roomid);
        if (room) {
            room.destroy();
            room = null;
        }
    }
    removeRoom(roomid: string): IRoom {
        return this.items.del(roomid); 
    }
    existRoom(roomid: string): boolean {
        return this.items.exist(roomid);
    }
    clearRoom() {
        this.items.keys().forEach(key => {
            this.delRoom(key)
        });
    }    


    // userCount(): number {
    //     let result = 0;
    //     Object.keys(this.rooms).forEach(roomid => {
    //         let room = this.getRoom(roomid)
    //         result = result + room.userCount();
    //     })
    //     return result;
    // }


    // onCloseRoom = (query: IUserQuery) => {
    //     this.delRoom(query.roomid);
    // }
    // newRoom(roomid: string, password?: string): Room {
    //     if (roomid) {
    //         let room = new Room({roomid: roomid, password: password});
    //         room.signaler = this.signaler;
    //         this.rooms[roomid] = room;
    //         this.eventEmitter.emit(ERoomsEvents.onnewroom, room)
    //         return room;
    //     }
    // }
    // getRoom(roomid: string): Room {
    //     return this.rooms[roomid];
    // }
    // delRoom(roomid: string) {
    //     let room = this.rooms[roomid];
    //     room && room.destroy();
    //     delete this.rooms[roomid];
    // }
    // close() {
    //     Object.keys(this.rooms).forEach(key => {
    //         this.rooms[key].close();
    //     })       
    // }



}