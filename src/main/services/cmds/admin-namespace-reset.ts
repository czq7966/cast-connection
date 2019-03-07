import * as Cmds from "../../cmds";

var Tag = "Service-Cmds-AdminNamespaceReset"
export class AdminNamespaceReset {
    static reset(instanceId: string, names: string[]): Promise<any> {
        let cmd = new Cmds.CommandReq({instanceId: instanceId})            
        cmd.data = {
            cmdId: Cmds.ECommandId.admin_namespace_reset,
            extra: names
        }
        let promise = cmd.sendCommandForResp();
        cmd.destroy();
        cmd = null;  
        return promise;
    }
}