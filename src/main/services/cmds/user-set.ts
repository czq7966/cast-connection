import * as Cmds from "../../cmds";

var Tag = "Service-Cmds-UserSet"
export class UserSet {
    static set(instanceId: string, user: Cmds.IUser): Promise<any> {
        let cmd = new Cmds.CommandReq({instanceId: instanceId})            
        cmd.data = {
            cmdId: Cmds.ECommandId.user_set,
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