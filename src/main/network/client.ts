import * as io from 'socket.io-client'
import * as Dts from '../declare';
import { EventEmitter } from 'events';
export interface IClient {
    eventEmitter: EventEmitter;
    socket: SocketIOClient.Socket;
    url: string;    
    destroy()
    id(): string 
    connected(): boolean
    connecting(): boolean 
    connect(url?: string): Promise<any>
    disconnect()
    sendCommand(cmd: any): Promise<any>
}

export class Client {
    eventEmitter: EventEmitter;
    socket: SocketIOClient.Socket;
    url: string;
    _connecting: boolean;

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
    connecting(): boolean {
        return this._connecting;
    }

    connect(url?: string): Promise<any> {
        if (this.connected()) {
            return Promise.resolve()
        }
        this._connecting = true;
        let promise = new Promise((resolve, reject) => {
            delete this.socket;
            url = url || this.url || "";
            url = url[url.length - 1] !== '/' ? url : url.substr(0, url.length - 1);            
            this.url = url || this.url;
            this.socket = io(this.url, {
                autoConnect: false,
                reconnection: false,
                transports: ['websocket']
            });        
            this.initEvents(this.socket);

            this.socket.on(Dts.EClientSocketEvents.connect, () => {
                resolve();
            })
            this.socket.on(Dts.EClientSocketEvents.connect_error, (error) => {
                reject(error);
            })   
            this.socket.once(Dts.EClientSocketEvents.error, (error) => {
                reject(error);
            })        
            this.socket.connect();
        })  
        promise.then(() => {this._connecting = false}).catch(() => {this._connecting = false})
        return promise;    
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
                    if (value === Dts.EClientSocketEvents.error) {
                        this.eventEmitter.emit(Dts.EClientSocketEvents.message_error, ...args)
                    } else 
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

    sendCommand(cmd: any): Promise<any> {
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


    // openRoom(query: IUserQuery, url?: string): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         this.connect(url)
    //         .then(() => {
    //             this.socket.emit(ECustomEvents.openRoom, query, (result: boolean, msg: any) => {
    //                 if (result) {
    //                     console.log('open room success: ' + this.socket.id);
    //                     resolve(msg)                    
    //                 } else {
    //                     console.log('open room failed: ' + msg);
    //                     reject(msg)
    //                 }
    //             })  
    //         })
    //         .catch(error => {
    //             reject(error)
    //         })
 
    //     })
    // }  

    // joinRoom(query: IUserQuery): Promise<string> {
    //     return new Promise((resolve, reject) => {
    //         this.connect()
    //         .then(() => {
    //             this.socket.emit(ECustomEvents.joinRoom, query, (result: boolean, msg: string) => {
    //                 if (result) {
    //                     console.log('join room success: ' + msg);
    //                     resolve(msg)                    
    //                 } else {
    //                     console.log('join room failed: ' + msg);
    //                     reject(msg)
    //                 }
    //             })  
    //         })
    //         .catch(error => {
    //             reject(error)
    //         }) 
    //     })
    // }

    // leaveRoom(query: IUserQuery): Promise<any> {
    //     if (this.connected) {
    //         return new Promise((resolve, reject) => {
    //                 this.socket.emit(ECustomEvents.leaveRoom, query, (result: boolean, msg: string) => {
    //                     if (result) {
    //                         console.log('leave room success: ' + msg);
    //                         this.eventEmitter.emit(ECustomEvents.leaveRoom, query)
    //                         resolve(msg)                    
    //                     } else {
    //                         console.log('leave room failed: ' + msg);
    //                         reject(msg)
    //                     }
    //                 })  
    //         })
    //     } 
    //     return Promise.resolve();
    // }    

    // sendMessage(query: IUserQuery): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         this.connect()
    //         .then(() => {
    //             this.socket.emit(ECustomEvents.message, query, (result: boolean, msg: string) => {
    //                 if (result) {
    //                     console.log('message success: ' + msg);
    //                     resolve(msg)                    
    //                 } else {
    //                     console.log('message failed: ' + msg);
    //                     reject(msg)
    //                 }
    //             })  
    //         })
    //         .catch(error => {
    //             reject(error)
    //         }) 
    //     })
    // }  
    

        
}