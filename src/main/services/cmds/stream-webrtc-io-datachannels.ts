import * as Cmds from "../../cmds";
import * as Modules from '../../modules'

var Tag = "Service-Cmds-StreamIODataChannels"
export class StreamIODataChannels extends Cmds.Common.Base {
    static DataChannels = {
        onBeforeRoot: {
            req(datachannels: Modules.Webrtc.IO.IDataChannels, cmd: Cmds.CommandReq) {
                let data = cmd.data;
                let cmdId = data.cmdId;
                let user = data.props.user;
                let args: any[] = user.extra;
                switch(cmdId) {
                    case Cmds.ECommandId.stream_webrtc_ondatachannel:
                        StreamIODataChannels.onCommand_datachannel(datachannels, args[0]);
                        break;                          
                    default:
                        break;
                } 
            }                  
        },  
        onAfterRoot: {
            req(datachannels: Modules.Webrtc.IO.IDataChannels, cmd: Cmds.CommandReq) {
                console.log(Tag, 'DataChannels', datachannels.peer.user.item, 'onAfterRoot', 'Req', cmd.data);
                let data = cmd.data;
                let cmdId = data.cmdId;
                switch(cmdId) {
                    case Cmds.ECommandId.stream_webrtc_ondatachannelclose:
                        StreamIODataChannels.onCommand_datachannelclose(datachannels, data.extra);
                        break;                          
                    default:
                        break;
                } 
            }                  
        },         
    }       
    static onCommand_datachannel(datachannels: Modules.Webrtc.IO.IDataChannels, ev: RTCDataChannelEvent) {
        console.log(Tag, 'DataChannels', datachannels.peer.user.item, 'onCommand_datachannel', 'Req');        
        datachannels.onDataChannel(ev)
    }
    static onCommand_datachannelclose(datachannels: Modules.Webrtc.IO.IDataChannels, label: string) {
        console.log(Tag, 'DataChannels', datachannels.peer.user.item, 'onCommand_datachannelclose', 'Req');        
        datachannels.closeDataChannel(label)
    }    
}