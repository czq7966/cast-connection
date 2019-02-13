import * as Cmds from "../../cmds";
import * as ServiceModules from '../modules/index'
import * as ServiceCmds from '../cmds/index'
import { User } from "./user";
import { RoomClose } from "./room-close";


var Tag = "Service-Cmds-StreamRoomClose"
export class StreamRoomClose extends Cmds.Common.Base {
    static close(instanceId: string, user: Cmds.IUser): Promise<any> {
        let promise = RoomClose.close(instanceId, user.room);
        promise.then(() => {
            let pRoom = ServiceCmds.Room.getParent(user.room);
            if (pRoom) {
                let mpRoom = ServiceModules.Rooms.getRoom(instanceId, pRoom.id)
                if (mpRoom) {
                    let mUser = mpRoom.getUser(user.id);
                    mUser.states.reset(Cmds.EUserState.stream_room_opened | Cmds.EUserState.stream_room_sending );
                    User.syncHello(instanceId, mUser.item);
                }
            }
        })
        return promise;
    }
}