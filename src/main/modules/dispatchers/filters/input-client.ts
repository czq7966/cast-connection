
import * as Cmds from "../../../cmds";
import * as Dts from "../../../declare";
import * as Network from '../../../network'
import * as Services from '../../../services'
import { IDispatcher, Dispatcher } from "../dispatcher";
import { DispatcherFilter, IDispatcherFilter } from "../dispatcher-filter";

export interface IInputClientFilter extends IDispatcherFilter {
    wsClient: Network.IClient
    setEnabled(enalbed: boolean)
} 

export class InputClientFilter extends DispatcherFilter implements IInputClientFilter {
    wsClient: Network.IClient
    enabled: boolean
    timeoutHandler: number
    constructor(dispatcher: IDispatcher, url: string) {
        super(dispatcher);
        this.wsClient = new Network.Signaler(url);
        this.initEvents();
    }     
    destroy() {
        this.unInitEvents();
        this.wsClient.destroy();
        delete this.wsClient;
        delete this.timeoutHandler;
        super.destroy();
    }

    initEvents() {
        this.wsClient.eventEmitter.addListener(Dts.EClientSocketEvents.connect, this.onConnect);
        this.wsClient.eventEmitter.addListener(Dts.EClientSocketEvents.connecting, this.onConnecting);
        this.wsClient.eventEmitter.addListener(Dts.EClientSocketEvents.disconnect, this.onDisconnect);
        this.recvRooter.setParent(this.dispatcher.recvFilter);        
        this.recvRooter.onAfterRoot.add(this.onAfterRoot_recv)
    }
    unInitEvents() {
        this.wsClient.eventEmitter.removeListener(Dts.EClientSocketEvents.connect, this.onConnect);
        this.wsClient.eventEmitter.removeListener(Dts.EClientSocketEvents.connecting, this.onConnecting);
        this.wsClient.eventEmitter.removeListener(Dts.EClientSocketEvents.disconnect, this.onDisconnect);        
        this.recvRooter.onAfterRoot.remove(this.onAfterRoot_recv)
        this.recvRooter.setParent();   

        clearTimeout(this.timeoutHandler) 
    }
    onConnect = () => {
        let cmd: Cmds.ICommandData<any> = {
            cmdId: Dts.ECommandId.network_inputclient_connect,
            props: {}
        }
        this.dispatcher.onCommand(cmd)
    }
    onConnecting = () => {
        let cmd: Cmds.ICommandData<any> = {
            cmdId: Dts.ECommandId.network_inputclient_connecting,
            props: {}
        }
        this.dispatcher.onCommand(cmd)        
    }
    onDisconnect = () => {
        let cmd: Cmds.ICommandData<any> = {
            cmdId: Dts.ECommandId.network_inputclient_disconnect,
            props: {}
        }
        this.dispatcher.onCommand(cmd)
    }

    setEnabled(enabled: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            this.enabled = enabled;
            if (this.enabled) {
                if(!this.wsClient.connecting()) {
                    this.wsClient.connect()
                    .catch(err => {
                        reject(err)
                    })
                    .then(() => {
                        resolve()
                    })
                } else {
                    reject('is connecting')
                }                
                // if(!this.wsClient.connecting() && !this.timeoutHandler) {
                //     this.wsClient.connect()
                //     .catch(err => {
                //         this.timeoutHandler = setTimeout(() => {
                //             clearTimeout(this.timeoutHandler) 
                //             this.timeoutHandler = 0;
                //             // this.setEnabled(this.enabled)                    
                //         }, 5000) as any;
                //     })
                // } else {

                // }
            } else {
                this.wsClient.disconnect();
                clearTimeout(this.timeoutHandler)
                this.timeoutHandler = 0;
                resolve()
            }
        })

    }
    onAfterRoot_recv = (data: Cmds.ICommandData<any>): any => {
        let cmdId = data.cmdId;
        switch(cmdId) {
            case Cmds.ECommandId.stream_webrtc_io_input:     
                Services.Cmds.StreamIOInput.InputClient.onAfterRoot.req(this, data)
                return Cmds.Common.EEventEmitterEmit2Result.preventRoot; 
                break;
            default:
     
                break;            
        }
    }
    sendCommand(cmd: Cmds.ICommandData<any>): Promise<any> {
        if (this.enabled) {
            if (this.wsClient.connected()) {
                let promise = this.wsClient.sendCommand(cmd)
                promise
                .catch(err => {
                    adhoc_cast_connection_console.log(err)
                })
                return promise;
            } else {
                return this.setEnabled(this.enabled)
            }
        } else {
            return Promise.reject('Disabled')
        }

    }

    
};