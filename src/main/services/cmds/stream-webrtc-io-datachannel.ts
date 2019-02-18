import * as Cmds from "../../cmds";
import * as Modules from '../../modules'

var Tag = "Service-Cmds-StreamIODataChannel"
export class StreamIODataChannel {
    static DataChannel = {
        onAfterRoot: {
            req(datachannel: Modules.Webrtc.IO.IDataChannel, cmd: Cmds.CommandReq) {
                console.log(Tag, 'DataChannel', datachannel.datachannels.peer.user.item.id, 'onAfterRoot', 'Req', cmd.data);
                let data = cmd.data;
                let cmdId = data.cmdId;
                let user = data.props.user;
                let args: any[] = user.extra;
                switch(cmdId) {
                    case Cmds.ECommandId.stream_webrtc_ondatachannelopen:
                        StreamIODataChannel.onCommand_datachannelopen(datachannel);
                        break;  
                    default:
                        break;
                } 
            }                  
        },  
    }       
    static onCommand_datachannelopen(datachannel: Modules.Webrtc.IO.IDataChannel) {

    }
}