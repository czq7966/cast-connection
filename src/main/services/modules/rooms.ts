import * as Modules from '../../modules'
import * as ServiceCmds from '../cmds/index'
import { Connection } from "./connection";
import { Room } from './room';



var Tag = "ServiceModuleRooms"
export class Rooms{
    static getRoom(instanceId: string, roomid: string): Modules.IRoom {
        return Connection.getConnection(instanceId).rooms.getRoom(roomid)
    }
    static getLoginRoom(instanceId: string): Modules.IRoom {
        let currUser = ServiceCmds.User.CurrentUser(instanceId);
        if (currUser) {
            return this.getRoom(instanceId, currUser.room.id)
        }
    }
    static getRecvStreams(rooms: Modules.IRooms): Array<Modules.Webrtc.IStreams> {
        let streams: Array<Modules.Webrtc.IStreams> = [];
        rooms.items.keys().forEach(key => {
            let room = rooms.getRoom(key);
            streams = streams.concat(Room.getRecvStreams(room));
        })
        return streams;
    }
    static getSendStreams(rooms: Modules.IRooms): Array<Modules.Webrtc.IStreams> {
        let streams: Array<Modules.Webrtc.IStreams> = [];
        rooms.items.keys().forEach(key => {
            let room = rooms.getRoom(key);
            streams = streams.concat(Room.getSendStreams(room));
        })
        return streams;
    }      
}