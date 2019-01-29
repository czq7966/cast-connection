import * as Dts from './dts';
import * as Common from './common/index'

export class CommandRoomOpenReq extends Common.Command<Dts.ICommandRoomOpenReqDataProps>{
    
}

export class CommandRoomOpenResp extends Common.Command<Dts.ICommandRoomOpenRespDataProps> {
    
}

Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.room_open,
    name: '建群',
    ReqClass: CommandRoomOpenReq,
    RespClass: CommandRoomOpenResp
})


export class CommandRoomJoinReq extends Common.Command<Dts.ICommandRoomJoinReqDataProps> {
    
}

export class CommandRoomJoinResp extends Common.Command<Dts.ICommandRoomJoinRespDataProps> {    
}

Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.room_join,
    name: '加群',
    ReqClass: CommandRoomJoinReq,
    RespClass: CommandRoomJoinResp
})
    
export class CommandRoomCloseReq extends Common.Command<Dts.ICommandRoomCloseReqDataProps> {
    
}

export class CommandRoomCloseResp extends Common.Command<Dts.ICommandRoomCloseRespDataProps> {    
}

Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.room_close,
    name: '关群',
    ReqClass: CommandRoomCloseReq,
    RespClass: CommandRoomCloseResp
})

export class CommandRoomLeaveReq extends Common.Command<Dts.ICommandRoomLeaveReqDataProps> {
    
}

export class CommandRoomLeaveResp extends Common.Command<Dts.ICommandRoomLeaveRespDataProps> {    
}

Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.room_leave,
    name: '退群',
    ReqClass: CommandRoomLeaveReq,
    RespClass: CommandRoomLeaveResp
})

export class CommandRoomHelloReq extends Common.Command<Dts.ICommandRoomHelloReqDataProps> {
    
}

export class CommandRoomHelloResp extends Common.Command<Dts.ICommandRoomHelloRespDataProps> {    
}

Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.room_hello,
    name: '握手',
    ReqClass: CommandRoomHelloReq,
    RespClass: CommandRoomHelloResp
})