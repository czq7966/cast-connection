import * as Dts from './dts';
import * as Common from './common/index'


export class CommandCommon extends Common.Command<any>  {}
export class CommandReq extends Common.Command<Dts.ICommandReqDataProps>{
    static req(instanceId: string, data: Dts.ICommandData<Dts.ICommandReqDataProps>, waitForResp?: boolean): Promise<any> {
        let cmd = new CommandReq({instanceId: instanceId})            
        cmd.data = data;
        let promise: Promise<any>;
        if (waitForResp) {
            promise = cmd.sendCommandForResp();
        } else {
            promise = cmd.sendCommand();
        }

        cmd.destroy();
        cmd = null;  
        return promise;
    }
}
export class CommandResp extends Common.Command<Dts.ICommandRespDataProps>{
    static resp(reqCmd: CommandReq, data: Dts.ICommandData<Dts.ICommandReqDataProps>) {
        let cmd = new CommandResp({instanceId: reqCmd.instanceId})            
        cmd.data = data;
        cmd.data.sessionId = data.sessionId || reqCmd.data.sessionId;
        cmd.data.to = cmd.data.to || reqCmd.data.from;
        let promise = cmd.sendCommand();
        cmd.destroy();
        cmd = null;  
        return promise;        
    }
}


[
    Dts.ECommandId.custom,

    Dts.ECommandId.user_state_onchange,
    Dts.ECommandId.user_get,
    Dts.ECommandId.user_set,

    Dts.ECommandId.admin_config_get,
    Dts.ECommandId.admin_config_update,
    Dts.ECommandId.admin_namespace_close,
    Dts.ECommandId.admin_namespace_open,
    Dts.ECommandId.admin_namespace_reset,
    Dts.ECommandId.admin_namespace_status,
    Dts.ECommandId.admin_users_get,

    Dts.ECommandId.network_disconnect,
    Dts.ECommandId.network_inputclient_connect,
    Dts.ECommandId.network_inputclient_connecting,
    Dts.ECommandId.network_inputclient_disconnect,

    Dts.ECommandId.extension_capture_are_you_ready,
    Dts.ECommandId.extension_capture_get_custom_sourceId,
    Dts.ECommandId.extension_capture_is_touch_back_supported,
].forEach(commanid => {
    Common.CommandTypes.RegistCommandType({
        cmdId: commanid,
        name: commanid,
        ReqClass: CommandCommon,
        RespClass: CommandCommon
    })
})
