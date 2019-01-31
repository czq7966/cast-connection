import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceCmds from '../cmds/index'
import { Connection } from "./connection";



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

}