import { IRoom, Room } from "./room";
import * as Cmds from "../cmds";
import * as Services from '../services'
import * as Dispatchers from './dispatchers'


export interface IRooms extends Cmds.Common.IBase {
    items: Cmds.Common.Helper.KeyValue<IRoom>;
    dispatcher: Dispatchers.IDispatcher;  
    eventRooter: Cmds.Common.IEventRooter
    getRoom(room: Cmds.IRoom | string): IRoom;
    getLoginRoom(): IRoom
    removeRoom(roomid: string): IRoom;
    delRoom(roomid: string);
    existRoom(roomid: string): boolean
    clearRoom();
}

export class Rooms extends Cmds.Common.CommandRooter implements IRooms {
    items: Cmds.Common.Helper.KeyValue<IRoom>;
    dispatcher: Dispatchers.IDispatcher;

    constructor(instanceId: string, dispatcher?: Dispatchers.IDispatcher ) {
        super(instanceId);
        this.dispatcher = dispatcher || Dispatchers.Dispatcher.getInstance(instanceId);
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
        this.eventRooter.onPreventRoot.add(this.onPreventRoot)
        this.eventRooter.onBeforeRoot.add(this.onBeforeRoot)
        this.eventRooter.onAfterRoot.add(this.onAfterRoot)
    }
    unInitEvents() {
        this.eventRooter.onPreventRoot.remove(this.onPreventRoot)        
        this.eventRooter.onBeforeRoot.remove(this.onBeforeRoot)
        this.eventRooter.onAfterRoot.remove(this.onAfterRoot)
        this.eventRooter.setParent();        
    }

    onPreventRoot = (cmd: Cmds.Common.ICommand): any  => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.adhoc_logout:
                if (type === Cmds.ECommandType.req) {
                    let mRoom = this.getLoginRoom();
                    if (mRoom) {
                        let props = cmd.data.props as Cmds.ICommandDataProps;
                        if (mRoom.me().item.id == props.user.id) {
                            console.warn("kicked off!!!");
                            return Cmds.Common.EEventEmitterEmit2Result.preventRoot;
                        }
                    }
                }
                break;
        }
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
            case Cmds.ECommandId.network_inputclient_connect:
                Services.Cmds.Network.InputClient.Connect.onBeforeRoot.req(this, cmd as any)
                break;
            case Cmds.ECommandId.network_inputclient_disconnect:
                Services.Cmds.Network.InputClient.Disconnect.onBeforeRoot.req(this, cmd as any)
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
    getRoom(room: Cmds.IRoom | string): IRoom {
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
    
    getLoginRoom(): IRoom{
        return Services.Modules.Rooms.getLoginRoom(this.instanceId)
    }
}