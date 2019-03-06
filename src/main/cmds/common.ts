import * as Dts from './dts';
import * as Common from './common/index'


export class CommandCommon extends Common.Command<any>  {}
export class CommandReq extends Common.Command<Dts.ICommandReqDataProps>{}
export class CommandResp extends Common.Command<Dts.ICommandRespDataProps>{}


[
    Dts.ECommandId.network_disconnect,
    Dts.ECommandId.user_state_onchange,
    Dts.ECommandId.custom,
    Dts.ECommandId.admin_config_get,
    Dts.ECommandId.admin_config_update,
    Dts.ECommandId.admin_namespace_close,
    Dts.ECommandId.admin_namespace_open,
    Dts.ECommandId.admin_namespace_reset,
    Dts.ECommandId.admin_namespace_status
].forEach(commanid => {
    Common.CommandTypes.RegistCommandType({
        cmdId: commanid,
        name: commanid,
        ReqClass: CommandCommon,
        RespClass: CommandCommon
    })
})



// Common.CommandTypes.RegistCommandType({
//     cmdId: Dts.ECommandId.network_disconnect,
//     name: '网络断开',
//     ReqClass: CommandCommon,
//     RespClass: CommandCommon
// })

// Common.CommandTypes.RegistCommandType({
//     cmdId: Dts.ECommandId.user_state_onchange,
//     name: '用户状态变更',
//     ReqClass: CommandReq,
//     RespClass: CommandResp
// })

// Common.CommandTypes.RegistCommandType({
//     cmdId: Dts.ECommandId.custom,
//     name: '自定义指令',
//     ReqClass: CommandReq,
//     RespClass: CommandResp
// })