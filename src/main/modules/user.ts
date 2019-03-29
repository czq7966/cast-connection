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
    isSendingStream(): boolean
    sendStream(stream: MediaStream): Promise<any> 
    getStreamRoom(): IRoom
    syncHello():  Promise<any>
    hasSendStream(): boolean
    hasRedvStream(): boolean
    hasStream(): boolean
    leaveRoom(): Promise<any>
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
    }
    onStatesChange = (values: Cmds.Common.Helper.IStateChangeValues) => {
        this.item.states = values.newStates;
        Services.Cmds.User.onStateChange(this.instanceId,  this.item, values);
    }

    // Command
    onPreventRoot = (cmd: Cmds.Common.ICommand): any => {
        let user = cmd.data.props.user as Cmds.IUser;
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;

        switch(cmdId) {
            case Cmds.ECommandId.adhoc_logout:
                if (type === Cmds.ECommandType.resp)
                    return;
                if (user && user.id !== this.item.id) 
                    return Cmds.Common.EEventEmitterEmit2Result.preventRoot;
                break;
            case Cmds.ECommandId.room_close:
                if (user && user.room && user.room.id !== this.room.item.id) 
                    return Cmds.Common.EEventEmitterEmit2Result.preventRoot;                
                break;               
            default: 
                user = cmd.data.props.user as Cmds.IUser;            
                if (user && (user.id !== this.item.id || user.room.id !== this.room.item.id)) {
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
            case Cmds.ECommandId.room_leave:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.RoomLeave.User.onAfterRoot.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomLeave.User.onAfterRoot.resp(this, cmd as any) : null    
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
    isSendingStream(): boolean {
        return this.states.isset(Cmds.EUserState.stream_room_sending)
    }
    sendStream(stream: MediaStream): Promise<any> {
        if (this.isSendingStream() ) {
            return Promise.reject({result: false, msg: "stream is sending"})
        } else if (!stream) {
            let mStreamRoom = Services.Modules.User.getStreamRoom(this);
            if (mStreamRoom) {
                let mUser = mStreamRoom.me();                                
                return Services.Cmds.StreamWebrtcStreams.sendingStream(mUser.getPeer().streams, null);   
            } else {
                return Promise.resolve()
            }
        } else {
            return new Promise((resolve, reject) => {
                Services.Cmds.StreamRoomOpen.open(this.instanceId, this.item)
                .then(() => {
                    let mStreamRoom = Services.Modules.User.getStreamRoom(this);
                    let mUser = mStreamRoom.me();                    
                    Services.Cmds.StreamWebrtcStreams.sendingStream(mUser.getPeer().streams, stream)
                    .then((data) => {
                        let onInactive = () => {
                            stream.removeEventListener('inactive', onInactive)
                            this.notDestroyed && 
                            Services.Cmds.StreamWebrtcStreams.sendingStream(mUser.getPeer().streams, null);   
                        } 
                        stream.addEventListener('inactive', onInactive);
                        resolve(data)
                    })
                    .catch(err => {
                        reject(err)
                    })
                })
                .catch(err => {
                    reject(err)
                })
            })
        }
    }
    getStreamRoom(): IRoom {
        return Services.Modules.User.getStreamRoom(this);
    }
    syncHello(): Promise<any> {
        return Services.Cmds.User.syncHello(this.instanceId, this.item)
    }
    hasSendStream(): boolean {
        return this.peer.streams.sends.count() > 0
    }
    hasRedvStream(): boolean {
        return this.peer.streams.recvs.count() > 0
    }
    hasStream(): boolean {
        return this.hasRedvStream() || this.hasSendStream()
    }
    leaveRoom(): Promise<any> {
        return Services.Cmds.RoomLeave.leave(this.instanceId, this.item.room)
    }
}