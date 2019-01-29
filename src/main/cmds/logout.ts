import * as Dts from './dts';
import * as Common from './common/index'

export class CommandLogoutReq extends Common.Command<Dts.ICommandLogoutReqDataProps> {
    
}

export class CommandLogoutResp extends Common.Command<Dts.ICommandLogoutReqDataProps> {
    
}

Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.adhoc_logout,
    name: '登出',
    ReqClass: CommandLogoutReq,
    RespClass: CommandLogoutResp
})