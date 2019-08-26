import * as Cmds from "../../cmds";

var Tag = "Service-Cmds-AdminUsersGet"
export class AdminUsersGet {
    static get(instanceId: string, namespace: string, from: number, to: number): Promise<any> {
        let cmd = new Cmds.CommandReq({instanceId: instanceId})            
        cmd.data = {
            cmdId: Cmds.ECommandId.admin_users_get,
            extra: {
                namespace: namespace,
                from: from,
                to: to
            }
        }
        let promise = cmd.sendCommandForResp();
        cmd.destroy();
        cmd = null;  
        return promise;
    }
}