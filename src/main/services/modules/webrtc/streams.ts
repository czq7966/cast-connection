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
            ServiceCmds.StreamWebrtcEvents.dispatchEventCommand(streams.peer, stream, Cmds.ECommandId.stream_webrtc_onsendstreaminactive);
        }
        stream.addEventListener('inactive', onInactive);           
    }
    static delSendStream(streams: Modules.Webrtc.IStreams, id?: string) {
        if (id) {
            streams.sends.del(id);
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
            ServiceCmds.StreamWebrtcEvents.dispatchEventCommand(streams.peer, stream, Cmds.ECommandId.stream_webrtc_onrecvstreaminactive);
        }
        stream.addEventListener('inactive', onInactive);   
    }
    static delRecvStream(streams: Modules.Webrtc.IStreams, id?: string) {
        if (id) {
            streams.recvs.del(id);
        } else {
            streams.sends.keys().forEach(key => {
                this.delRecvStream(streams, streams.sends.get(key).id)
            })
        }
    }      
}