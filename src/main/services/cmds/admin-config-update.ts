import * as Cmds from "../../cmds";

var Tag = "Service-Cmds-AdminConfigUpdate"
export class AdminConfigUpdate {
    static update(instanceId: string, url: string): Promise<any> {
        let cmd = new Cmds.CommandReq({instanceId: instanceId})            
        cmd.data = {
            cmdId: Cmds.ECommandId.admin_config_update,
            extra: url
        }
        let promise = cmd.sendCommandForResp();
        cmd.destroy();
        cmd = null;  
        return promise;
    }
}