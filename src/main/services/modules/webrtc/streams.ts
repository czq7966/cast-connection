import * as Cmds from "../../../cmds";
import * as Modules from '../../../modules'
import * as ServiceCmds from '../../cmds/index'



var Tag = "Service-Module-Streams"
export class Streams{
    static addSendStream(streams: Modules.Webrtc.IStreams, stream: MediaStream) {
        streams.sends.add(stream.id, stream);
        let onInactive = (ev) => {
            stream.removeEventListener('inactive', onInactive);              
            streams.notDestroyed && streams.sends.exist(stream.id) &&
            ServiceCmds.StreamWebrtcEvents.dispatchEventCommand(streams.peer, Cmds.ECommandId.stream_webrtc_onsendstreaminactive, null, null, stream);
        }
        stream.addEventListener('inactive', onInactive);           
    }
    static delSendStream(streams: Modules.Webrtc.IStreams, id?: string) {
        if (id) {
            streams.sends.del(id);
            streams.resolutions.del(id);
        } else {
            streams.sends.keys().forEach(key => {
                this.delSendStream(streams, streams.sends.get(key).id)
            })
        }
    }    

    static addRecvStream(streams: Modules.Webrtc.IStreams, stream: MediaStream) {
        streams.recvs.add(stream.id, stream);
        let onInactive = (ev) => {
            stream.removeEventListener('inactive', onInactive);              
            streams.notDestroyed &&  streams.recvs.exist(stream.id) &&
            ServiceCmds.StreamWebrtcEvents.dispatchEventCommand(streams.peer, Cmds.ECommandId.stream_webrtc_onrecvstreaminactive, null, null, stream);
        }
        stream.addEventListener('inactive', onInactive);   
    }
    static delRecvStream(streams: Modules.Webrtc.IStreams, id?: string) {
        if (id) {
            streams.recvs.del(id);
            streams.resolutions.del(id);
        } else {
            streams.recvs.keys().forEach(key => {
                this.delRecvStream(streams, streams.sends.get(key).id)
            })
        }
    }      
    static closeRecvStream(streams: Modules.Webrtc.IStreams, id?: string) {
        if (id) {
            let stream = streams.recvs.get(id);
            if (stream) {
                stream.getTracks().forEach(track => {
                    track.stop();
                })
            }

        } else {
            streams.recvs.keys().forEach(key => {
                this.closeRecvStream(streams, key)
            })
        }
    }       
}