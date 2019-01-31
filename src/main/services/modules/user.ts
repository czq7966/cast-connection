import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceCmds from '../cmds/index'


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
}