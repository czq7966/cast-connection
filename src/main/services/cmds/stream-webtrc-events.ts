import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules/index'
import {StreamWebrtcCandidate } from './stream-webtrc-candidate'
import { StreamWebrtcReady } from "./stream-webtrc-ready";

var Tag = "Service-Cmds-StreamWebrtcEvents"
export class StreamWebrtcEvents {
    static Peer = {
        onAfterRoot: {
            req(peer: Modules.Webrtc.IPeer, cmd: Cmds.Common.ICommand) {
                let data: Cmds.ICommandData<Cmds.ICommandReqDataProps> = cmd.data;
                let cmdId = data.cmdId;
                let user = data.props.user;
                let args: any[] = user.extra;
                if (user.id === peer.user.item.id && user.room.id === peer.user.item.room.id) {
                    switch(cmdId) {
                        case Cmds.ECommandId.stream_webrtc_ontrack:
                            StreamWebrtcEvents.onCommand_peer_track(peer, args[0]);
                            break;  
                        case Cmds.ECommandId.stream_webrtc_onstream:                
                            StreamWebrtcEvents.onCommand_peer_stream(peer, args[0]);
                            break;                 
                        case Cmds.ECommandId.stream_webrtc_onaddstream:                
                            StreamWebrtcEvents.onCommand_peer_addstream(peer, args[0]);
                            break;   
                        case Cmds.ECommandId.stream_webrtc_onicecandidate:
                            StreamWebrtcEvents.onCommand_peer_icecandidate(peer, args[0]);
                            break;  
                        case Cmds.ECommandId.stream_webrtc_onconnectionstatechange:   
                            StreamWebrtcEvents.onCommand_peer_connectionstatechange(peer);
                            break;                               
                        case Cmds.ECommandId.stream_webrtc_oniceconnectionstatechange:   
                            StreamWebrtcEvents.onCommand_peer_iceconnectionstatechange(peer);
                            break;   
                        case Cmds.ECommandId.stream_webrtc_onsignalingstatechange:
                            StreamWebrtcEvents.onCommand_peer_signalingstatechange(peer);
                            break;   
                        case Cmds.ECommandId.stream_webrtc_onsendstreaminactive:
                            StreamWebrtcEvents.onCommand_peer_sendstreaminactive(peer);
                            break;  
                        case Cmds.ECommandId.stream_webrtc_onrecvstreaminactive:
                            StreamWebrtcEvents.onCommand_peer_recvstreaminactive(peer);
                            break;                                                                                                                                          
                        default:
                            break;
                    }  
                }                 
            }                    
        }      
    }      

    static Streams = {
        onAfterRoot: {
            req(streams: Modules.Webrtc.IStreams, cmd: Cmds.Common.ICommand) {
                let data: Cmds.ICommandData<Cmds.ICommandReqDataProps> = cmd.data;
                let cmdId = data.cmdId;
                let user = data.props.user;
                if (user.id === streams.peer.user.item.id && user.room.id === streams.peer.user.item.room.id) {
                    switch(cmdId) {
                        case Cmds.ECommandId.stream_webrtc_onrecvstream:
                            StreamWebrtcEvents.onCommand_streams_recvstream(streams, user.extra);
                            break;    
                        case Cmds.ECommandId.stream_webrtc_onsendstreaminactive:
                            StreamWebrtcEvents.onCommand_streams_sendstreaminactive(streams, user.extra);
                            break;   
                        case Cmds.ECommandId.stream_webrtc_onrecvstreaminactive:
                            StreamWebrtcEvents.onCommand_streams_recvstreaminactive(streams, user.extra);
                            break;                                                                            
                        default:
                            break;
                    }  
                }                 
            }                    
        }      
    }   

