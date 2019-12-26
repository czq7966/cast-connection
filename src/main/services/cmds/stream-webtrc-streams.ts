import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules/index'
import { User } from "./user";
import { StreamWebrtcSdp } from './stream-webtrc-sdp'

var Tag = "Service-Cmds-StreamWebrtcEvents"
export class StreamWebrtcStreams {
    static sendingStream(streams: Modules.Webrtc.IStreams, stream: MediaStream): Promise<any> {
        stream && ServiceModules.Webrtc.Streams.addSendStream(streams, stream);
        let mRoom = streams.peer.user.room;
        let mpRoom = ServiceModules.Room.getParent(mRoom)
        let instanceId = streams.instanceId;        
        let mUser = mpRoom.getUser(streams.peer.user.item.id)
        if (streams.sends.count() > 0) {
            mUser.states.set(Cmds.EUserState.stream_room_sending)
        } else {
            mUser.states.reset(Cmds.EUserState.stream_room_sending);
            mUser.states.reset(Cmds.EUserState.touchback);
        }
        return User.syncHello(instanceId, mUser.item);
    }
    static sendStream(streams: Modules.Webrtc.IStreams, stream: MediaStream): Promise<any> {
        let mUser = streams.peer.user;
        let mRoom = mUser.room;
        let peer = mUser.peer;
        let mMe = mRoom.me();
        if (mMe.item.id === mUser.item.id) {
            let msg = 'Can not send stream to self!';
            adhoc_cast_connection_console.warn(msg)
            return Promise.reject(msg)            
        } else {
            if (!streams.sends.exist(stream.id)) {
                ServiceModules.Webrtc.Streams.addSendStream(streams, stream);            
                (peer.getRtc() as any).addStream(stream);
                peer.getRtc().getSenders().forEach(sender => {
                    let parameters = sender.getParameters();
                    parameters.degradationPreference = "maintain-resolution";
                })
                peer.createDataChannels();
            }
            let promise = StreamWebrtcSdp.offer(mUser);            
            return promise;
        }
    }
}