import * as Cmds from "../../cmds";

var Tag = "Service-Cmds-User"
export class User extends Cmds.Common.Base {
    static CurrentUser(instanceId: string): Cmds.IUser {
        let data = Cmds.CommandLoginResp.getInstance<Cmds.CommandLoginResp>(instanceId).data; 
        let user = data && data.props && data.props.user
        return user;
    }
    static isLogin(instanceId: string): boolean {
        let data = Cmds.CommandLoginResp.getInstance<Cmds.CommandLoginResp>(instanceId).data; 
        return !!(data && data.props && data.props.user && data.props.user)
    }
    static getStreamRoomId(user: Cmds.IUser) {
        return Cmds.ERoomPrefix.stream + user.id;
    }
    
}