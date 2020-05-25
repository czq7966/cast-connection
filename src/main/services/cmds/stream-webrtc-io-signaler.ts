import * as Cmds from "../../cmds";
import * as Modules from '../../modules'

var Tag = "Service-Cmds-StreamIOSignaler"
export class StreamIOSignaler extends Cmds.Common.Base {
    static signaler = {
        onAfterRoot: {
            req(signaler: Modules.Webrtc.IO.ISignaler, cmd: Cmds.CommandReq) {
                let data = cmd.data;
                let cmdId = data.cmdId;
                switch(cmdId) {
                    case Cmds.ECommandId.stream_webrtc_ondatachanneladd:
                        StreamIOSignaler.onCommand_datachanneladd(signaler, data.extra);
                        break;                      
                    case Cmds.ECommandId.stream_webrtc_ondatachannelclose:
                        StreamIOSignaler.onCommand_datachannelclose(signaler, data.extra);
                        break;    
                    case Cmds.ECommandId.stream_webrtc_ondatachannelopen:
                        StreamIOSignaler.onCommand_datachannelopen(signaler, data.extra);
                        break;                                                 
                    default:
                        break;
                }                
            }                 
        },        
    }  
    static onCommand_datachanneladd(signaler: Modules.Webrtc.IO.ISignaler, label: string) {
        if (Modules.Webrtc.IO.EDataChannelLabel.signaler === label) {
            adhoc_cast_connection_console.log(Tag, 'Signaler', signaler.peer.user.item, 'onCommand_datachanneladd', 'Req', label);                 
            let datachannel = signaler.peer.datachannels.getDataChannel(label);
            signaler.setDataChannel(datachannel)
        }        
    }
    static onCommand_datachannelclose(signaler: Modules.Webrtc.IO.ISignaler, label: string) {        
        if (signaler.datachannel.rtcdatachannel.label === label) {
            adhoc_cast_connection_console.log(Tag, 'Signaler', signaler.peer.user.item, 'onCommand_datachannelclose', 'Req', label);     
            signaler.onDataChannelClose();
        }
    }           
    static onCommand_datachannelopen(signaler: Modules.Webrtc.IO.ISignaler, label: string) {        
        if (signaler.datachannel.rtcdatachannel.label === label) {
            adhoc_cast_connection_console.log(Tag, 'Signaler', signaler.peer.user.item, 'onCommand_datachannelopen', 'Req', label);     
            signaler.onDataChannelOpen();
        }
    }               
}