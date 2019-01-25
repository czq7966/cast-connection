import * as Dts from './dts';
import * as Common from './common/index'

export class CommandRoomOpenReq extends Common.Command<
        Dts.ICommandData<Dts.ICommandRoomOpenReqDataProps>, 
        Common.ICommandConstructorParams<Dts.ICommandLogoutReqDataProps> > {
    
}

export class CommandRoomOpenResp extends Common.Command<
        Dts.ICommandData<Dts.ICommandRoomOpenRespDataProps>, 
        Common.ICommandConstructorParams<Dts.ICommandRoomOpenRespDataProps> > {
    
}

Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.adhoc_logout,
    name: '建群',
    ReqClass: CommandRoomOpenReq,
    RespClass: CommandRoomOpenResp
})