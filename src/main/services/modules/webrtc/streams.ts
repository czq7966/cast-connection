import * as Cmds from "../../../cmds";
import * as Modules from '../../../modules'
import * as ServiceCmds from '../../cmds/index'



var Tag = "Service-Module-Streams"
export class Streams{
    static addSendStream(streams: Modules.Webrtc.IStreams, stream: MediaStream) {
        streams.sends.add(stream.id, stream);
        let onInactive = (ev) => {
            stream.removeEventListener('inactive', onInactive);  
            streams.notDestroyed && 
            ServiceCmds.StreamWebrtcEvents.dispatchEventCommand(streams.peer, stream, Cmds.ECommandId.stream_webrtc_onsendstreaminactive);
        }
        stream.addEventListener('inactive', onInactive);   
    }
    static delSendStream(streams: Modules.Webrtc.Streams, id: string) {
        streams.sends.del(id);
    }    

    static addRecvStream(streams: Modules.Webrtc.Streams, stream: MediaStream) {
        streams.recvs.add(stream.id, stream);
        let onInactive = (ev) => {
            stream.removeEventListener('inactive', onInactive);              
            streams.notDestroyed && 
            ServiceCmds.StreamWebrtcEvents.dispatchEventCommand(streams.peer, stream, Cmds.ECommandId.stream_webrtc_onrecvstreaminactive);
        }
        stream.addEventListener('inactive', onInactive);   
    }
    static delRecvStream(streams: Modules.Webrtc.Streams, id: string) {
        streams.recvs.del(id);
    }        
}