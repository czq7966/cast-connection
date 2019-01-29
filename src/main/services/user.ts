import * as Cmds from "../cmds";
import * as Modules from '../modules'
import { Debug } from "../cmds/common/helper";

var Tag = "ServiceUser"
export class ServiceUser extends Cmds.Common.Base {
    static CurrentUser(instanceId: string): Cmds.IUser {
        return Cmds.CommandLoginResp.getInstance<Cmds.CommandLoginResp>(instanceId).data.props.user;        
    }
}