    static dispatchEventCommand(peer: Modules.Webrtc.IPeer, cmdId: Cmds.ECommandId, dataExtra: any, propExtra: any, userExtra: any) {
        let user = Object.assign({}, peer.user.item);
        user.extra = userExtra;
        let data: Cmds.ICommandData<Cmds.ICommandReqDataProps> = {
            cmdId: cmdId,
            props: {
                user: user,
                extra: propExtra
            },
            extra: dataExtra
        }
        peer.user.room.rooms.dispatcher.onCommand(data)        
    }
    static onCommand_peer_track(peer: Modules.Webrtc.IPeer, ev: RTCTrackEvent) {
        adhoc_cast_connection_console.log(Tag, 'Peer', peer.user.item.room.id , 'onCommand_peer_track', peer.user); 
        let streams = ev.streams;
        streams.forEach(stream => {    
            !peer.streams.recvs.exist(stream.id) &&
            this.dispatchEventCommand(peer, Cmds.ECommandId.stream_webrtc_onrecvstream, null, null, stream);
        })
    }
    static onCommand_peer_stream (peer: Modules.Webrtc.IPeer,ev: any)  {        
        adhoc_cast_connection_console.log(Tag, 'Peer', peer.user.item.room.id , 'onCommand_peer_stream', peer.user); 
        let stream = ev.stream as MediaStream;
        !peer.streams.recvs.exist(stream.id) &&
        this.dispatchEventCommand(peer, Cmds.ECommandId.stream_webrtc_onrecvstream, null, null, stream);        
    }
    static onCommand_peer_addstream(peer: Modules.Webrtc.IPeer,ev: Event) {
        adhoc_cast_connection_console.log(Tag, 'Peer', peer.user.item.room.id , 'onCommand_peer_addstream', peer.user); 
        let stream = ev['stream'] as MediaStream;
        !peer.streams.recvs.exist(stream.id) &&
        this.dispatchEventCommand(peer, Cmds.ECommandId.stream_webrtc_onrecvstream, null, null, stream);
    }   
    static onCommand_peer_icecandidate = (peer: Modules.Webrtc.IPeer, ev: RTCPeerConnectionIceEvent): Promise<any> => {
        adhoc_cast_connection_console.log(Tag, 'Peer', peer.user.item.room.id , 'onCommand_peer_icecandidate', peer.user); 
        let data;
        if (ev.candidate) {
            if (ev.candidate.toJSON)
                data = ev.candidate.toJSON();
            else 
                data = ev.candidate;
        }
        let toUser = peer.user;
        let me = peer.user.room.me();
        if (me.item.id === toUser.item.id){
            toUser = peer.user.room.owner()
        }
        return StreamWebrtcCandidate.candidate(peer.instanceId, toUser.item, peer.user.item, data);
    }
    static onCommand_peer_connectionstatechange = (peer: Modules.Webrtc.IPeer) => {
        let rtc = peer.getRtc(false);
        if (rtc) {
            let state = rtc.connectionState;
            if (state == 'connected') 
                peer.user.states.set(Cmds.EUserState.stream_room_sending)
            else 
                peer.user.states.reset(Cmds.EUserState.stream_room_sending);
            
            adhoc_cast_connection_console.log(Tag, 'Peer', peer.user.item.room.id , 'onCommand_onconnectionstatechange', state); 
        }
    }    
    static onCommand_peer_iceconnectionstatechange = (peer: Modules.Webrtc.IPeer) => {
        let rtc = peer.getRtc(false);
        if (rtc) {
            let state = rtc.iceConnectionState;
            adhoc_cast_connection_console.log(Tag, 'Peer', peer.user.item.room.id , 'onCommand_oniceconnectionstatechange', state); 
            if (state === 'failed' && rtc.connectionState !== 'closed' && rtc.signalingState !== 'closed') {
                if (peer.streams.recvs.count() > 0) {
                    adhoc_cast_connection_console.log(Tag, 'Peer', peer.user.item.room.id , 'onCommand_oniceconnectionstatechange', 'Ice Restart'); 
                    let toUser = peer.user.room.owner()
                    StreamWebrtcReady.ready(peer.instanceId, toUser.item, peer.user.item, true)
                    .catch(err => {
                        if (peer.notDestroyed) {
                            rtc.close();
                        }
                    })
                }
            }
        }
    }
    static onCommand_peer_signalingstatechange = (peer: Modules.Webrtc.IPeer) => {
        let rtc = peer.getRtc(false);
        if (rtc) {
            let state = rtc.signalingState;
            if (!rtc.connectionState) {
                if (state == 'stable') 
                    peer.user.states.set(Cmds.EUserState.stream_room_sending)
                else 
                    peer.user.states.reset(Cmds.EUserState.stream_room_sending);
            }
            adhoc_cast_connection_console.log(Tag, 'Peer', peer.user.item.room.id , 'onCommand_onsignalingstatechange', state); 
        }        
    }
    static onCommand_peer_sendstreaminactive = (peer: Modules.Webrtc.IPeer) => {
        adhoc_cast_connection_console.log(Tag, 'Peer', peer.user.item.room.id , 'onCommand_peer_sendstreaminactive', peer.user); 
        let rtc = peer.getRtc(false);
        rtc && rtc.close();
    } 
    static onCommand_peer_recvstreaminactive = (peer: Modules.Webrtc.IPeer) => {
        adhoc_cast_connection_console.log(Tag, 'Peer', peer.user.item.room.id , 'onCommand_peer_recvstreaminactive', peer.user); 
        let rtc = peer.getRtc(false);
        rtc && rtc.close();
    }   




    // Streams
    static onCommand_streams_recvstream(streams: Modules.Webrtc.IStreams, stream: MediaStream) {
        adhoc_cast_connection_console.log(Tag, 'Streams', streams.peer.user.item.room.id , 'onCommand_streams_recvstream', streams.peer.user); 
        ServiceModules.Webrtc.Streams.addRecvStream(streams, stream);
    }       
    static onCommand_streams_sendstreaminactive = (streams: Modules.Webrtc.IStreams, stream: MediaStream) => {
        adhoc_cast_connection_console.log(Tag, 'Streams', streams.peer.user.item.room.id , 'onCommand_streams_sendstreaminactive', streams.peer.user); 
        ServiceModules.Webrtc.Streams.delSendStream(streams, stream.id);
    }    
    static onCommand_streams_recvstreaminactive = (streams: Modules.Webrtc.IStreams, stream: MediaStream) => {
        adhoc_cast_connection_console.log(Tag, 'Streams', streams.peer.user.item.room.id , 'onCommand_streams_recvstreaminactive', streams.peer.user); 
        ServiceModules.Webrtc.Streams.delRecvStream(streams, stream.id);
    }      
}