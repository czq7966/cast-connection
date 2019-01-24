import * as Dts from './dts';
import * as Common from './common/index'

export class CommandHelloReq extends Common.Command<Dts.ICommandHelloReqData, Common.ICommandConstructorParams<Dts.ICommandHelloReqDataProps>>  {
}

export class CommandHelloResp extends Common.Command<Dts.ICommandHelloRespData, Common.ICommandConstructorParams<Dts.ICommandHelloRespDataProps>>  {
}

Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.adhoc_hello,
    name: '握手',
    ReqClass: CommandHelloReq as any,
    RespClass: CommandHelloResp as any
})