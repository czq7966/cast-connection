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
                let stream: MediaStream;
                if (user.id === peer.user.item.id && user.room.id === peer.user.item.room.id) {
                    switch(cmdId) {
                        case Cmds.ECommandId.stream_webrtc_ontrack:
                            StreamWebrtcEvents.onCommand_track(peer, args[0]);
                            break;  
                        case Cmds.ECommandId.stream_webrtc_onstream:                
                            StreamWebrtcEvents.onCommand_stream(peer, args[0]);
                            break;                 
                        case Cmds.ECommandId.stream_webrtc_onaddstream:                
                            StreamWebrtcEvents.onCommand_addstream(peer, args[0]);
                            break;   
                        case Cmds.ECommandId.stream_webrtc_onrecvstream:
                            stream = user.extra;
                            StreamWebrtcEvents.onCommand_recvstream(peer, stream);
                            break;
                        case Cmds.ECommandId.stream_webrtc_onicecandidate:
                            StreamWebrtcEvents.onCommand_icecandidate(peer, args[0]);
                            break; 
                        case Cmds.ECommandId.stream_webrtc_onsendstreaminactive:
                            stream = user.extra;
                            StreamWebrtcEvents.onCommand_sendstreaminactive(peer, stream);
                            break;  
                        case Cmds.ECommandId.stream_webrtc_oniceconnectionstatechange:   
                            StreamWebrtcEvents.onCommand_oniceconnectionstatechange(peer);
                            break;   
                        case Cmds.ECommandId.stream_webrtc_onsignalingstatechange:
                            StreamWebrtcEvents.onCommand_onsignalingstatechange(peer);
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
        let toUser = peer.user;
        let me = peer.user.room.me();
        if (me.item.id === toUser.item.id){
            toUser = peer.user.room.owner()
        }
        return StreamWebrtcCandidate.candidate(peer.instanceId, toUser.item, peer.user.item, data);
    }

    static onCommand_sendstreaminactive = (peer: Modules.Webrtc.IPeer, stream: MediaStream) => {
        ServiceModules.Webrtc.Streams.delSendStream(peer.streams, stream.id);
        let rtc = peer.getRtc(false);
        rtc && rtc.close();
    }
    static onCommand_recvstreaminactive = (peer: Modules.Webrtc.IPeer, stream: MediaStream) => {
        ServiceModules.Webrtc.Streams.delRecvStream(peer.streams, stream.id);
        let rtc = peer.getRtc(false);
        rtc && rtc.close();
    }    

    static onCommand_oniceconnectionstatechange = (peer: Modules.Webrtc.IPeer) => {
        let rtc = peer.getRtc(false);
        if (rtc) {
            let state = rtc.iceConnectionState;
            console.log(Tag, 'Peer', peer.user.item.room.id , 'onCommand_oniceconnectionstatechange', state); 
            if (state == 'disconnected' || state == 'failed') 
                rtc.close();
        }
    }

    static onCommand_onsignalingstatechange = (peer: Modules.Webrtc.IPeer) => {
        let rtc = peer.getRtc(false);
        if (rtc) {
            let state = rtc.signalingState
            console.log(Tag, 'Peer', peer.user.item.room.id , 'onCommand_onsignalingstatechange', state); 
            if (state == 'closed') {
                ServiceModules.Webrtc.Streams.delRecvStream(peer.streams);
                ServiceModules.Webrtc.Streams.delSendStream(peer.streams);                
            }
        }        
    }
}