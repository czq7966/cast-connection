import * as Dts from './dts';
import * as Common from './common/index'

// Req
export interface ICommandLoginReqConstructorParams extends Common.IBaseConstructorParams {
    props?: Dts.ICommandLoginReqDataProps;
}

export class CommandLoginReq extends Common.Command  {
    data: Dts.ICommandLoginReqData;
    constructor(params: ICommandLoginReqConstructorParams ) {
        super(params)
    }
    destroy() {
        super.destroy();
    }
}


// Resp
export interface ICommandLoginRespConstructorParams extends Common.IBaseConstructorParams {
    props?: Dts.ICommandLoginRespDataProps;
}

export class CommandLoginResp extends Common.Command  {
    data: Dts.ICommandLoginRespData;
    constructor(params: ICommandLoginRespConstructorParams ) {
        super(params)
    }
    destroy() {
        super.destroy();
    }
}

Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.adhoc_login,
    name: '登录',
    ReqClass: CommandLoginReq as any,
    RespClass: CommandLoginResp as any
})