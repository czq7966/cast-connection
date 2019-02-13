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
}