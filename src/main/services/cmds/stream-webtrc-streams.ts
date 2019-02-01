import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules/index'
import { StreamWebrtcSdp } from './stream-webtrc-sdp'
import {StreamWebrtcCandidate } from './stream-webtrc-candidate'

var Tag = "Service-Cmds-StreamWebrtcEvents"
export class StreamWebrtcStreams {
    static sendStream(streams: Modules.Webrtc.IStreams, stream: MediaStream) {
        ServiceModules.Webrtc.Streams.addSendStream(streams, stream);        
        let mUser = streams.peer.user;
        let mRoom = mUser.room;
        let peer = mUser.peer;
        let me = mRoom.me();
        if (me.item.id === mUser.item.id) {
            let promises = [];
            mRoom.users.keys().forEach(key => {
                let nUser = mRoom.getUser(key);
                if (nUser.item.id !== mUser.item.id) {
                    let promise = this.sendStream(nUser.getPeer().streams, stream);
                    promises.push(promise);
                }
            })
            return Promise.all(promises);
            
        } else {
            (peer.getRtc() as any).addStream(stream);
            let promise = StreamWebrtcSdp.offer(mUser);            
            return promise;
        }
    }
}