import * as Common from './common/index'
export * from './common/dts'

export var Command_stream_webrtc_on_prefix = 'stream_webrtc_on';
export var CommandID = Common.ECommandEvents.CommandID;

export enum ECommandServerId {
    signaler = 'signaler_server',
    extension_capture = 'extension_capture',
    input_client = 'input_client'
}


export enum ECommandId {
    //other
    none = 'none',
    custom = 'custom',

    //network
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
    //input client for touch back
    network_inputclient_connect = 'network_inputclient_connect',
    network_inputclient_connecting = 'network_inputclient_connecting',
    network_inputclient_disconnect = 'network_inputclient_disconnect',

    //admin
    admin_config_update = "admin_config_update",
    admin_config_get = "admin_config_get",
    admin_namespace_close = "admin_namespace_close",
    admin_namespace_open = "admin_namespace_open",
    admin_namespace_reset = "admin_namespace_reset",
    admin_namespace_status = "admin_namespace_status", 

    //room
    adhoc_login = 'adhoc_login',
    adhoc_logout = 'adhoc_logout',
    adhoc_hello = 'adhoc_hello',

    room_open = 'room_open',
    room_close = 'room_close',
    room_join = 'room_join',
    room_leave = 'room_leave',
    room_hello = 'room_hello',
    room_changeid = 'room_changeid',
    room_join_or_open = 'room_join_or_open',

    stream_room_open = 'stream_room_open',
    stream_room_join = 'stream_room_join',
    stream_room_join_or_open = 'stream_room_join_or_open',
    stream_room_hello = 'stream_room_hello',

    //user
    user_state_onchange = 'user_state_onchange',
    user_get = "user_get",
    user_set = "user_set",

    //webrtc
    stream_webrtc_offer = 'stream_webrtc_offer',
    stream_webrtc_answer = 'stream_webrtc_answer',
    stream_webrtc_sdp = 'stream_webrtc_sdp',    
    stream_webrtc_candidate = 'stream_webrtc_candidate',
    stream_webrtc_ready = 'stream_webrtc_ready',

    stream_webrtc_sendstream = 'stream_webrtc_sendstream',
    stream_webrtc_resolution = 'stream_webrtc_resolution',
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
    stream_webrtc_onremovestream = 'stream_webrtc_onremovestream',
    stream_webrtc_onrecvstream = 'stream_webrtc_on_recvstream',
    stream_webrtc_onrecvstreaminactive = 'stream_webrtc_on_recvstreaminactive',
    stream_webrtc_onsendstreaminactive = 'stream_webrtc_on_sendstreaminactive',
    stream_webrtc_ongetconfig = 'stream_webrtc_on_getconfig',   

    stream_webrtc_ondatachannelbufferedamountlow = 'stream_webrtc_ondatachannelbufferedamountlow',
    stream_webrtc_ondatachannelclose = 'stream_webrtc_ondatachannelclose',
    stream_webrtc_ondatachannelerror = 'stream_webrtc_ondatachannelerror',
    stream_webrtc_ondatachannelmessage = 'stream_webrtc_ondatachannelmessage',
    stream_webrtc_ondatachannelopen = 'stream_webrtc_ondatachannelopen',
    stream_webrtc_ondatachanneladd = 'stream_webrtc_ondatachanneladd',

    //chrome extension desktop capture
    extension_capture_are_you_ready = 'extension_capture_are_you_ready',
    extension_capture_get_custom_sourceId = 'extension_capture_get_custom_sourceId',
}


//分组前缀
export var RoomIdSeparator = '/'
export enum ERoomPrefix {
    adhoc = 'adhoc#',
    agency = 'agency#',
    stream = 'stream#',
    turn = 'turn#'
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
    stream_turn_room_opened =   0b100000,
    stream_turn_room_sending =  0b1000000,
    input_client_connect =      0b10000000,
    touchback =                 0b100000000,
}

//群组数据
export interface IRoom {
    id: string
    sim?: string
    extra?: any
}
export interface ICommandDataProps {
    extra?: any
    user?: IUser 
}

export interface ICommandReqDataProps extends ICommandDataProps {}
export interface ICommandRespDataProps extends ICommandDataProps{}

export interface IDesktopMediaStream {
    sourceId: string
    canRequestAudioTrack?: boolean,
    stream?: MediaStream
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
// Command Room ChangeId Req Props
export interface ICommandRoomChangeIdReqDataProps extends ICommandReqDataProps{}
// Command Room ChangeId Resp Props
export interface ICommandRoomChangeIdRespDataProps extends ICommandRespDataProps{}




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

