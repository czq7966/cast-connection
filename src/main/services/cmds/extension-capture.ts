import * as Cmds from "../../cmds";

var Tag = "Service-Cmds-ExtensionCapture"
export class ExtensionCapture {
    static areYouReady(instanceId: string): Promise<any> {
        let cmd = new Cmds.CommandReq({instanceId: instanceId})            
        cmd.data = {
            cmdId: Cmds.ECommandId.extension_capture_are_you_ready,
            respTimeout: 2 * 1000
        }
        let promise = cmd.sendCommandForResp();
        cmd.destroy();
        cmd = null;  
        return promise;
    }
}