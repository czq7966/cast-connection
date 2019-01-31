import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules/index'
import { User } from "./user";
import { RoomOpen } from "./room-open";
import { RoomHello } from "./room-hello";
import { RoomJoin } from "./room-join";
import { StreamRoomHello } from "./stream-room-hello";


var Tag = "Service-Cmds-StreamRoomJoin"
export class StreamRoomJoin extends Cmds.Common.Base {
    static join(instanceId: string, room: Cmds.IRoom): Promise<any> {
        let promise = RoomJoin.join(instanceId, room);
        promise.then((data: Cmds.ICommandData<Cmds.ICommandRoomJoinRespDataProps>) => {            
            let mRoom = ServiceModules.Rooms.getRoom(instanceId, data.props.user.room.id);
            let me =  ServiceModules.Room.me(mRoom).item;
            StreamRoomHello.hello(instanceId, me)
        })
        return promise;
    }
}