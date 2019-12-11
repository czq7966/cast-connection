import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceCmds from '../cmds/index'
import { Rooms } from './rooms'


var Tag = "Service-Module-User"
export class User{
    static update(mUser: Modules.IUser, user: Cmds.IUser) {
        mUser.item = Object.assign({}, user);
        var currUser = ServiceCmds.User.CurrentUser(mUser.instanceId);
        if (user.id === currUser.id && user.room.id === currUser.room.id) {
            ServiceCmds.User.setCurrentUser(mUser.instanceId, mUser.item);            
        }
        mUser.states.set(user.states, null, true);
    }
    static getStreamRoom(mUser: Modules.IUser): Modules.IRoom {
        let roomid = ServiceCmds.User.getStreamRoomId(mUser.item);
        return mUser.room.rooms.getRoom(roomid);
    }

    static CurrentUser(instanceId: string): Modules.IUser {
        return Rooms.getLoginRoom(instanceId).me();
    }
    static getMyRecvStream(instanceId: string, userId: string): MediaStream {
        let mLoginRomm = Rooms.getLoginRoom(instanceId);
        let mUser = mLoginRomm ? mLoginRomm.getUser(userId) : null;
        let mStreamRoom = mUser ? mUser.getStreamRoom() : null;
        let mMe = mStreamRoom ? mStreamRoom.me() : null;
        let streams = mMe ? mMe.peer.streams.recvs.values() : null;
        return  (streams && streams.length > 0) ? streams[0] : null;
    }

    static getStreamRoom2(instanceId: string, userId: string): Modules.IRoom {
        let mLoginRomm = Rooms.getLoginRoom(instanceId);
        let mUser = mLoginRomm ? mLoginRomm.getUser(userId) : null;
        let mStreamRoom = mUser ? mUser.getStreamRoom() : null;
        return mStreamRoom;
    }    
}