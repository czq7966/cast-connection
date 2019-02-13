import * as Cmds from "../../cmds";
import * as ServiceModules from '../modules/index'
import { User } from "./user";
import { RoomOpen } from "./room-open";


var Tag = "Service-Cmds-StreamRoomOpen"
export class StreamRoomOpen extends Cmds.Common.Base {
    static open(instanceId: string, user: Cmds.IUser): Promise<any> {
        // let currUser = User.CurrentUser(instanceId);  
        // room = room || {id: User.getStreamRoomId(currUser)};
        let room = {id: User.getStreamRoomId(user)};
        let promise = RoomOpen.open(instanceId, room);
        promise.then(() => {
            let mUser = ServiceModules.Rooms.getRoom(instanceId, user.room.id).getUser(user.id);
            mUser.states.set(Cmds.EUserState.stream_room_opened);
            User.syncHello(instanceId, mUser.item);
        })
        return promise;
    }
}