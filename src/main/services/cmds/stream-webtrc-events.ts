import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules/index'

var Tag = "Service-Cmds-StreamWebrtcEvents"
export class StreamWebrtcEvents {
    static Peer = {
        onBeforeDispatched: {
            req(peer: Modules.IPeer, cmd: Cmds.CommandStreamWebrtcEventsReq) {
                let data = cmd.data;
                let mUser = peer.user;
                let user = data.props.user;
                if (mUser.item.id === user.id && mUser.item.room.id === user.room.id) {
                    console.log(Tag, 'Peer', mUser.item.room.id , 'onBeforeDispatched', 'Req', cmd.data);                    
                    let cmdId = data.cmdId;
                    switch(cmdId) {
                        case Cmds.ECommandId.stream_webrtc_ontrack:
                            let args: any[] = user.extra;
                            StreamWebrtcEvents.onTrack(peer, cmd, args[0]);
                            break;

                        this.eventEmitter.addListener(ERTCPeerEvents.ontrack, this.onTrack)
                        this.eventEmitter.addListener(ERTCPeerEvents.onstream, this.onStream)        
                        this.eventEmitter.addListener(ERTCPeerEvents.onaddstream, this.onAddStream)      
                        this.eventEmitter.addListener(ERTCPeerEvents.onicecandidate, this.onIceCandidate)   

                        default:
                            break;
                    }
                }                  
            }                    
        },        
    }      

    static onTrack(peer: Modules.IPeer, cmd: Cmds.CommandStreamWebrtcEventsReq, ev: RTCTrackEvent) {
        let streams = ev.streams;
        streams.forEach(stream => {            
            peer.streams.addRecvStream(stream)
        })
    }

}