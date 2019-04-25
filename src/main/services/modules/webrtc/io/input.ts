import * as Cmds from "../../../../cmds";
import * as Modules from '../../../../modules'
import * as ServiceCmds from '../../../cmds/index'



var Tag = "Service-Module-IO-Input"
export class Input{
    static dataChannelMessage(input: Modules.Webrtc.IO.IInput, evt: MessageEvent) {
        evt.data && 
        this.dataChannelInputEvent(input, JSON.parse(evt.data) as any)
    }
    static dataChannelInputEvent(input: Modules.Webrtc.IO.IInput, evt: Modules.Webrtc.IO.IInputEvent) {
        let streams = input.peer.user.room.owner().peer.streams;        
        streams.sends.keys().forEach(key => {
            let stream = streams.sends.get(key);
            let resolution = streams.resolutions.get(stream.id);
            if (!resolution) {
                let videoTracks = stream.getVideoTracks();
                if (videoTracks.length > 0) {
                    let videoTrack = videoTracks[0]
                    let capb = videoTrack.getCapabilities();
                    resolution = {width: capb.width && capb.width['max'] || capb.width, height: capb.height && capb.height['max'] || capb.height}
                    streams.resolutions.add(stream.id, resolution)                    
                }
            }
            if (resolution) {
                evt.sourceX = resolution.width || evt.sourceX;
                evt.sourceY = resolution.height || evt.sourceY;
            }
        })
        input.inputEvent(evt);        
    }
    static dispatchInputEvent(input: Modules.Webrtc.IO.IInput, evt: Modules.Webrtc.IO.IInputEvent) {
        ServiceCmds.User.dispatchCommand(input.instanceId, input.peer.user.item, null, evt, Cmds.ECommandId.stream_webrtc_io_input)
    }
}