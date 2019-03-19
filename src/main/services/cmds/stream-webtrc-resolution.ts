import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules/index'
import { User } from "./user";
import { StreamWebrtcSdp } from './stream-webtrc-sdp'

var Tag = "Service-Cmds-StreamWebrtcEvents"
export class StreamWebrtcResolution {
    static Streams = {
        onBeforeRoot: {
            req(streams: Modules.Webrtc.IStreams, cmd: Cmds.CommandReq) {
                adhoc_cast_connection_console.log(Tag, 'Streams', streams.peer.user.item, 'onBeforeRoot', 'Req', cmd.data)
                let resolutions:  {[key: string]: Modules.Webrtc.IStreamResolution} = cmd.data.extra;
                Object.keys(resolutions).forEach(key => {
                    streams.resolutions.add(key, resolutions[key])
                })
            }                
        }, 
    }

}