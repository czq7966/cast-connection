import * as Cmds from "../cmds";
import * as Network from '../network'
import * as Services from '../services'
import * as Webrtc from './webrtc'
// import { Peer, ERTCPeerEvents } from "../peer";
import { IBase, Base } from "../base";
import { Room, IRoom } from "./room";
import { Debug } from "../cmds/common/helper";


var Tag = "ModuleUser"

export interface IUser extends Cmds.Common.ICommandRooter {
    item: Cmds.IUser;
    states: Cmds.Common.Helper.StateMachine<Cmds.EUserState>;
    room: IRoom;
    peer: Webrtc.IPeer;
    getPeer(): Webrtc.IPeer
}

export class User extends Cmds.Common.CommandRooter implements IUser  {
    item: Cmds.IUser;
    peer: Webrtc.IPeer;
    room: IRoom;
    states: Cmds.Common.Helper.StateMachine<Cmds.EUserState>;
    constructor(room: IRoom, user: Cmds.IUser) {
        super(room.instanceId);
        this.states = new Cmds.Common.Helper.StateMachine<Cmds.EUserState>();      
        this.item = Object.assign({}, user);
        this.room = room;
        this.states.states = this.item.states;

        this.getPeer();
        this.initEvents();
    }
    destroy() {        
        this.unInitEvents();
        this.delPeer();        
        delete this.room;
        delete this.item;
        delete this.peer;
        super.destroy();
    }
 
    initEvents() {
        this.eventRooter.setParent(this.room.eventRooter);        
        this.eventRooter.onPreventRoot.add(this.onPreventRoot)
        this.eventRooter.onBeforeRoot.add(this.onBeforeRoot)
        this.eventRooter.onAfterRoot.add(this.onAfterRoot)
        this.states.onChange.add(this.onStatesChange)
    }
    unInitEvents() {
        this.states.onChange.remove(this.onStatesChange);
        this.eventRooter.onPreventRoot.remove(this.onPreventRoot)
        this.eventRooter.onBeforeRoot.remove(this.onBeforeRoot)
        this.eventRooter.onAfterRoot.remove(this.onAfterRoot)
        this.eventRooter.setParent();   

        // this.room.eventEmitter.removeListener(Cmds.ECommandDispatchEvents.onDispatched, this.Command_onDispatched);
        // this.room.eventEmitter.removeListener(Cmds.ECommandDispatchEvents.onBeforeDispatched, this.Command_onBeforeDispatched);

        // this.eventEmitter.removeListener(ECustomEvents.message, this.onMessage); 

        // this.peer.eventEmitter.removeListener(ERTCPeerEvents.oniceconnectionstatechange, this.onIceConnectionStateChange);
        // this.peer.eventEmitter.removeListener(ERTCPeerEvents.onrecvstream, this.onRecvStream);
    }

    onStatesChange = (chgStates: Cmds.EUserState, oldStates: Cmds.EUserState, newStates: Cmds.EUserState) => {
        this.item.states = newStates;
        Services.Cmds.User.onStateChange(this.instanceId, this.item, chgStates, oldStates, newStates);
    }

    // Command
    onPreventRoot = (cmd: Cmds.Common.ICommand): any => {
        let user = cmd.data.props.user as Cmds.IUser;
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.adhoc_logout:
                if (type === Cmds.ECommandType.resp)
                    break;
            case Cmds.ECommandId.room_close:
                if (user && user.room && user.room.id !== this.room.item.id) {
                    return Cmds.Common.EEventEmitterEmit2Result.preventRoot;
                }
                break;
            default:
                user = cmd.data.props.user as Cmds.IUser;            
                if (user && user.id !== this.item.id) {
                    return Cmds.Common.EEventEmitterEmit2Result.preventRoot;
                }            
                break;            
        }
    }

    onBeforeRoot = (cmd: Cmds.Common.ICommand): any => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.stream_webrtc_sdp:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.StreamWebrtcSdp.User.onBeforeRoot.req(this, cmd as any ) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.StreamWebrtcSdp.User.onBeforeRoot.resp(this, cmd as any) : null    
                break;  
            case Cmds.ECommandId.user_state_onchange:
                    Services.Cmds.UserStateOnChange.User.onBeforeRoot.req(this, cmd as any);
                break;
            default:
                break;
        }
    }
    onAfterRoot = (cmd: Cmds.Common.ICommand): any => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;

        switch(cmdId) {
            case Cmds.ECommandId.network_disconnect: 
                Services.Cmds.Network.Disconnect.User.onAfterRoot.req(this, cmd as any);
                break;
            case Cmds.ECommandId.adhoc_logout:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.Logout.User.onAfterRoot.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?            
                    Services.Cmds.Logout.User.onAfterRoot.resp(this, cmd as any) : null
                break; 
            case Cmds.ECommandId.room_close:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.RoomClose.User.onAfterRoot.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomClose.User.onAfterRoot.resp(this, cmd as any) : null     
                break;                                
            default:
                break;
        }        
    }     

    getPeer(): Webrtc.IPeer {
        if (!this.peer) {
            this.peer = new Webrtc.Peer(this)
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