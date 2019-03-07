import * as Cmds from "../../cmds";

var Tag = "Service-Cmds-AdminNamespaceClose"
export class AdminNamespaceClose {
    static close(instanceId: string, names: string[]): Promise<any> {
        let cmd = new Cmds.CommandReq({instanceId: instanceId})            
        cmd.data = {
            cmdId: Cmds.ECommandId.admin_namespace_close,
            extra: names
        }
        let promise = cmd.sendCommandForResp();
        cmd.destroy();
        cmd = null;  
        return promise;
    }
}