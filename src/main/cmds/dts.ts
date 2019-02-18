import * as Common from './common/index'
export * from './common/dts'

export var Command_stream_webrtc_on_prefix = 'stream_webrtc_on';
export var CommandID = Common.ECommandEvents.CommandID;



export enum ECommandId {
    network_connect = 'network_connect',
    network_connect_error = 'network_connect_error',
    network_connect_timeout = 'network_connect_timeout',
    network_connecting = 'network_connecting',
    network_disconnect = 'network_disconnect',
    network_disconnecting = 'network_disconnecting',
    network_error = 'network_error',
    network_reconnect = 'network_reconnect',
    network_reconnect_attempt = 'network_reconnect_attempt',
    network_reconnect_failed = 'network_reconnect_failed',
    network_reconnect_error = 'network_reconnect_error',
    network_reconnecting = 'network_reconnecting',
    network_ping = 'network_ping',
    network_pong = 'network_pong',
 

    none = 'none',
    adhoc_login = 'adhoc_login',
    adhoc_logout = 'adhoc_logout',
    adhoc_hello = 'adhoc_hello',

    room_open = 'room_open',
    room_close = 'room_close',
    room_join = 'room_join',
    room_leave = 'room_leave',
    room_hello = 'room_hello',
    room_join_or_open = 'room_join_or_open',

    user_state_onchange = 'user_state_onchange',

    stream_room_open = 'stream_room_open',
    stream_room_join = 'stream_room_join',
    stream_room_join_or_open = 'stream_room_join_or_open',
    stream_room_hello = 'stream_room_hello',

    stream_webrtc_offer = 'stream_webrtc_offer',
    stream_webrtc_answer = 'stream_webrtc_answer',
    stream_webrtc_sdp = 'stream_webrtc_sdp',    
    stream_webrtc_candidate = 'stream_webrtc_candidate',
    stream_webrtc_ready = 'stream_webrtc_ready',

    stream_webrtc_sendstream = 'stream_webrtc_sendstream',
    stream_webrtc_io_input = 'stream_webrtc_io_input',

    stream_webrtc_onconnectionstatechange = 'stream_webrtc_onconnectionstatechange',
    stream_webrtc_ondatachannel = 'stream_webrtc_ondatachannel',
    stream_webrtc_onicecandidate = 'stream_webrtc_onicecandidate',
    stream_webrtc_onicecandidateerror = 'stream_webrtc_onicecandidateerror',
    stream_webrtc_oniceconnectionstatechange = 'stream_webrtc_oniceconnectionstatechange',
    stream_webrtc_onicegatheringstatechange = 'stream_webrtc_onicegatheringstatechange',
    stream_webrtc_onnegotiationneeded = 'stream_webrtc_onnegotiationneeded',
    stream_webrtc_onsignalingstatechange = 'stream_webrtc_onsignalingstatechange',
    stream_webrtc_onstatsended = 'stream_webrtc_onstatsended',
    stream_webrtc_ontrack = 'stream_webrtc_ontrack',
    stream_webrtc_onstream = 'stream_webrtc_onstream',
    stream_webrtc_onaddstream = 'stream_webrtc_onaddstream',
    stream_webrtc_onrecvstream = 'stream_webrtc_on_recvstream',
    stream_webrtc_onrecvstreaminactive = 'stream_webrtc_on_recvstreaminactive',
    stream_webrtc_onsendstreaminactive = 'stream_webrtc_on_sendstreaminactive',
    stream_webrtc_ongetconfig = 'stream_webrtc_on_getconfig',   

    stream_webrtc_ondatachannelbufferedamountlow = 'stream_webrtc_ondatachannelbufferedamountlow',
    stream_webrtc_ondatachannelclose = 'stream_webrtc_ondatachannelclose',
    stream_webrtc_ondatachannelerror = 'stream_webrtc_ondatachannelerror',
    stream_webrtc_ondatachannelmessage = 'stream_webrtc_ondatachannelmessage',
    stream_webrtc_ondatachannelopen = 'stream_webrtc_ondatachannelopen' 
}


//分组前缀
export var RoomIdSeparator = '/'
export enum ERoomPrefix {
    adhoc = 'adhoc#',
    agency = 'agency#',
    stream = 'stream#'
}

// 用户数据
export interface IUser {
    id: string,
    sid?: string    
    nick?: string
    states?: number //1: Receiver, 2: Sender, 4: Agency    
    room?: IRoom
    extra?: any
}
export enum EUserState {
    none =                      0b0,
    roomOwner =                 0b1,
    streamReceiver =            0b10,
    streamSender =              0b100,
    stream_room_opened =        0b1000,
    stream_room_sending =       0b10000,
}

//群组数据
export interface IRoom {
    id: string
}

export interface ICommandReqDataProps {
    user?: IUser 
}
export interface ICommandRespDataProps {
    result: boolean
    msg?: string
    user?: IUser
}

//  Command Room Open Req Props
export interface ICommandRoomOpenReqDataProps extends ICommandReqDataProps{}
// Command Room Open Resp Props
export interface ICommandRoomOpenRespDataProps  extends ICommandRespDataProps{}
// Command Room Close Req Props
export interface ICommandRoomCloseReqDataProps extends ICommandReqDataProps{}
// Command Room Open Resp Props
export interface ICommandRoomCloseRespDataProps extends ICommandRespDataProps{}
// Command Room Join Req Props
export interface ICommandRoomJoinReqDataProps extends ICommandReqDataProps{}
// Command Room Open Resp Props
export interface ICommandRoomJoinRespDataProps extends ICommandRespDataProps{}
// Command Room Leave Req Props
export interface ICommandRoomLeaveReqDataProps extends ICommandReqDataProps{}
// Command Room Leave Resp Props
export interface ICommandRoomLeaveRespDataProps extends ICommandRespDataProps{}
// Command Room Hello Req Props
export interface ICommandRoomHelloReqDataProps extends ICommandReqDataProps{}
// Command Room Hello Resp Props
export interface ICommandRoomHelloRespDataProps extends ICommandRespDataProps{}



// Command Login Req Props
export interface ICommandLoginReqDataProps extends ICommandRoomJoinReqDataProps {}
// Command Login Resp Props
export interface ICommandLoginRespDataProps extends ICommandRoomJoinRespDataProps {}
//  Command Logout Req Props
export interface ICommandLogoutReqDataProps extends ICommandRoomLeaveReqDataProps {}
//  Command Logout Resp Props
export interface ICommandLogoutRespDataProps extends ICommandRoomLeaveRespDataProps {}
//  Command Hello Req Props
export interface ICommandHelloReqDataProps extends ICommandRoomHelloReqDataProps {}
// Command Hello Resp Props
export interface ICommandHelloRespDataProps extends ICommandRoomHelloRespDataProps {}

