import * as Dts from './dts';
import * as Common from './common/index'


export class CommandCommon extends Common.Command<any>  {}
export class CommandReq extends Common.Command<Dts.ICommandReqDataProps>{}
export class CommandResp extends Common.Command<Dts.ICommandRespDataProps>{}

Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.network_disconnect,
    name: '网络断开',
    ReqClass: CommandCommon,
    RespClass: CommandCommon
})

Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.user_state_onchange,
    name: '用户状态变更',
    ReqClass: CommandReq,
    RespClass: CommandResp
})

Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.custom,
    name: '自定义指令',
    ReqClass: CommandReq,
    RespClass: CommandResp
})