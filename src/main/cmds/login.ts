import * as Dts from './dts';
import * as Common from './common/index'


export class CommandLoginReq extends Common.Command<
            Dts.ICommandData<Dts.ICommandLoginReqDataProps>, 
            Common.ICommandConstructorParams<Dts.ICommandLoginReqDataProps> > {

}

export class CommandLoginResp extends Common.Command<
            Dts.ICommandData<Dts.ICommandLoginRespDataProps>, 
            Common.ICommandConstructorParams<Dts.ICommandLoginRespDataProps> > {
  
}

Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.adhoc_login,
    name: '登录',
    ReqClass: CommandLoginReq as any,
    RespClass: CommandLoginResp as any
})