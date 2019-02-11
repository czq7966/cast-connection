import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules/index'

var Tag = "Service-Cmds-UserStateOnChange"
export class UserStateOnChange {
    static User = {
        onBeforeRoot: {
            req(mUser: Modules.IUser, cmd: Cmds.CommandReq) {
                let data = cmd.data;
                if (mUser.item.id === data.props.user.id && mUser.item.room.id === data.props.user.room.id) {
                    console.log(Tag, 'User', mUser.item.room.id , 'onBeforeRoot', 'Req', cmd.data);
                }                  
            },
        },        
    } 
}