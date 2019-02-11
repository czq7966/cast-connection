import * as Cmds from "../../cmds";
import * as Services from '../../services'

import { IPeer } from "./peer";

export interface IStreams extends Cmds.Common.ICommandDispatcher {
    peer: IPeer
    sends: Cmds.Common.Helper.KeyValue<MediaStream>
    recvs: Cmds.Common.Helper.KeyValue<MediaStream>
}

export class Streams extends Cmds.Common.CommandRooter {
    peer: IPeer
    sends: Cmds.Common.Helper.KeyValue<MediaStream>
    recvs: Cmds.Common.Helper.KeyValue<MediaStream>
    constructor(peer: IPeer) {
        super(peer.instanceId);
        this.peer = peer;
        this.sends = new Cmds.Common.Helper.KeyValue<MediaStream>();
        this.recvs = new Cmds.Common.Helper.KeyValue<MediaStream>();
    }
    destroy() {
        this.sends.clear();
        this.recvs.clear();
        delete this.sends;
        delete this.recvs;     
        super.destroy();
    }
    initEvents() {
        this.eventRooter.setParent(this.peer.eventRooter);        
        this.eventRooter.onBeforeRoot.add(this.onBeforeRoot)
        this.eventRooter.onAfterRoot.add(this.onAfterRoot)

        // this.peer.eventEmitter.addListener(Cmds.ECommandDispatchEvents.onDispatched, this.Command_onDispatched);
        // this.peer.eventEmitter.addListener(Cmds.ECommandDispatchEvents.onBeforeDispatched, this.Command_onBeforeDispatched);
        // this.peer.eventEmitter.addListener(Cmds.ECommandEvents.onCommand, this.Command_onCommand)
        // this.peer.eventEmitter.addListener(Cmds.ECommandEvents.onBeforeCommand, this.Command_onBeforeCommand)
    }
    unInitEvents() {
        this.eventRooter.onBeforeRoot.remove(this.onBeforeRoot)
        this.eventRooter.onAfterRoot.remove(this.onAfterRoot)
        this.eventRooter.setParent();           
        // this.peer.eventEmitter.removeListener(Cmds.ECommandDispatchEvents.onDispatched, this.Command_onDispatched);
        // this.peer.eventEmitter.removeListener(Cmds.ECommandDispatchEvents.onBeforeDispatched, this.Command_onBeforeDispatched);
        // this.peer.eventEmitter.removeListener(Cmds.ECommandEvents.onCommand, this.Command_onCommand)
        // this.peer.eventEmitter.removeListener(Cmds.ECommandEvents.onBeforeCommand, this.Command_onBeforeCommand)
    }  

    // Command
    onBeforeRoot = (cmd: Cmds.Common.ICommand): any => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            default:
                break;
        }
    }
    onAfterRoot = (cmd: Cmds.Common.ICommand): any => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.network_disconnect:
                break;
            default:
                break;
        }        
    }  
    
    
    // addSend(stream: MediaStream) {
    //     this.sends.add(stream.id, stream);
    //     let onInactive = (ev) => {
    //         stream.removeEventListener('inactive', onInactive);
    //         if (this.notDestroyed) {
    //             this.onSendStreamInactive(stream);
    //             this.removeSendStream(id)
    //         }                 
    //     }
    //     stream.addEventListener('inactive', onInactive);     
                        
    // }
    // //Send Stream
    // addSendStream(stream: MediaStream) {        
    //     if (stream && !this.getSendStream(stream.id)) {
    //         let id = stream.id;
    //         let onInactive = (ev) => {
    //             stream.removeEventListener('inactive', onInactive);
    //             if (this.notDestroyed) {
    //                 this.onSendStreamInactive(stream);
    //                 this.removeSendStream(id)
    //             }                 
    //         }
    //         stream.addEventListener('inactive', onInactive);            
    //         this.sendStreams[id] = stream;            
    //     }
    // }
    // removeSendStream(id: string) {
    //     delete this.sendStreams[id];
    // }    
    // getSendStream(id: string): MediaStream {
    //     return this.sendStreams[id];
    // }
    // getSendStreams(): Array<MediaStream> {
    //     let result = [];
    //     Object.keys(this.sendStreams).forEach(id => {
    //         result.push(this.sendStreams[id])
    //     })
    //     return result;
    // }
    // onSendStreamInactive(stream: MediaStream) {
    //     this.eventEmitter.emit(ERTCPeerEvents.onsendstreaminactive, stream, this)
    // }

    // stopSendStreams(): Promise<any> {
    //     let promises = [];
    //     Object.keys(this.sendStreams).forEach(id => {
    //         promises.push(this.stopSendStream(id));
    //     });
    //     if (promises.length > 0) {
    //         return Promise.all(promises);
    //     } else {
    //         return Promise.resolve();
    //     }        
    // }
    // stopSendStream(id: string): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         let stream = this.getSendStream(id);
    //         if (stream) {
    //             let onInactive = () => {
    //                 stream.removeEventListener('inactive', onInactive);
    //                 resolve();
    //             }             
    //             stream.addEventListener('inactive', onInactive);                
    //             stream.getTracks().forEach(track => {
    //                 track.stop();
    //             })
    //         } else {
    //             resolve();
    //         }       
    //     })
    // }
    // // Recv Stream
    // addRecvStream(stream: MediaStream) {        
    //     if (stream && !this.getRecvStream(stream.id)) {
    //         let id = stream.id;
    //         let onInactive = (ev) => {
    //             stream.removeEventListener('inactive', onInactive);
    //             if (this.notDestroyed) {
    //                 this.onRecvStreamInactive(stream);
    //                 this.removeRecvStream(id)
    //             }                 
    //         }
    //         stream.addEventListener('inactive', onInactive);            
    //         this.recvStreams[id] = stream;   
    //         this.eventEmitter.emit(ERTCPeerEvents.onrecvstream, stream);
    //     }
    // }
    // removeRecvStream(id: string) {
    //     delete this.recvStreams[id];
    // }    
    // getRecvStream(id: string): MediaStream {
    //     return this.recvStreams[id];
    // }
    // getRecvStreams(): Array<MediaStream> {
    //     let result = [];
    //     Object.keys(this.recvStreams).forEach(id => {
    //         result.push(this.recvStreams[id])
    //     })
    //     return result;
    // }    
    // onRecvStreamInactive(stream: MediaStream) {
    //     this.eventEmitter.emit(ERTCPeerEvents.onrecvstreaminactive, stream, this)
    // }

    // stopRecvStreams(): Promise<any> {
    //     let promises = [];
    //     Object.keys(this.sendStreams).forEach(id => {
    //         promises.push(this.stopRecvStream(id));
    //     });
    //     if (promises.length > 0) {
    //         return Promise.all(promises);
    //     } else {
    //         return Promise.resolve();
    //     }        
    // }
    // stopRecvStream(id: string): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         let stream = this.getRecvStream(id);
    //         if (stream) {
    //             let onInactive = () => {
    //                 stream.removeEventListener('inactive', onInactive);
    //                 resolve();
    //             }             
    //             stream.addEventListener('inactive', onInactive);                
    //             stream.getTracks().forEach(track => {
    //                 track.stop();
    //             })
    //         } else {
    //             resolve();
    //         }       
    //     })
    // }    
}