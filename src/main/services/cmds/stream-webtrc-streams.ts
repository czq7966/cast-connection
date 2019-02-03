import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules/index'
import { User } from "./user";
import { StreamWebrtcSdp } from './stream-webtrc-sdp'
import {StreamWebrtcCandidate } from './stream-webtrc-candidate'

var Tag = "Service-Cmds-StreamWebrtcEvents"
export class StreamWebrtcStreams {
    static sendingStream(streams: Modules.Webrtc.IStreams, stream: MediaStream) {
        ServiceModules.Webrtc.Streams.addSendStream(streams, stream);
        let instanceId = streams.instanceId;        
        let mUser = ServiceModules.Rooms.getLoginRoom(instanceId).getUser(streams.peer.user.item.id)
        mUser.states.set(Cmds.EUserState.stream_room_sending);
        User.syncHello(instanceId, mUser.item);
    }
    static sendStream(streams: Modules.Webrtc.IStreams, stream: MediaStream): Promise<any> {
        ServiceModules.Webrtc.Streams.addSendStream(streams, stream);        
        let mUser = streams.peer.user;
        let mRoom = mUser.room;
        let peer = mUser.peer;
        let mMe = mRoom.me();
        if (mMe.item.id === mUser.item.id) {
            // let promises = [];
            // mRoom.users.keys().forEach(key => {
            //     let nUser = mRoom.getUser(key);
            //     if (nUser.item.id !== mUser.item.id) {
            //         let promise = this.sendStream(nUser.getPeer().streams, stream);
            //         promises.push(promise);
            //     }
            // })
            // return Promise.all(promises);
            console.warn('Can not send stream to self!')
            
        } else {
            (peer.getRtc() as any).addStream(stream);
            let promise = StreamWebrtcSdp.offer(mUser);            
            return promise;
        }
    }
}