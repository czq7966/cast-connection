import * as Cmds from "../../cmds";

var Tag = "Service-Cmds-Room"
export class Room {
    static getParent(room: Cmds.IRoom): Cmds.IRoom {
        let id = room.id;
        let idx = id.lastIndexOf(Cmds.RoomIdSeparator);
        if (idx >=0 ) {
            id = id.substring(0, idx);
            return {id: id}
        }
    }
}