import { IRoom, Room } from "./room";
import * as Cmds from "../cmds";
import * as Services from '../services'


export interface IRooms extends Cmds.Common.IBase {
    items: Cmds.Common.Helper.KeyValue<IRoom>;
    dispatcher: Services.IDispatcher;  
    eventRooter: Cmds.Common.IEventRooter
    getRoom(room: Cmds.IRoom | string): IRoom;
    removeRoom(roomid: string): IRoom;
    delRoom(roomid: string);
    existRoom(roomid: string): boolean
    clearRoom();
}

export class Rooms extends Cmds.Common.CommandRooter implements IRooms {
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
        this.eventRooter.setParent(this.dispatcher.eventRooter);        
        this.eventRooter.onBeforeRoot.add(this.onBeforeRoot)
        this.eventRooter.onAfterRoot.add(this.onAfterRoot)
    }
    unInitEvents() {
        this.eventRooter.onBeforeRoot.remove(this.onBeforeRoot)
        this.eventRooter.onAfterRoot.remove(this.onAfterRoot)
        this.eventRooter.setParent();        
    }

    onBeforeRoot = (cmd: Cmds.Common.ICommand): any  => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.adhoc_login:
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.Login.Rooms.onBeforeRoot.resp(this, cmd as any) : null
                break;
            case Cmds.ECommandId.room_open: 
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomOpen.Rooms.onBeforeRoot.resp(this, cmd as any) : null
                break;
            case Cmds.ECommandId.room_join: 
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomJoin.Rooms.onBeforeRoot.resp(this, cmd as any) : null                    
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
                type === Cmds.ECommandType.req ?
                    Services.Cmds.Logout.Rooms.onAfterRoot.req(this, cmd as any) : 
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.Logout.Rooms.onAfterRoot.resp(this, cmd as any) : null                    
                break;
            case Cmds.ECommandId.network_disconnect: 
                Services.Cmds.Network.Disconnect.Rooms.onAfterRoot.req(this, cmd as any);
                break;     
            case Cmds.ECommandId.room_close:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.RoomClose.Rooms.onAfterRoot.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomClose.Rooms.onAfterRoot.resp(this, cmd as any) : null    
                break;   
            case Cmds.ECommandId.room_leave:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.RoomLeave.Rooms.onAfterRoot.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomLeave.Rooms.onAfterRoot.resp(this, cmd as any) : null    
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
}