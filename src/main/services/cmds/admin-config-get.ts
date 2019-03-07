import * as Cmds from "../../cmds";

var Tag = "Service-Cmds-AdminConfigGet"
export class AdminConfigGet {
    static get(instanceId: string): Promise<any> {
        let cmd = new Cmds.CommandReq({instanceId: instanceId})            
        cmd.data = {
            cmdId: Cmds.ECommandId.admin_config_get,
        }
        let promise = cmd.sendCommandForResp();
        cmd.destroy();
        cmd = null;  
        return promise;
    }
}