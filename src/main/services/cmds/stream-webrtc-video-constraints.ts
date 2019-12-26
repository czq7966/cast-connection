import * as Cmds from "../../cmds";
import * as Modules from '../../modules'
import * as ServiceModules from '../modules/index'
import { Common } from "./common";
import { User } from "./user";
import { StreamWebrtcSdp } from './stream-webtrc-sdp'

var Tag = "Service-Cmds-StreamWebrtcVideoConstraints"
export class StreamWebrtcVideoConstraints {
    static applyConstraints(instanceId: string, toUser: Cmds.IUser, fromUser?: Cmds.IUser, constraints?: MediaTrackConstraints): Promise<any> {
        let mRoom = ServiceModules.Rooms.getRoom(instanceId, toUser.room.id);
        if (!mRoom || !mRoom.notDestroyed) {
            return Promise.reject("have been destroyed for some reason!");
        }

        fromUser = fromUser || mRoom.me().item;
        let user = Object.assign({}, fromUser);
        let reqData: Cmds.Common.ICommandData<Cmds.ICommandReqDataProps> = {
            cmdId: Cmds.ECommandId.stream_webrtc_video_constraints,
            to: {type: 'user', id: toUser.id},
            props: {
                user: user
            },
            extra: constraints
        }
        return Common.sendCommand(instanceId, reqData);
    }


    static Streams = {
        onBeforeRoot: {
            req(streams: Modules.Webrtc.IStreams, cmd: Cmds.CommandReq) {
                adhoc_cast_connection_console.log(Tag, 'Streams', streams.peer.user.item, 'onAfterRoot', 'Req', cmd.data)
                let constraints: MediaTrackConstraints = cmd.data.extra;
                ServiceModules.Webrtc.Streams.applyStreamsVideoConstraints(streams, constraints);
            }                
        }, 
    }

}