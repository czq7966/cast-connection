import * as Cmds from "../../cmds";

var Tag = "Service-Cmds-AdminNamespaceStatus"
export class AdminNamespaceStatus {
    static get(instanceId: string, names: string[]): Promise<any> {
        let cmd = new Cmds.CommandReq({instanceId: instanceId})            
        cmd.data = {
            cmdId: Cmds.ECommandId.admin_namespace_status,
            extra: names
        }
        let promise = cmd.sendCommandForResp();
        cmd.destroy();
        cmd = null;  
        return promise;
    }
}