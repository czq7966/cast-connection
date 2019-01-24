import * as Dts from './dts';
import * as Common from './common/index'

export class CommandLogoutReq extends Common.Command<Dts.ICommandLogoutReqData, Common.ICommandConstructorParams<Dts.ICommandLogoutReqDataProps>>  {
    
}


Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.adhoc_logout,
    name: '登出',
    ReqClass: CommandLogoutReq as any,
    RespClass: null
})