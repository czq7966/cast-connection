import { Room } from "./room";
import { KeyValue } from "./helper";
import * as Cmds from "./cmds";
import { IDispatcher, Dispatcher } from "./dispatcher";


export interface IRooms extends Cmds.IBase {
    items: KeyValue<Room>;
    dispatcher: IDispatcher;  
}

export enum ERoomsEvents {
    onDispatched_CommandLoginReq = 'onDispatched_CommandLoginReq',
    onDispatched_CommandLoginResp = 'onDispatched_CommandLoginResp'    
}

export class Rooms extends Cmds.Base {
    items: KeyValue<Room>;
    dispatcher: IDispatcher;

    constructor(instanceId: string, dispatcher?: IDispatcher ) {
        super();
        this.instanceId = instanceId;
        this.dispatcher = dispatcher || Dispatcher.getInstance(instanceId);
        this.items = new KeyValue();
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

        // this.dispatcher.eventEmitter.addListener(Cmds.ECommandEvents.onDispatched, this.onDispatched_CommandLoginReq)
        // this.dispatcher.eventEmitter.addListener(Cmds.ECommandEvents.onDispatched, this.onDispatched_CommandLoginResp)
    }
    unInitEvents() {
        this.dispatcher.eventEmitter.removeListener(Cmds.ECommandEvents.onDispatched, this.onDispatched_Command)
        // this.dispatcher.eventEmitter.removeListener(Cmds.ECommandEvents.onDispatched, this.onDispatched_CommandLoginReq)
        // this.dispatcher.eventEmitter.removeListener(Cmds.ECommandEvents.onDispatched, this.onDispatched_CommandLoginResp)
    }

    onDispatched_Command = (cmd: Cmds.ICommand) => {
        switch(cmd.data.cmdId) {
            case Cmds.ECommandId.adhoc_login:
                if (cmd.data.type === Cmds.ECommandType.req)
                    this.onDispatched_CommandLoginReq(cmd as any);
                if (cmd.data.type === Cmds.ECommandType.resp)
                    this.onDispatched_CommandLoginResp(cmd as any);
                break;
            default:
                break;
        }

    }

    onDispatched_CommandLoginReq = (cmd: Cmds.CommandLoginReq) => {
        let data = cmd.data;
        let rm = data.props.user.room;            
        let room = this.getRoom(rm.id);
        if (!room) {
            room = this.getRoom(rm);
        }
        this.eventEmitter.emit(ERoomsEvents.onDispatched_CommandLoginReq, cmd);        
    }

    onDispatched_CommandLoginResp = (cmd: Cmds.CommandLoginResp) => {
        let data = cmd.data;
        if (data.props.result){
            let rm = data.props.user.room;            
            let room = this.getRoom(rm.id);
            if (!room) {
                room = this.getRoom(rm);
            }
            this.eventEmitter.emit(ERoomsEvents.onDispatched_CommandLoginResp, cmd);            
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