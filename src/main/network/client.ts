import * as io from 'socket.io-client'
import * as Dts from '../declare';
import { EventEmitter } from 'events';
import { ISignaler} from './signaler';
export interface IClient extends ISignaler {
    socket: SocketIOClient.Socket;
}

export class Client implements IClient {
    eventEmitter: EventEmitter;
    socket: SocketIOClient.Socket;
    _url: string;
    _path: string;    
    _connecting: boolean;

    constructor(url?: string, path?: string) {
        this.eventEmitter = new EventEmitter();
        this._url = url;   
        this._path = url;
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
    getUrl(): string {
        return this._url;
    }
    setUrl(value: string, path?: string) {
        this._url = value;
        this._path = path || this._path;
    }
    getPath(): string {
        return this._path;
    }
    setPath(value: string) {
        this._path = value;
    }    

    connected(): boolean {
        return this.socket && this.socket.connected
    }
    connecting(): boolean {
        return this._connecting;
    }

    connect(url?: string, path?: string): Promise<any> {
        if (this.connected()) {
            return Promise.resolve()
        }
        this._connecting = true;
        let promise = new Promise((resolve, reject) => {
            delete this.socket;
            url = url || this.getUrl() || "";
            url = url[url.length - 1] !== '/' ? url : url.substr(0, url.length - 1);  
            path = path || this.getPath();          
            this.setUrl(url || this.getUrl());
            this.socket = io.connect(this.getUrl(), {
                autoConnect: false,
                reconnection: false,
                transports: ['websocket'],
                rejectUnauthorized: true,
                path: path
            });        
            this.socket.compress(true);
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
                    // adhoc_cast_connection_console.log('Client Event:', value, ...args)
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
                        adhoc_cast_connection_console.log('command success');
                        resolve()                    
                    } else {
                        adhoc_cast_connection_console.log('command failed' );
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
