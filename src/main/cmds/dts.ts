import * as Common from './common/index'

export * from './common/dts'

export var CommandID = 'command'

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

    stream_room_open = 'stream_room_open',
    stream_room_join = 'stream_room_join',
    stream_room_join_or_open = 'stream_room_join_or_open',
    stream_room_hello = 'stream_room_hello',

    stream_webrtc_offer = 'stream_webrtc_offer',
    stream_webrtc_answer = 'stream_webrtc_answer',
    stream_webrtc_candidate = 'stream_webrtc_candidate',
    stream_webrtc_ready = 'stream_webrtc_ready'
}


//分组前缀
export enum ERoomPrefix {
    adhoc = 'adhoc/',
    agency = 'agency/',
    stream = 'stream/'
}

// 用户数据
export interface IUser {
    id: string,
    sid?: string    
    nick?: string
    state?: number //1: Receiver, 2: Sender, 4: Agency    
    room?: IRoom
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

// Command Login Req Props
export interface ICommandLoginReqDataProps {
    user: IUser,
}

// Command Login Resp Props
export interface ICommandLoginRespDataProps {
    result: boolean
    msg?: string
    user?: IUser
}

//  Command Logout Req Props
export interface ICommandLogoutReqDataProps {
    user: IUser,
}
//  Command Logout Resp Props
export interface ICommandLogoutRespDataProps {
    result: boolean
    msg?: string
    user?: IUser
}

//  Command Hello Req Props
export interface ICommandHelloReqDataProps {
    user: IUser
}

// Command Hello Resp Props
export interface ICommandHelloRespDataProps {
    user?: IUser
}

//  Command Room Open Req Props
export interface ICommandRoomOpenReqDataProps {
    user?: IUser
}

// Command Room Open Resp Props
export interface ICommandRoomOpenRespDataProps {
    result: boolean
    msg?: string
    user?: IUser
}

// Command Room Join Req Props
export interface ICommandRoomJoinReqDataProps {
    user?: IUser
}

// Command Room Open Resp Props
export interface ICommandRoomJoinRespDataProps {
    result: boolean
    msg?: string
    user?: IUser
}
// Command Room Close Req Props
export interface ICommandRoomCloseReqDataProps {
    user?: IUser
}

// Command Room Open Resp Props
export interface ICommandRoomCloseRespDataProps {
    result: boolean
    msg?: string
    user?: IUser
}
// Command Room Leave Req Props
export interface ICommandRoomLeaveReqDataProps {
    user?: IUser
}

// Command Room Leave Resp Props
export interface ICommandRoomLeaveRespDataProps {
    result: boolean
    msg?: string
    user?: IUser
}

// Command Room Hello Req Props
export interface ICommandRoomHelloReqDataProps {
    user?: IUser
}

// Command Room Hello Resp Props
export interface ICommandRoomHelloRespDataProps {
    user?: IUser
}