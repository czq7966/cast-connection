import * as Common from './common'

export * from './common/dts'

export var CommandID = 'command'

export enum ECommandId {
    none = 'none',
    // command = 'command',
    adhoc_login = 'adhoc_login',
    adhoc_logout = 'adhoc_logout',
    adhoc_hello = 'adhoc_hello',
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

//
// Command Login Req Props
export interface ICommandLoginReqDataProps {
    user: IUser
}

export interface ICommandLoginReqData extends Common.ICommandData {
    props?: ICommandLoginReqDataProps;
}

// Command Login Resp Props
export interface ICommandLoginRespDataProps {
    result: boolean
    msg?: string
    user?: IUser
}

export interface ICommandLoginRespData extends Common.ICommandData {
    props?: ICommandLoginRespDataProps;
}

//
// Command Logout Req Props
export interface ICommandLogoutReqDataProps {
    user: IUser
}

export interface ICommandLogoutReqData extends Common.ICommandData {
    props?: ICommandLogoutReqDataProps;
}

//
// Command Hello Req Props
export interface ICommandHelloReqDataProps {
    user: IUser
}

export interface ICommandHelloReqData extends Common.ICommandData {
    props?: ICommandHelloReqDataProps;
}

// Command Hello Resp Props
export interface ICommandHelloRespDataProps {
    user?: IUser
}

export interface ICommandHelloRespData extends Common.ICommandData {
    props?: ICommandHelloRespDataProps;
}



