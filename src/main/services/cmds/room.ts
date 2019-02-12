import * as Cmds from "../../cmds";
import { RoomHello } from "./room-hello";
import { Hello } from "./hello";
import { Dispatcher } from "../dispatcher";

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