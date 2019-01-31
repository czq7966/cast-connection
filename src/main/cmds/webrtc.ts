import * as Dts from './dts';
import * as Common from './common/index'

export class CommandStreamWebrtcOfferReq extends Common.Command<Dts.ICommandReqDataProps>{}
export class CommandStreamWebrtcOfferResp extends Common.Command<Dts.ICommandRespDataProps> {}
Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.stream_webrtc_offer,
    name: 'offer',
    ReqClass: CommandStreamWebrtcOfferReq,
    RespClass: CommandStreamWebrtcOfferResp
})

export class CommandStreamWebrtcAnswerReq extends Common.Command<Dts.ICommandReqDataProps>{}
export class CommandStreamWebrtcAnswerResp extends Common.Command<Dts.ICommandRespDataProps> {}
Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.stream_webrtc_answer,
    name: 'answer',
    ReqClass: CommandStreamWebrtcAnswerReq,
    RespClass: CommandStreamWebrtcAnswerResp
})

export class CommandStreamWebrtcSdpReq extends Common.Command<Dts.ICommandReqDataProps>{}
export class CommandStreamWebrtcSdpResp extends Common.Command<Dts.ICommandRespDataProps> {}
Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.stream_webrtc_sdp,
    name: 'sdp',
    ReqClass: CommandStreamWebrtcSdpReq,
    RespClass: CommandStreamWebrtcSdpResp
})

export class CommandStreamWebrtcCandidateReq extends Common.Command<Dts.ICommandReqDataProps>{}
export class CommandStreamWebrtcCandidateResp extends Common.Command<Dts.ICommandRespDataProps> {}
Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.stream_webrtc_candidate,
    name: 'candidate',
    ReqClass: CommandStreamWebrtcCandidateReq,
    RespClass: CommandStreamWebrtcCandidateResp
})

export class CommandStreamWebrtcReadyReq extends Common.Command<Dts.ICommandReqDataProps>{}
export class CommandStreamWebrtcReadyResp extends Common.Command<Dts.ICommandRespDataProps> {}
Common.CommandTypes.RegistCommandType({
    cmdId: Dts.ECommandId.stream_webrtc_ready,
    name: 'ready',
    ReqClass: CommandStreamWebrtcReadyReq,
    RespClass: CommandStreamWebrtcReadyResp
})

export class CommandStreamWebrtcEventsReq extends Common.Command<Dts.ICommandReqDataProps>{}
export class CommandStreamWebrtcEventsResp extends Common.Command<Dts.ICommandReqDataProps>{}
Object.keys(Dts.ECommandId).forEach(key => {
    if (key.indexOf(Dts.Command_stream_webrtc_on_prefix) === 0) {
        Common.CommandTypes.RegistCommandType({
            cmdId: key,
            name: key,
            ReqClass: CommandStreamWebrtcEventsReq,
            RespClass: CommandStreamWebrtcEventsResp
        }) 
    }
})