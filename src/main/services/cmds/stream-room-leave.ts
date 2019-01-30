import * as Cmds from "../../cmds";
import { RoomLeave } from "./room-leave";

var Tag = "Service-Cmds-StreamRoomLeave"
export class StreamRoomLeave extends Cmds.Common.Base {
    static leave(instanceId: string, room: Cmds.IRoom): Promise<any> {
        room = room;
        let promise = RoomLeave.leave(instanceId, room);
        promise.then((data: Cmds.ICommandData<Cmds.ICommandRoomLeaveRespDataProps>) => {   
            console.log(Tag) 
        })
        return promise;
    }
}