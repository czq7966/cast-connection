import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceCmds from '../cmds/index'
import { Connection } from "./connection";



var Tag = "Service-Module-Room"
export class Room{
    static me(room: Modules.IRoom): Modules.IUser {
        let currUser = ServiceCmds.User.CurrentUser(room.instanceId)

        if (currUser) {
            return this.getUser(room, currUser.id)
        }        
    }
    static owner(room: Modules.IRoom): Modules.IUser {
        let user: Modules.IUser
        room.users.keys().some(key => {
            let _user = room.users.get(key);
            if (Cmds.Common.Helper.StateMachine.isset(user.item.state, Cmds.EUserState.roomOwner)) {
                user = _user;
                return true;
            }
        })
        return user;        
    }
    static getUser(room:  Modules.IRoom, user: Cmds.IUser | string) {
        if (typeof user === 'string') {
            return room.users.get(user);
        } else {
            if (user && user.id) {
                let usObj =room.getUser(user.id);
                if (!usObj) {
                    usObj = new Modules.User(room, user) as any;
                    room.users.add(user.id, usObj);
                }
                return usObj;
            }
        }
    }   
}