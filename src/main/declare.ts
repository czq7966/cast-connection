export * from './cmds/dts'
export enum EClientSocketEvents {
    connect = 'connect',
    connect_error = 'connect_error',
    connect_timeout = 'connect_timeout',
    connecting = 'connecting',
    disconnect = 'disconnect',
    error = 'error',
    reconnect = 'reconnect',
    reconnect_attempt = 'reconnect_attempt',
    reconnect_failed = 'reconnect_failed',
    reconnect_error = 'reconnect_error',
    reconnecting = 'reconnecting',
    // ping = 'ping',
    // pong = 'pong'
}