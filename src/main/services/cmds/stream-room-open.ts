import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules/index'
import { User } from "./user";
import { RoomOpen } from "./room-open";
import { RoomHello } from "./room-hello";
import { Hello } from "./hello";


var Tag = "Service-Cmds-StreamRoomOpen"
export class StreamRoomOpen extends Cmds.Common.Base {
    static open(instanceId: string, room?: Cmds.IRoom): Promise<any> {
        let currUser = User.CurrentUser(instanceId);  
        room = room || {id: User.getStreamRoomId(currUser)};
        let promise = RoomOpen.open(instanceId, room);
        promise.then(() => {
            currUser.state = Cmds.Common.Helper.StateMachine.set(currUser.state, Cmds.EUserState.stream_room_opened);
            let reqCmd = new Cmds.CommandHelloReq({instanceId: instanceId});
            reqCmd.data.from = {type: 'room', id: currUser.room.id};
            Hello.respHello(reqCmd, currUser);
        })
        return promise;
    }
}