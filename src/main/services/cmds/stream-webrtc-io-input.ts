import * as Cmds from "../../cmds";
import * as Modules from '../../modules'

var Tag = "Service-Cmds-StreamIOInput"
export class StreamIOInput extends Cmds.Common.Base {
    static Input = {
        onBeforeRoot: {
            req(input: Modules.Webrtc.IO.IInput, cmd: Cmds.CommandReq) {
                let data = cmd.data;
                let cmdId = data.cmdId;
                switch(cmdId) {
                    case Cmds.ECommandId.stream_webrtc_ondatachannel:
                        StreamIOInput.onCommand_datachannel(input, data.extra);
                        break;                          
                    default:
                        break;
                }              
            }                  
        },         
        onAfterRoot: {
            req(input: Modules.Webrtc.IO.IInput, cmd: Cmds.CommandReq) {
                let data = cmd.data;
                let cmdId = data.cmdId;
                switch(cmdId) {
                    case Cmds.ECommandId.stream_webrtc_ondatachannelclose:
                        StreamIOInput.onCommand_datachannelclose(input, data.extra);
                        break;    
                    case Cmds.ECommandId.stream_webrtc_ondatachannelopen:
                        StreamIOInput.onCommand_datachannelopen(input, data.extra);
                        break;                                                 
                    default:
                        break;
                }                
            }                 
        },        
    }  
    static onCommand_datachannel(input: Modules.Webrtc.IO.IInput, label: string) {
        console.log(Tag, 'Input', input.peer.user.item.id, 'onCommand_datachannel', 'Req', label);     
        if (label !== Modules.Webrtc.IO.EDataChannelLabel.input) {
            let datachannel = input.peer.datachannels.getDataChannel(label);
            input.setDataChannel(datachannel)
        }
        
    }
    static onCommand_datachannelclose(input: Modules.Webrtc.IO.IInput, label: string) {
        console.log(Tag, 'Input', input.peer.user.item.id, 'onCommand_datachannelclose', 'Req', label);     
        if (input.datachannel.rtcdatachannel.label === label) {
            input.onDataChannelClose();
        }
    }           
    static onCommand_datachannelopen(input: Modules.Webrtc.IO.IInput, label: string) {
        console.log(Tag, 'Input', input.peer.user.item.id, 'onCommand_datachannelopen', 'Req', label);     
        if (input.datachannel.rtcdatachannel.label === label) {
            input.onDataChannelOpen();
        }
    }               
}