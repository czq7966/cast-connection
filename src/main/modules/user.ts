import * as Cmds from "../cmds";
import * as Network from '../network'
import * as Services from '../services'
// import { Peer, ERTCPeerEvents } from "../peer";
import { IBase, Base } from "../base";
import { Room, IRoom } from "./room";
import { Streams } from "./streams";
import { Debug } from "../cmds/common/helper";
import { Peer, IPeer } from "./peer";

var Tag = "ModuleUser"
export interface IUserParams {
    // socketId: string,
    // isOwner: boolean,
    // isReady?: boolean;
    // signaler?: Network.Signaler;
    // peer?: Peer;
    // room?: IRoom;
    // // stream?: MediaStream;
    // streams?: Streams;
    // video?: HTMLVideoElement;
}

export interface IUser extends IBase , IUserParams {
    // initEvents()
    // unInitEvents()
    // onMessage(query: IUserQuery)
    // onReady(query: IUserQuery)
    // stopSharing(): Promise<any>
    // imReady()
    // sayHello(to?: string)
    // addSendStream(stream: MediaStream)
    // addSendStreams(streams: Array<MediaStream>)
    // doICE()
    // sendMessage(msg: any)
    // close()

    item: Cmds.IUser;
    states: Cmds.Common.Helper.StateMachine<Cmds.EUserState>;
    room: IRoom;
    peer: IPeer;
    streams: Streams;    
    getPeer(): IPeer
}

export class User extends Cmds.Common.Base implements IUser  {
    // socketId: string;    
    // isOwner: boolean;
    // isReady: boolean;
    // signaler: Signaler;
    item: Cmds.IUser;
    peer: IPeer;
    room: IRoom;
    streams: Streams;
    states: Cmds.Common.Helper.StateMachine<Cmds.EUserState>;
    constructor(room: IRoom, user: Cmds.IUser) {
        super(room.instanceId);
        this.states = new Cmds.Common.Helper.StateMachine<Cmds.EUserState>();      
        this.item = Object.assign({}, user);
        this.room = room;
        this.streams = new Streams(this);        
        this.states.states = this.item.states;

        // this.peer = new Peer(this);
        // this.room = user.room;
        this.initEvents();
    }
    destroy() {        
        this.unInitEvents();
        this.delPeer();        
        this.streams.destroy();
        delete this.streams;
        delete this.room;
        delete this.item;
        delete this.peer;
        super.destroy();
    }
 
    initEvents() {
        this.states.onChange.add(this.onStatesChange)
        this.room.eventEmitter.addListener(Cmds.ECommandEvents.onDispatched, this.onDispatched_Command);
        this.room.eventEmitter.addListener(Cmds.ECommandEvents.onBeforeDispatched, this.onBeforeDispatched_Command);        

        // this.eventEmitter.addListener(ECustomEvents.message, this.onMessage);    

        // this.peer.eventEmitter.addListener(ERTCPeerEvents.oniceconnectionstatechange, this.onIceConnectionStateChange);
        // this.peer.eventEmitter.addListener(ERTCPeerEvents.onrecvstream, this.onRecvStream);



    }
    unInitEvents() {
        this.states.onChange.remove(this.onStatesChange);
        this.room.eventEmitter.removeListener(Cmds.ECommandEvents.onDispatched, this.onDispatched_Command);
        this.room.eventEmitter.removeListener(Cmds.ECommandEvents.onBeforeDispatched, this.onBeforeDispatched_Command);

        // this.eventEmitter.removeListener(ECustomEvents.message, this.onMessage); 

        // this.peer.eventEmitter.removeListener(ERTCPeerEvents.oniceconnectionstatechange, this.onIceConnectionStateChange);
        // this.peer.eventEmitter.removeListener(ERTCPeerEvents.onrecvstream, this.onRecvStream);
    }

    onStatesChange = (chgStates: Cmds.EUserState, oldStates: Cmds.EUserState, newStates: Cmds.EUserState) => {
        this.item.states = newStates;
    }

    // Command
    onDispatched_Command = (cmd: Cmds.Common.ICommand) => {
        cmd.preventDefault = false;
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.stream_webrtc_sdp:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.StreamWebrtcSdp.User.onDispatched.req(this, cmd as any ) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.StreamWebrtcSdp.User.onDispatched.resp(this, cmd as any) : null    
                break;  
            default:
                break;
        }
        !!cmd.preventDefault !== true && this.eventEmitter.emit(Cmds.ECommandEvents.onDispatched, cmd);
    }
    onBeforeDispatched_Command = (cmd: Cmds.Common.ICommand) => {
        this.eventEmitter.emit(Cmds.ECommandEvents.onBeforeDispatched, cmd);
        if (!!cmd.preventDefault === true) return;

        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.network_disconnect:
                Debug.log(Tag, 'onBeforeDispatched', cmdId)
                break;
            default:
                break;
        }        
    }     

    getPeer(): IPeer {
        if (!this.peer) {
            this.peer = new Peer(this)
        }
        return this.peer;
    }
    delPeer() {
        this.peer && this.peer.destroy();
        delete this.peer;
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