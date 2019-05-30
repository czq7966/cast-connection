import * as Cmds from "../../cmds";

var Tag = "Service-Cmds-UserGet"
export class UserGet {
    static get(instanceId: string, user: Cmds.IUser): Promise<any> {
        let cmd = new Cmds.CommandReq({instanceId: instanceId})            
        cmd.data = {
            cmdId: Cmds.ECommandId.user_get,
            props: {
                user: user
            }
        }
        let promise = cmd.sendCommandForResp();
        cmd.destroy();
        cmd = null;  
        return promise;
    }
}