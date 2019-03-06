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

export interface ICommandBaseData {
    //本地关键字，用于中断指令路由
    // preventDefault?: boolean
}

// 指令包
export interface ICommandData<T> extends ICommandBaseData  {
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
    timeout?: number

    //extra
    extra?: any

    //本地关键字，用于中断指令 解析分发（用于解析分发前）
    // preventDispatch?: boolean

}

//指令事件
export enum ECommandEvents {
    CommandID = 'command',
    onCommand = 'onCommand',
    onBeforeCommand = 'onBeforeCommand',
}
//指令分发事件
export enum ECommandDispatchEvents {
    //收到指令
    onDispatched = 'onDispatched',
    //指令回调前执行，
    onBeforeDispatched = 'onBeforeDispatched',
}
