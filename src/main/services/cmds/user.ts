import * as Cmds from "../../cmds";
import * as Modules from "../../modules"
import { Hello } from "./hello";

var Tag = "Service-Cmds-User"
export class User {
    static CurrentUser(instanceId: string): Cmds.IUser {
        let data = Cmds.CommandLoginResp.getInstance<Cmds.CommandLoginResp>(instanceId).data; 
        let user = data && data.props && data.props.user
        return user;
    }
    static setCurrentUser(instanceId: string, user: Cmds.IUser): Cmds.IUser {
        let data = Cmds.CommandLoginResp.getInstance<Cmds.CommandLoginResp>(instanceId).data; 
        if (data && data.props) {
            data.props.user = Object.assign(data.props.user || {}, user)
        }
        return this.CurrentUser(instanceId);
    }
    static isLogin(instanceId: string): boolean {
        let data = Cmds.CommandLoginResp.getInstance<Cmds.CommandLoginResp>(instanceId).data; 
        return !!(data && data.props && data.props.user && data.props.user)
    }
    static getStreamRoomId(user: Cmds.IUser) {
        return user.room.id + Cmds.RoomIdSeparator + Cmds.ERoomPrefix.stream + user.id;
    }
    static syncHello(instanceId: string, user: Cmds.IUser): Promise<any> {
        let reqCmd = new Cmds.CommandHelloReq({instanceId: instanceId});
        reqCmd.data.from = {type: 'room', id: user.room.id};
        return Hello.respHello(reqCmd, user);
    }
    static onStateChange(instanceId: string, user: Cmds.IUser, values: Cmds.Common.Helper.IStateChangeValues) {
        user = Object.assign({}, user);
        user.extra = values;
        let data: Cmds.ICommandData<Cmds.ICommandReqDataProps> = {
            cmdId: Cmds.ECommandId.user_state_onchange,
            props: {
                user: user
            }
        }        
        Modules.Dispatchers.Dispatcher.getInstance<Modules.Dispatchers.Dispatcher>(instanceId, false).onCommand(data);
    }
    static dispatchCommand(instanceId: string, user: Cmds.IUser, userExtra: any,  dataExtra: any, cmdId: Cmds.ECommandId) {
        user = Object.assign({}, user);
        user.extra = userExtra;
        let data: Cmds.ICommandData<Cmds.ICommandReqDataProps> = {
            cmdId: cmdId,
            props: {
                user: user
            },
            extra: dataExtra
        }
        Modules.Dispatchers.Dispatcher.getInstance<Modules.Dispatchers.Dispatcher>(instanceId, false).onCommand(data);
    }     

    static async dispatchCommand2(instanceId: string, cmd: Cmds.ICommandData<any>) {
        Modules.Dispatchers.Dispatcher.getInstance<Modules.Dispatchers.Dispatcher>(instanceId, false).onCommand(cmd);
    }         
}