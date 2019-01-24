import { Room } from "./room";
import * as Cmds from "./cmds";
import * as Services from './services'
import { IDispatcher, Dispatcher } from "./dispatcher";
import { EClientSocketEvents } from "./declare";


export interface IRooms extends Cmds.IBase {
    items: Cmds.Helper.KeyValue<Room>;
    dispatcher: IDispatcher;  
    getRoom(room: Cmds.IRoom | string);
}

export class Rooms extends Cmds.Base {
    items: Cmds.Helper.KeyValue<Room>;
    dispatcher: IDispatcher;

    constructor(instanceId: string, dispatcher?: IDispatcher ) {
        super();
        this.instanceId = instanceId;
        this.dispatcher = dispatcher || Dispatcher.getInstance(instanceId);
        this.items = new Cmds.Helper.KeyValue();
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
        this.dispatcher.eventEmitter.addListener(Cmds.ECommandEvents.onDispatched, this.onDispatched_Command)
        this.dispatcher.eventEmitter.addListener(EClientSocketEvents.disconnect, this.onNetwork_Disconnect);        
    }
    unInitEvents() {
        this.dispatcher.eventEmitter.removeListener(Cmds.ECommandEvents.onDispatched, this.onDispatched_Command);
        this.dispatcher.eventEmitter.removeListener(EClientSocketEvents.disconnect, this.onNetwork_Disconnect);  
    }

    onDispatched_Command = (cmd: Cmds.ICommand) => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.adhoc_login:
                type === Cmds.ECommandType.resp ?
                    Services.ServiceLogin.Rooms.onDispatched.resp(this, cmd as any) : null
                break;
            case Cmds.ECommandId.adhoc_hello:
                type === Cmds.ECommandType.req ?
                    Services.ServiceHello.Rooms.onDispatched.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.ServiceHello.Rooms.onDispatched.resp(this, cmd as any) : null
                break;
            default:
                break;
        }
        this.eventEmitter.emit(Cmds.ECommandEvents.onDispatched, cmd);
    }

    // Network
    onNetwork_Disconnect = () => {
        this.eventEmitter.emit(EClientSocketEvents.disconnect);
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