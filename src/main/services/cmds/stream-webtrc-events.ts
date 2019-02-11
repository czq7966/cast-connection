import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules/index'
import {StreamWebrtcCandidate } from './stream-webtrc-candidate'

var Tag = "Service-Cmds-StreamWebrtcEvents"
export class StreamWebrtcEvents {
    static Peer = {
        onAfterCommand: {
            req(peer: Modules.Webrtc.IPeer, data: Cmds.ICommandData<Cmds.ICommandReqDataProps>) {
                let cmdId = data.cmdId;
                let user = data.props.user;
                let args: any[] = user.extra;
                if (user.id === peer.user.item.id && user.room.id === peer.user.item.room.id) {
                    switch(cmdId) {
                        case Cmds.ECommandId.stream_webrtc_ontrack:
                            data.preventDispatch = true;
                            StreamWebrtcEvents.onCommand_track(peer, args[0]);
                            break;  
                        case Cmds.ECommandId.stream_webrtc_onstream:                
                            data.preventDispatch = true;
                            StreamWebrtcEvents.onCommand_stream(peer, args[0]);
                            break;                 
                        case Cmds.ECommandId.stream_webrtc_onaddstream:                
                            data.preventDispatch = true;
                            StreamWebrtcEvents.onCommand_addstream(peer, args[0]);
                            break;   
                        case Cmds.ECommandId.stream_webrtc_onrecvstream:
                            let stream = user.extra;
                            StreamWebrtcEvents.onCommand_recvstream(peer, stream);
                            break;

                        case Cmds.ECommandId.stream_webrtc_onicecandidate:
                            data.preventDispatch = true;
                            StreamWebrtcEvents.onCommand_icecandidate(peer, args[0]);
                            break; 
                        default:
                            break;
                    }  
                }                 
            }                    
        }      
    }      

    static dispatchEventCommand(peer: Modules.Webrtc.IPeer, extra: any, cmdId: Cmds.ECommandId) {
        let user = Object.assign({}, peer.user.item);
        user.extra = extra;
        let data: Cmds.ICommandData<Cmds.ICommandReqDataProps> = {
            cmdId: cmdId,
            props: {
                user: user
            }
        }
        peer.user.room.rooms.dispatcher.onCommand(data)        
    }

    static onCommand_track(peer: Modules.Webrtc.IPeer, ev: RTCTrackEvent) {
        let streams = ev.streams;
        streams.forEach(stream => {    
            !peer.streams.recvs.exist(stream.id) &&
            this.dispatchEventCommand(peer, stream, Cmds.ECommandId.stream_webrtc_onrecvstream);
        })
    }
    static onCommand_stream (peer: Modules.Webrtc.IPeer,ev: any)  {
        let stream = ev.stream as MediaStream;
        !peer.streams.recvs.exist(stream.id) &&
        this.dispatchEventCommand(peer, stream, Cmds.ECommandId.stream_webrtc_onrecvstream);        
    }
    static onCommand_addstream(peer: Modules.Webrtc.IPeer,ev: Event) {
        let stream = ev['stream'] as MediaStream;
        !peer.streams.recvs.exist(stream.id) &&
        this.dispatchEventCommand(peer, stream, Cmds.ECommandId.stream_webrtc_onrecvstream);
    }   
    static onCommand_recvstream(peer: Modules.Webrtc.IPeer, stream: MediaStream) {
        ServiceModules.Webrtc.Streams.addRecvStream(peer.streams, stream);
    }         

    static onCommand_icecandidate = (peer: Modules.Webrtc.IPeer, ev: RTCPeerConnectionIceEvent): Promise<any> => {
        let data;
        if (ev.candidate) {
            data = ev.candidate.toJSON();
        }
        return StreamWebrtcCandidate.candidate(peer.instanceId, peer.user.item, data);
    }
}