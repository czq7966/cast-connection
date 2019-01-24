import * as io from 'socket.io-client'
import { EventEmitter } from 'events';
import * as Dts from './declare';
import * as Cmds from './cmds/index'


export enum ECustomEvents {
    message = 'room-message',
    openRoom = 'room-open',
    joinRoom = 'room-join',    
    closeRoom = 'room-close',
    leaveRoom = 'room-leave'
}

export interface IUserQuery {
    roomid?: string,
    password?: string,
    isOwner?: boolean,
    max?: number,
    from?: string,
    to?: string,
    msg?: any
}


export class Client {
    eventEmitter: EventEmitter;
    socket: SocketIOClient.Socket;
    url: string;

    constructor(url?: string) {
        this.eventEmitter = new EventEmitter();
        this.url = url;   
    }
    destroy() {
        this.eventEmitter.removeAllListeners();
        this.socket && this.socket.connected && this.socket.disconnect();
        this.unInitEvents(this.socket);
        delete this.eventEmitter;
        delete this.socket;
    }
    id(): string {
        return this.socket && this.socket.id;
    }

    connected(): boolean {
        return this.socket && this.socket.connected
    }

    connect(url?: string): Promise<any> {
        if (this.socket && this.socket.connected) {
            return Promise.resolve()
        }
        return new Promise((resolve, reject) => {
            delete this.socket;
            this.url = url || this.url;
            this.socket = io(this.url, {
                autoConnect: false,
                reconnection: false,
                transports: ['websocket']
            });        
            this.initEvents(this.socket);

            this.socket.on(Dts.EClientSocketEvents.connect, () => {
                this.socket.on(Dts.CommandID, () => {
                })                
                resolve();
            })
            this.socket.on(Dts.EClientSocketEvents.connect_error, (error) => {
                reject(error);
            })     


            this.socket.connect();
        })      
    }
    disconnect() {
        this.socket && this.socket.disconnect();
    }

    initEvents(socket: SocketIOClient.Socket) {
        [Dts.EClientSocketEvents, [Dts.CommandID]].forEach(events => {
            Object.keys(events).forEach(key => {
                let value = events[key];
                socket.on(value, (...args:any[]) => {
                    // console.log('Client Event:', value, ...args)
                    this.eventEmitter.emit(value, ...args)
                })
            })
        })
        socket.on(Dts.EClientSocketEvents.disconnect, () => {
            this.unInitEvents(socket);
        })
    }    
    unInitEvents(socket: SocketIOClient.Socket) {
        socket && socket.removeAllListeners();
    }     

    openRoom(query: IUserQuery, url?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.connect(url)
            .then(() => {
                this.socket.emit(ECustomEvents.openRoom, query, (result: boolean, msg: any) => {
                    if (result) {
                        console.log('open room success: ' + this.socket.id);
                        resolve(msg)                    
                    } else {
                        console.log('open room failed: ' + msg);
                        reject(msg)
                    }
                })  
            })
            .catch(error => {
                reject(error)
            })
 
        })
    }  

    joinRoom(query: IUserQuery): Promise<string> {
        return new Promise((resolve, reject) => {
            this.connect()
            .then(() => {
                this.socket.emit(ECustomEvents.joinRoom, query, (result: boolean, msg: string) => {
                    if (result) {
                        console.log('join room success: ' + msg);
                        resolve(msg)                    
                    } else {
                        console.log('join room failed: ' + msg);
                        reject(msg)
                    }
                })  
            })
            .catch(error => {
                reject(error)
            }) 
        })
    }

    leaveRoom(query: IUserQuery): Promise<any> {
        if (this.connected) {
            return new Promise((resolve, reject) => {
                    this.socket.emit(ECustomEvents.leaveRoom, query, (result: boolean, msg: string) => {
                        if (result) {
                            console.log('leave room success: ' + msg);
                            this.eventEmitter.emit(ECustomEvents.leaveRoom, query)
                            resolve(msg)                    
                        } else {
                            console.log('leave room failed: ' + msg);
                            reject(msg)
                        }
                    })  
            })
        } 
        return Promise.resolve();
    }    

    sendMessage(query: IUserQuery): Promise<any> {
        return new Promise((resolve, reject) => {
            this.connect()
            .then(() => {
                this.socket.emit(ECustomEvents.message, query, (result: boolean, msg: string) => {
                    if (result) {
                        console.log('message success: ' + msg);
                        resolve(msg)                    
                    } else {
                        console.log('message failed: ' + msg);
                        reject(msg)
                    }
                })  
            })
            .catch(error => {
                reject(error)
            }) 
        })
    }  
    
    sendCommand(cmd: Cmds.ICommandData): Promise<any> {
        return new Promise((resolve, reject) => {
            this.connect()
            .then(() => {
                this.socket.emit(Dts.CommandID, cmd , (result: boolean) => {
                    if (result) {
                        console.log('command success');
                        resolve()                    
                    } else {
                        console.log('command failed' );
                        reject()
                    }
                })  
            })
            .catch(error => {
                reject(error)
            }) 
        })
    }  
        
}