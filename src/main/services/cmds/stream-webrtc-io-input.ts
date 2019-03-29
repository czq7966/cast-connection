import * as Cmds from "../../cmds";
import * as Modules from '../../modules'

var Tag = "Service-Cmds-StreamIOInput"
export class StreamIOInput extends Cmds.Common.Base {
    static InputClient = {
        onAfterRoot: {
            req(inputClient: Modules.Dispatchers.IInputClientFilter, cmd: Cmds.ICommandData<any>) {
                inputClient.sendCommand(cmd)
                .catch(err => {})       
            }                 
        },       
    }
    static Input = {
        onAfterRoot: {
            req(input: Modules.Webrtc.IO.IInput, cmd: Cmds.CommandReq) {
                let data = cmd.data;
                let cmdId = data.cmdId;
                switch(cmdId) {
                    case Cmds.ECommandId.stream_webrtc_ondatachanneladd:
                        StreamIOInput.onCommand_datachanneladd(input, data.extra);
                        break;                      
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
    static onCommand_datachanneladd(input: Modules.Webrtc.IO.IInput, label: string) {
        if (Modules.Webrtc.IO.EDataChannelLabel.input === label) {
            adhoc_cast_connection_console.log(Tag, 'Input', input.peer.user.item, 'onCommand_datachanneladd', 'Req', label);                 
            let datachannel = input.peer.datachannels.getDataChannel(label);
            input.setDataChannel(datachannel)
        }        
    }
    static onCommand_datachannelclose(input: Modules.Webrtc.IO.IInput, label: string) {        
        if (input.datachannel.rtcdatachannel.label === label) {
            adhoc_cast_connection_console.log(Tag, 'Input', input.peer.user.item, 'onCommand_datachannelclose', 'Req', label);     
            input.onDataChannelClose();
        }
    }           
    static onCommand_datachannelopen(input: Modules.Webrtc.IO.IInput, label: string) {        
        if (input.datachannel.rtcdatachannel.label === label) {
            adhoc_cast_connection_console.log(Tag, 'Input', input.peer.user.item, 'onCommand_datachannelopen', 'Req', label);     
            input.onDataChannelOpen();
        }
    }               
}