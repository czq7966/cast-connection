// 请求或响应类型指令
export enum ECommandType {
    req = 1, //请求
    resp = 2  //响应
}

// 地址
export interface IAddressData {
    type?: 'socket' | 'user' | 'room' | 'server',
    id?: string
}

// 指令包
export interface ICommandData<T> {
    //Address
    from?: IAddressData
    to?: IAddressData

    //Content
    type?: ECommandType
    cmdId?: string
    props?: T
    sessionId?: string

    //Events
    onResp?: Function
    onRespTimeout?: Function

    //extra
    extra?: any
}

//指令事件
export enum ECommandEvents {
    //收到指令
    onDispatched = 'onDispatched',
    //指令回调前执行，
    onBeforeDispatched = 'onBeforeDispatched',
}
