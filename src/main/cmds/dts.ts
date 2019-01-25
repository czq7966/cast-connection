import * as Common from './common/index'

export * from './common/dts'

export var CommandID = 'command'

export enum ECommandId {
    network_connect = 'network_connect',
    network_connect_error = 'network_connect_error',
    network_connect_timeout = 'network_connect_timeout',
    network_connecting = 'network_connecting',
    network_disconnect = 'network_disconnect',
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
    room_join = 'room_join',
    room_hello = 'room_hello',
    room_join_or_open = 'room_join_or_open',

    stream_room_open = 'stream_room_open',
    stream_room_join = 'stream_room_join',
    stream_room_join_or_open = 'stream_room_join_or_open',
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
    room?: IRoom,
    nick?: string
    label?: number //1: Receiver, 2: Sender, 4: Agency    
    sid?: string
    rooms?: IRoom[]
}
export enum EUserLabel {
    none = 0b0,
    agency = 0b1,
    streamReceiver = 0b01,
    streamSender = 0b001,
}

//群组数据
export interface IRoom {
    id: string
}

// Command Login Req Props
export interface ICommandLoginReqDataProps {
    user: IUser
}

// Command Login Resp Props
export interface ICommandLoginRespDataProps {
    result: boolean
    msg?: string
    user?: IUser
}

//  Command Logout Req Props
export interface ICommandLogoutReqDataProps {
    user: IUser
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
    room?: IRoom
}

// Command Room Open Resp Props
export interface ICommandRoomOpenRespDataProps {
    result: boolean
    msg?: string
    room?: IRoom
}

// Command Room Join Req Props
export interface ICommandRoomJoinReqDataProps {
    room?: IRoom
}

// Command Room Open Resp Props
export interface ICommandRoomJoinRespDataProps {
    result: boolean
    msg?: string
    room?: IRoom
}
