import * as Cmds from "../../cmds";
import * as Services from '../../services'

import { IPeer } from "./peer";

export interface IStreamResolution {
    width: number,
    height: number
}

export interface IStreams extends Cmds.Common.ICommandRooter {
    peer: IPeer
    sends: Cmds.Common.Helper.KeyValue<MediaStream>
    recvs: Cmds.Common.Helper.KeyValue<MediaStream>
    resolutions: Cmds.Common.Helper.KeyValue<IStreamResolution>
}

export class Streams extends Cmds.Common.CommandRooter {
    peer: IPeer
    sends: Cmds.Common.Helper.KeyValue<MediaStream>
    recvs: Cmds.Common.Helper.KeyValue<MediaStream>
    resolutions: Cmds.Common.Helper.KeyValue<IStreamResolution>
    constructor(peer: IPeer) {
        super(peer.instanceId);
        this.peer = peer;
        this.sends = new Cmds.Common.Helper.KeyValue<MediaStream>();
        this.recvs = new Cmds.Common.Helper.KeyValue<MediaStream>();
        this.resolutions = new  Cmds.Common.Helper.KeyValue<IStreamResolution>();
        this.initEvents();
    }
    destroy() {
        this.unInitEvents();
        this.sends.clear();
        this.recvs.clear();
        this.resolutions.clear();
        delete this.sends;
        delete this.recvs;     
        delete this.resolutions;
        super.destroy();
    }
    initEvents() {
        this.eventRooter.setParent(this.peer.eventRooter);        
        this.eventRooter.onBeforeRoot.add(this.onBeforeRoot)
        this.eventRooter.onAfterRoot.add(this.onAfterRoot)
    }
    unInitEvents() {
        this.eventRooter.onBeforeRoot.remove(this.onBeforeRoot)
        this.eventRooter.onAfterRoot.remove(this.onAfterRoot)
        this.eventRooter.setParent();           
    }  

    // Command
    onBeforeRoot = (cmd: Cmds.Common.ICommand): any => {
        let cmdId = cmd.data.cmdId;
        let type = cmd.data.type;
        switch(cmdId) {
            case Cmds.ECommandId.stream_webrtc_resolution:
                    Services.Cmds.StreamWebrtcResolution.Streams.onBeforeRoot.req(this, cmd as any)
                break;             
            case Cmds.ECommandId.stream_webrtc_video_constraints:
                    Services.Cmds.StreamWebrtcVideoConstraints.Streams.onBeforeRoot.req(this, cmd as any)
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
                Services.Cmds.Network.Disconnect.Streams.onAfterRoot.req(this, cmd as any);
                break;
            case Cmds.ECommandId.adhoc_logout:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.Logout.Streams.onAfterRoot.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?            
                    Services.Cmds.Logout.Streams.onAfterRoot.resp(this, cmd as any) : null
                break;
            case Cmds.ECommandId.room_close:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.RoomClose.Streams.onAfterRoot.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomClose.Streams.onAfterRoot.resp(this, cmd as any) : null     
                break; 
            case Cmds.ECommandId.room_leave:
                type === Cmds.ECommandType.req ?
                    Services.Cmds.RoomLeave.Streams.onAfterRoot.req(this, cmd as any) :
                type === Cmds.ECommandType.resp ?
                    Services.Cmds.RoomLeave.Streams.onAfterRoot.resp(this, cmd as any) : null    
                break;  
            default:
                if (cmdId.indexOf(Cmds.Command_stream_webrtc_on_prefix) === 0) {
                    Services.Cmds.StreamWebrtcEvents.Streams.onAfterRoot.req(this, cmd)
                }               
                break;
        }        
    }
}