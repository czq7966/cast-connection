import { Peer, ERTCPeerEvents } from "../peer";
import { IBase, Base } from "../base";
import { Room } from "./room";
import { Streams } from "./streams";
import * as Cmds from "../cmds";
import * as Network from '../network'

export interface IUserParams {
    socketId: string,
    isOwner: boolean,
    isReady?: boolean;
    signaler?: Network.Signaler;
    peer?: Peer;
    room?: Room;
    // stream?: MediaStream;
    streams?: Streams;
    video?: HTMLVideoElement;
}

export interface IUser extends IBase , IUserParams {
    initEvents()
    unInitEvents()
    // onMessage(query: IUserQuery)
    // onReady(query: IUserQuery)
    stopSharing(): Promise<any>
    imReady()
    sayHello(to?: string)
    addSendStream(stream: MediaStream)
    addSendStreams(streams: Array<MediaStream>)
    doICE()
    sendMessage(msg: any)
    close()
}

export class User extends Cmds.Common.Base  {
    // socketId: string;    
    // isOwner: boolean;
    // isReady: boolean;
    // signaler: Signaler;
    item: Cmds.IUser;
    // peer: Peer;
    room: Room;
    streams: Streams;
    constructor(room: Room, user: Cmds.IUser) {
        super();
        this.item = Object.assign({}, user);
        this.room = room;
        this.streams = new Streams(this);

        // this.peer = new Peer(this);
        // this.room = user.room;
        this.initEvents();
    }
    destroy() {        
        this.unInitEvents();
        this.streams.destroy();
        delete this.streams;
        delete this.room;
        delete this.item;
        super.destroy();
    }
 
    initEvents() {
        this.room.eventEmitter.addListener(Cmds.ECommandEvents.onDispatched, this.onDispatched_Command);
        this.room.eventEmitter.addListener(Cmds.ECommandEvents.onBeforeDispatched, this.onBeforeDispatched_Command);

        // this.eventEmitter.addListener(ECustomEvents.message, this.onMessage);    

        // this.peer.eventEmitter.addListener(ERTCPeerEvents.oniceconnectionstatechange, this.onIceConnectionStateChange);
        // this.peer.eventEmitter.addListener(ERTCPeerEvents.onrecvstream, this.onRecvStream);



    }
    unInitEvents() {
        this.room.eventEmitter.removeListener(Cmds.ECommandEvents.onDispatched, this.onDispatched_Command);
        this.room.eventEmitter.removeListener(Cmds.ECommandEvents.onBeforeDispatched, this.onBeforeDispatched_Command);

        // this.eventEmitter.removeListener(ECustomEvents.message, this.onMessage); 

        // this.peer.eventEmitter.removeListener(ERTCPeerEvents.oniceconnectionstatechange, this.onIceConnectionStateChange);
        // this.peer.eventEmitter.removeListener(ERTCPeerEvents.onrecvstream, this.onRecvStream);
    }

    // Command
    onDispatched_Command = (cmd: Cmds.Common.ICommand) => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {

            default:
                break;
        }
        this.eventEmitter.emit(Cmds.ECommandEvents.onDispatched, cmd);
    }
    onBeforeDispatched_Command = (cmd: Cmds.Common.ICommand) => {
        this.eventEmitter.emit(Cmds.ECommandEvents.onBeforeDispatched, cmd);

        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.network_disconnect:
                console.log('11111111111111')

                break;
            default:
                break;
        }        
    }     

    // close() {

    //     this.peer.close();
    // }       
    // onMessage = (query: IUserQuery) => {
    //     if (query.from == this.socketId) {
    //         let msg = query.msg as ISignalerMessage;
    //         switch (msg.type) {
    //             case ESignalerMessageType.offer :
    //                 console.log('on offer:', this.socketId)
    //                 this.peer.eventEmitter.emit(ESignalerMessageType.offer, msg.data)
    //                 break;
    //             case ESignalerMessageType.answer:
    //                 console.log('on answer:', this.socketId)
    //                 this.peer.eventEmitter.emit(ESignalerMessageType.answer, msg.data)
    //                 break;
    //             case ESignalerMessageType.candidate:
    //                 console.log('on candidate:', this.socketId)
    //                 this.peer.eventEmitter.emit(ESignalerMessageType.candidate, msg.data)
    //                 break;
    //             case ESignalerMessageType.ready:
    //                 console.log('on ready:', this.socketId)
    //                 this.onReady(query)
    //                 break;
    //             default:
    //                 break;
    //         }
    //     }
    // }

    // onReady(query: IUserQuery) {
    //     this.isReady = true;
    //     this.room.sendStreamsToUser(this);
    // }
    // onIceConnectionStateChange = (ev: Event) => {
    //     this.room.eventEmitter.emit(ERTCPeerEvents.oniceconnectionstatechange, ev, this, this.room);
    // }
    // onRecvStream = (stream: MediaStream) => {
    //     this.streams.addRecvStream(stream);
    //     this.room.eventEmitter.emit(ERTCPeerEvents.onrecvstream, stream, this, this.room);
    // }

    // stopSharing(): Promise<any> {
    //     return this.streams.stopSendStreams();
    // }

    // imReady(): Promise<any> {
    //     let msg: ISignalerMessage = {
    //         type: ESignalerMessageType.ready
    //     }
    //     let query: IUserQuery = {
    //         roomid: this.room.roomid,
    //         from: this.socketId,
    //         isOwner: this.isOwner,
    //         msg: msg
    //     }
    //     return this.signaler.sendMessage(query)
    // }
    // sayHello(to?: string): Promise<any> {
    //     let msg: ISignalerMessage = {
    //         type: ESignalerMessageType.hello    
    //     }
    //     let query: IUserQuery = {
    //         roomid: this.room.roomid,
    //         isOwner: this.isOwner,
    //         from: this.socketId,
    //         to: to,
    //         msg: msg                
    //     }
    //     return this.signaler.sendMessage(query);
    // }   
    // sendMessage(msg: any): Promise<any> {
    //     let query: IUserQuery = {
    //         roomid: this.room.roomid,
    //         to:  this.socketId,
    //         msg: msg
    //     }
    //     return this.signaler.sendMessage(query)
    // }    
    // addSendStream(stream: MediaStream) {
    //     if (stream && !this.streams.getSendStream(stream.id)) {
    //         this.streams.addSendStream(stream);
    //         this.doICE();
    //     }
    // } 
    // addSendStreams(streams: Array<MediaStream>) {
    //     streams.forEach(stream => {
    //         this.addSendStream(stream);
    //     })

    // }     
    // doICE() {
    //     if (this.isReady) {
    //         this.streams.getSendStreams().forEach(stream => {
    //             this.peer.doICE(stream);
    //         })
    //     }
    // }
    // isCurrUser(): boolean {
    //     return this.socketId === this.signaler.id();
    // }
}