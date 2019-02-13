import * as Cmds from "../../cmds";
import { Hello } from "./hello";
import { Dispatcher } from "../dispatcher";

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
    static syncHello(instanceId: string, user: Cmds.IUser) {
        let reqCmd = new Cmds.CommandHelloReq({instanceId: instanceId});
        reqCmd.data.from = {type: 'room', id: user.room.id};
        Hello.respHello(reqCmd, user);
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
        Dispatcher.getInstance<Dispatcher>(instanceId, false).onCommand(data);
    }
}